"""TODO-134 の実測: page.clock で時計を止めてコマ送りで撮れるか。

使い方（yt_slide のチェックアウトで）:
  uv run --extra video --with pillow python archives/agents/TODO-134/framestep_probe.py \
      ~/work/slide_backgammon backgammon OUT_DIR

OUT_DIR に PNG/JPEG と slide3.mp4 を出し、測った値を標準出力に出す。
"""
import base64
import io
import itertools
import json
import pathlib
import subprocess
import sys
import time

from PIL import Image, ImageChops

from ytslide import browser, paths, video

FPS = 30

# 1 コマごとに呼ぶ。CSS transition と element.animate() は page.clock に従わないので、
# 初めて見たときに止め、それ以降は偽の時計の経過で currentTime を合わせる。
SYNC_JS = """() => {
  const now = performance.now();
  window.__seen ??= new WeakMap();
  for (const a of document.getAnimations()) {
    if (!__seen.has(a)) { __seen.set(a, now); a.pause(); }
    const el = now - __seen.get(a);
    const end = a.effect.getComputedTiming().endTime;
    if (el >= end) a.finish(); else a.currentTime = el;
  }
}"""

# 再生中の状態にする（読み上げは鳴らさない。speakCurrentNarration は呼ばない）
PLAY_JS = "() => { isPlaying = true; speechRunId++; }"


class Stepper:
    def __init__(self, page, sync):
        self.page, self.sync, self.ms, self.frame = page, sync, 0, 0

    def start(self, index):
        page = self.page
        now = page.evaluate('Date.now()')
        page.clock.pause_at(now + 1000)
        page.evaluate(video.FIT, index)
        page.clock.run_for(50)          # render の setTimeout を走らせ、narrationClock を起こす（t = null）
        # 画像の読み込みは実時間。Python 側で待つ（wait_for_function は rAF を使うので偽の時計では止まる）
        for _ in range(200):
            if page.evaluate('[...document.images].every(i => i.complete)'):
                break
            time.sleep(0.05)
        page.evaluate(PLAY_JS)
        page.clock.run_for(16)          # 次の rAF で narrationClock が t = 0 にする。ここを読み始めの 0 秒とする
        self.ms = self.frame = 0
        if self.sync:
            page.evaluate(SYNC_JS)

    def seek(self, t):
        """読み始めからの秒 t まで、1 コマ（1/FPS 秒）ずつ時計を進める。

        run_for は整数の ms しか取らないので、コマの時刻は round(k * 1000 / FPS)。
        偽の rAF は 16 ms ごとに回るので、1 コマのあいだに 2 回ほど draw が呼ばれる。
        """
        target = round(t * 1000)
        while self.ms < target:
            nxt = min(target, round((self.frame + 1) * 1000 / FPS))
            self.page.clock.run_for(nxt - self.ms)
            if nxt == round((self.frame + 1) * 1000 / FPS):
                self.frame += 1
            self.ms = nxt
            if self.sync:
                self.page.evaluate(SYNC_JS)

    def shot(self, path=None, **kw):
        return self.page.screenshot(path=path, **kw)


def new_page(b):
    page = b.new_page(viewport={'width': video.WIDTH, 'height': video.HEIGHT})
    page.clock.install()
    page.goto(f'{BASE}/player.html?slides={SLIDES}')
    page.wait_for_load_state('networkidle')
    return page


def diff(a, b):
    """変化した画素数（どれかの色が 16 を超えて違う画素）。"""
    ia, ib = (Image.open(io.BytesIO(x)).convert('RGB') for x in (a, b))
    d = ImageChops.difference(ia, ib).convert('L').point(lambda v: 255 if v > 16 else 0)
    return d.histogram()[255]


def shots_at(b, index, times, sync, extra_js=None):
    page = new_page(b)
    s = Stepper(page, sync)
    s.start(index)
    out = {}
    for t in times:
        s.seek(t)
        info = page.evaluate(extra_js) if extra_js else None
        out[t] = (s.shot(), info)
    page.close()
    return out


def report_diffs(name, shots):
    ts = list(shots)
    print(f'## {name}')
    for t in ts:
        if shots[t][1] is not None:
            print(f'  t={t}: {json.dumps(shots[t][1], ensure_ascii=False)}')
    for a, c in itertools.pairwise(ts):
        print(f'  diff t={a} -> t={c}: {diff(shots[a][0], shots[c][0])} px')


