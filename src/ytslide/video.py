"""スライド一式を MP4 と `.srt` に書き出す。

`measure.py` と同じ TTS で読み上げ音声を取り、各スライドを Playwright（chromium）で
1920×1080 のまま **コマ送りで撮る**（TODO-134）。Playwright の `page.clock` で
ページの時計を止め、再生中の状態（`isPlaying`、`speechRunId` の更新。読み上げは
鳴らさない）にして、1/FPS 秒ずつ進めては JPEG に撮る。撮る長さは読み上げ音声 +
末尾の無音で、コマはそのまま `ffmpeg` の stdin に流して 1枚ぶんのクリップにし、
最後に連結する。再生速度は `BASE_SPEED_MULTIPLIER`（player.html の既定の倍速）に
揃える。字幕は焼き込まず、`.srt` を別に出す。

CSS transition と `element.animate()` は `page.clock` に従わず実時間で進むので、
毎コマ `document.getAnimations()` を止めて、偽の時計の経過に currentTime を合わせる。

**画面録画はしない。** 実時間に縛られないので、遅い端末でもコマ落ちや音ズレが
出ない。代わりに 1 コマ約 50 ms かかり、書き出しは動画の長さの 2 倍近くかかる。

`ffmpeg`・`ffprobe`・`curl`・Playwright（Python, chromium）が要る
（`uv tool install '.[video]'` で入る）。
"""
import base64
import contextlib
import math
import pathlib
import re
import subprocess
import tempfile
import time

from . import browser, measure, paths

# player.html の待ちの既定（自動再生で次へ進むまでの秒数）。
TAIL_SILENCE_SECONDS = 2

WIDTH, HEIGHT = 1920, 1080

# コマ送りで撮る速さと JPEG の質。PNG は 1 コマ 400 ms 以上かかるので JPEG にする
FPS = 30
JPEG_QUALITY = 90
MS_PER_SECOND = 1000

# 再生中の状態にする。読み上げは鳴らさない（speakCurrentNarration() は呼ばない）。
# speechRunId を進めると、ナレーションに合わせる動きが 0 秒からやり直す
PLAY = '() => { isPlaying = true; speechRunId++; }'

# CSS transition と element.animate() は page.clock に従わないので、初めて見たときに
# 止め、それからは偽の時計の経過を currentTime に入れる。終わったら finish() で
# 終わらせる（finish イベントで次の動きを始めるスライドがある）。始まりは
# 初めて見たコマに丸まる（最大 1 コマ遅れる）
SYNC_ANIMATIONS = """() => {
  const now = performance.now();
  window.__ytslideSeen ??= new WeakMap();
  for (const a of document.getAnimations()) {
    if (!__ytslideSeen.has(a)) { __ytslideSeen.set(a, now); a.pause(); }
    const elapsed = now - __ytslideSeen.get(a);
    if (elapsed >= a.effect.getComputedTiming().endTime) a.finish();
    else a.currentTime = elapsed;
  }
}"""

LOADED = "() => [...document.images].every(i => i.complete) && document.fonts.status === 'loaded'"

# スライドを撮るときに操作系を隠し、ビューポートを画面いっぱいに広げる。
# 中身が JS なので `{` が至るところに出る。str.format() では全部を `{{` に
# 直さないと使えないため、% 書式のままにする。
FIT = """(i) => {
  renderSlide(i);
  document.getElementById('slide-canvas').classList.remove('slide-fade-enter');
  document.querySelectorAll('body > *').forEach(e => e.style.display = 'none');
  const v = document.getElementById('player-viewport');
  document.body.appendChild(v);
  Object.assign(v.style, {position:'fixed', inset:'0', width:'%(width)dpx', height:'%(height)dpx',
                          borderRadius:'0', border:'none', margin:'0', display:'flex'});
  v.querySelector('#slide-num').closest('div.flex').style.display = 'none';
  document.getElementById('tap-feedback-icon').parentElement.style.display = 'none';
}""" % {'width': WIDTH, 'height': HEIGHT}  # noqa: UP031


def split_for_tts(text, max_chars):
    """`max_chars` を超える文を `。、！？` の位置で分け、切り捨てずに全部返す。

    1つの区切りだけでも max_chars を超える場合は、それ以上分けようが無いので
    そのまま 1つとして返す。
    """
    pieces = re.findall(r'[^。、！？]*[。、！？]|[^。、！？]+$', text)
    pieces = [p for p in pieces if p]
    chunks = []
    current = ''
    for piece in pieces:
        if current and len(current) + len(piece) > max_chars:
            chunks.append(current)
            current = piece
        else:
            current += piece
    if current:
        chunks.append(current)
    return chunks or ['']


def fetch_speech(text, out_mp3):
    """読み上げ文（180 字を超える分は分割）の音声を取り、`out_mp3` に書く。

    分割した分は個別に mp3 で取り、`ffmpeg concat` で 1本につなぐ。
    """
    chunks = split_for_tts(text, measure.TTS_MAX_CHARS)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        parts = []
        for i, chunk in enumerate(chunks):
            part = tmp / f'part{i}.mp3'
            subprocess.run(['curl', '-sS', '-f', '-o', str(part), measure.tts_url(chunk)], check=True)
            parts.append(part)
        if len(parts) == 1:
            parts[0].rename(out_mp3)
            return
        listfile = tmp / 'list.txt'
        listfile.write_text(''.join(f"file '{p}'\n" for p in parts), encoding='utf-8')
        subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(listfile),
                         '-c', 'copy', str(out_mp3)], check=True, capture_output=True)


def probe_duration(path):
    """mp3 の長さを秒で返す（`ffprobe`）。"""
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
        check=True, capture_output=True, text=True).stdout.strip()
    return float(out)


def wait_loaded(page, timeout=10):
    """画像とフォントの読み込みを実時間で待つ。

    `page.wait_for_function` は rAF で見張るので、時計を止めたページでは進まない。
    """
    for _ in range(int(timeout / 0.05)):
        if page.evaluate(LOADED):
            return
        time.sleep(0.05)


def record_slide(page, index, seconds, out):
    """`index`（0 始まり）を `seconds` 秒ぶんコマ送りで撮り、JPEG を `out` に書く。

    コマ数を返す。`page` は `install_clock=True` で開き、時計を止めてあること。
    """
    # 再生中のまま renderSlide() すると読み上げが始まり、その終わりのタイマーで
    # 次のスライドへ進んでしまうので、先に止める
    page.evaluate('() => { isPlaying = false; }')
    page.evaluate(FIT, index)
    page.clock.run_for(50)  # render() の setTimeout で動きを起こす（まだ再生前の形）
    wait_loaded(page)
    page.evaluate(PLAY)
    page.clock.run_for(16)  # 次の rAF で、ナレーションに合わせる動きが 0 秒から始まる
    cdp = page.context.new_cdp_session(page)
    frames = math.ceil(seconds * FPS)
    elapsed = 0
    for k in range(frames):
        # run_for は整数の ms しか取らないので、コマの時刻を丸めて差分を進める（1 コマ目は 0）
        target = round(k * MS_PER_SECOND / FPS)
        page.clock.run_for(target - elapsed)
        elapsed = target
        page.evaluate(SYNC_ANIMATIONS)
        shot = cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': JPEG_QUALITY})
        out.write(base64.b64decode(shot['data']))
    cdp.detach()
    return frames


def srt_timestamp(seconds):
    """秒数を `.srt` のタイムスタンプ（`00:00:00,000`）に変える。"""
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def build_srt(entries):
    """[(番号, 開始, 終了, 本文)] から `.srt` の本文を作る。"""
    lines = []
    for number, start, end, text in entries:
        lines.append(str(number))
        lines.append(f'{srt_timestamp(start)} --> {srt_timestamp(end)}')
        lines.append(text)
        lines.append('')
    return '\n'.join(lines)