def main():
    global BASE, SLIDES
    root, SLIDES, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
    out.mkdir(parents=True, exist_ok=True)
    paths.set_root(root)
    with browser.serve_root() as BASE, browser.chromium() as b:
        # 0. 偽の時計が performance.now と rAF に効くか
        page = new_page(b)
        page.clock.pause_at(page.evaluate('Date.now()') + 1000)
        p0 = page.evaluate('performance.now()')
        page.evaluate('window.__raf = 0; (function f(){ __raf++; requestAnimationFrame(f); })()')
        page.clock.run_for(1000)
        print('## clock', json.dumps({'perf_now_advanced_ms': page.evaluate('performance.now()') - p0,
                                      'raf_calls_in_1s': page.evaluate('__raf')}))
        page.close()

        # 1. 3 枚目（historyGrow）と 4 枚目（cueDrop）
        line = "(() => getComputedStyle(document.getElementById('history-line')).clipPath)()"
        r = shots_at(b, 2, [0, 8, 10, 15], sync=False, extra_js=line)
        for t, (png, _) in r.items():
            pathlib.Path(out / f's3_t{t}.png').write_bytes(png)
        report_diffs('slide3 historyGrow (sync=False)', r)
        photos = ("(() => [...document.querySelectorAll('#world-photos [data-cue]')]"
                  ".map(e => getComputedStyle(e).opacity))()")
        r = shots_at(b, 3, [0, 0.5, 2, 8, 10, 15], sync=False, extra_js=photos)
        for t, (png, _) in r.items():
            pathlib.Path(out / f's4_t{t}.png').write_bytes(png)
        report_diffs('slide4 cueDrop (sync=False)', r)

        # 2. cueSay の transition（data-say="4" の札が 4.0 秒で強調）
        card = ("(() => { const e = document.querySelector('#world-say [data-say=\"4\"]');"
                " return {boxShadow: getComputedStyle(e).boxShadow,"
                " anims: e.getAnimations().map(a => ({type: a.constructor.name, state: a.playState,"
                " currentTime: a.currentTime}))}; })()")
        for sync in (False, True):
            r = shots_at(b, 3, [3.9, 4.15, 4.6], sync=sync, extra_js=card)
            for t, (png, _) in r.items():
                pathlib.Path(out / f's4_say_sync{int(sync)}_t{t}.png').write_bytes(png)
            report_diffs(f'slide4 cueSay transition (sync={sync})', r)

        # 3. rAF 回しっぱなし（2 枚目）と element.animate（9 枚目）
        r = shots_at(b, 1, [0, 0.5, 1, 2], sync=False)
        report_diffs('slide2 rulesBattle (sync=False)', r)
        tw = "(() => document.getAnimations().map(a => [a.playState, Math.round(a.currentTime)]))()"
        for sync in (False, True):
            r = shots_at(b, 8, [0, 0.5, 1, 2], sync=sync, extra_js=tw)
            report_diffs(f'slide9 karenaTwinkle (sync={sync})', r)
        # finish() のあと onfinish が来て、光が止まらずに入れ替わり続けるか（10 秒先まで）
        r = shots_at(b, 8, [5, 8, 10], sync=True, extra_js=tw)
        report_diffs('slide9 karenaTwinkle long (sync=True)', r)

        # 4. 1 コマの時間（3 枚目、30 コマ）
        page = new_page(b)
        s = Stepper(page, sync=True)
        s.start(2)
        cdp = page.context.new_cdp_session(page)
        timing = {}
        for kind in ('step+sync', 'png', 'jpeg90', 'cdp_jpeg90'):
            t0 = time.perf_counter()
            for _ in range(30):
                if kind == 'step+sync':
                    s.seek(s.ms / 1000 + 1 / FPS)
                elif kind == 'png':
                    s.shot()
                elif kind == 'jpeg90':
                    s.shot(type='jpeg', quality=90)
                else:
                    base64.b64decode(cdp.send('Page.captureScreenshot',
                                              {'format': 'jpeg', 'quality': 90})['data'])
            timing[kind] = (time.perf_counter() - t0) / 30 * 1000
        print('## per-frame ms', json.dumps({k: round(v, 1) for k, v in timing.items()}))
        page.close()

        # 5. 3 枚目をまるごと 30 fps で撮って mp4 にする（18 秒 = 540 コマ）
        frames = out / 'frames'
        frames.mkdir(exist_ok=True)
        page = new_page(b)
        s = Stepper(page, sync=True)
        s.start(2)
        cdp = page.context.new_cdp_session(page)
        t0 = time.perf_counter()
        n = 18 * FPS
        for k in range(n):
            s.seek(k / FPS)
            data = cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']
            (frames / f'f{k:05d}.jpg').write_bytes(base64.b64decode(data))
        cap = time.perf_counter() - t0
        page.close()
        t0 = time.perf_counter()
        subprocess.run(['ffmpeg', '-y', '-framerate', str(FPS), '-i', str(frames / 'f%05d.jpg'),
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(out / 'slide3.mp4')],
                       check=True, capture_output=True)
        print('## slide3 mp4', json.dumps({'frames': n, 'capture_s': round(cap, 1),
                                           'encode_s': round(time.perf_counter() - t0, 1)}))


if __name__ == '__main__':
    main()