@contextlib.contextmanager
def clip_writer(mp3, mp3_duration, out_mp4):
    """JPEG のコマ（stdin）+ mp3 + 末尾の無音を 1本の MP4 にする `ffmpeg` を起こし、stdin を渡す。

    長さは音声 + 無音に切る（コマは切り上げで撮るので、映像のほうが短くはならない）。
    """
    cmd = [
        'ffmpeg', '-y', '-loglevel', 'error',
        '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-i', str(mp3),
        '-f', 'lavfi', '-t', str(TAIL_SILENCE_SECONDS), '-i', 'anullsrc=r=44100:cl=stereo',
        '-filter_complex', '[1:a][2:a]concat=n=2:v=0:a=1[aout]',
        '-map', '0:v', '-map', '[aout]',
        '-t', str(mp3_duration + TAIL_SILENCE_SECONDS),
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', f'scale={WIDTH}:{HEIGHT}',
        '-c:a', 'aac', str(out_mp4),
    ]
    # stderr は一時ファイルで受ける（パイプだと、stdin に書いているあいだ読まないので詰まりうる）
    with tempfile.TemporaryFile() as err, subprocess.Popen(
            cmd, stdin=subprocess.PIPE, stderr=err) as proc:
        broken = False
        try:
            yield proc.stdin
        except BrokenPipeError:
            broken = True  # ffmpeg が先に落ちた。エラー文は下で返す
        except BaseException:
            proc.kill()
            raise
        finally:
            # 落ちた ffmpeg に残りを流そうとして、元の例外が BrokenPipeError に化けないようにする
            with contextlib.suppress(BrokenPipeError):
                proc.stdin.close()
        if proc.wait() != 0 or broken:
            err.seek(0)
            raise subprocess.CalledProcessError(proc.returncode, cmd, stderr=err.read())


def concat_clips(clips, out_mp4):
    """MP4 のクリップを連結する。"""
    with tempfile.TemporaryDirectory() as tmp:
        listfile = pathlib.Path(tmp) / 'list.txt'
        listfile.write_text(''.join(f"file '{c}'\n" for c in clips), encoding='utf-8')
        subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(listfile),
                         '-c', 'copy', str(out_mp4)], check=True, capture_output=True)


def make_video(slides_name, out_dir, only=None):
    """スライド一式 `slides_name` を `out_dir/<名前>.mp4` と `.srt` に書き出す。"""
    src = paths.SLIDES / f'{slides_name}.js'
    text = src.read_text(encoding='utf-8')
    all_narrations = measure.narrations(text)
    numbers = only if only else list(range(1, len(all_narrations) + 1))

    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp, browser.open_player(
            slides_name, install_clock=True,
            viewport={'width': WIDTH, 'height': HEIGHT}) as page:
        tmp = pathlib.Path(tmp)
        page.clock.pause_at(page.evaluate('Date.now()') + 1000)

        clips = []
        srt_entries = []
        cursor = 0.0
        for number in numbers:
            narration = all_narrations[number - 1]
            print(f'スライド {number}: 読み上げ音声を取得中…')
            spoken = measure.prepare(narration, slides_name)
            mp3 = tmp / f'slide{number}.mp3'
            fetch_speech(spoken, mp3)

            sped_mp3 = tmp / f'slide{number}_sped.mp3'
            subprocess.run(['ffmpeg', '-y', '-i', str(mp3), '-filter:a',
                             f'atempo={measure.BASE_SPEED_MULTIPLIER}', str(sped_mp3)],
                            check=True, capture_output=True)
            duration = probe_duration(sped_mp3)

            clip = tmp / f'clip{number}.mp4'
            with clip_writer(sped_mp3, duration, clip) as frames_in:
                frames = record_slide(page, number - 1, duration + TAIL_SILENCE_SECONDS, frames_in)
            clips.append(clip)

            srt_entries.append((len(srt_entries) + 1, cursor, cursor + duration, narration))
            # ffmpeg のエンコードは長さが数十 ms 丸まるため、次の開始は
            # 計算値ではなく実際に出来たクリップの長さで進める（枚数に
            # 比例してずれが溜まるのを防ぐ）。字幕の終了時刻は音声の長さのまま。
            cursor += probe_duration(clip)
            print(f'スライド {number}: {duration:.2f}s（{frames} コマ）')

        out_mp4 = out_dir / f'{slides_name}.mp4'
        concat_clips(clips, out_mp4)

    out_srt = out_dir / f'{slides_name}.srt'
    out_srt.write_text(build_srt(srt_entries), encoding='utf-8')
    print(f'{out_mp4} と {out_srt} に書き出した')
