"""スライド一式を MP4 と `.srt` に書き出す。

各スライドを Playwright（chromium）で 1920×1080 の PNG に撮り、
`measure.py` と同じ TTS で読み上げ音声を取り、静止画 + 音声 + 末尾の無音を
1 枚ぶんのクリップにして `ffmpeg` で連結する。再生速度は
`BASE_SPEED_MULTIPLIER`（player.html の既定の倍速）に揃える。字幕は
焼き込まず、`.srt` を別に出す。

**画面録画はしない。** 実時間ぶん待たずに済み、音ズレも出ない。

`ffmpeg`・`ffprobe`・`curl`・Playwright（Python, chromium）が要る
（`uv tool install '.[video]'` で入る）。
"""
import pathlib
import re
import subprocess
import tempfile

import click

from . import measure, paths

# player.html の待ちの既定（自動再生で次へ進むまでの秒数）。
TAIL_SILENCE_SECONDS = 2

WIDTH, HEIGHT = 1920, 1080

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

    1 つの区切りだけでも max_chars を超える場合は、それ以上分けようが無いので
    そのまま 1 つとして返す。
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

    分割した分は個別に mp3 で取り、`ffmpeg concat` で 1 本につなぐ。
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


def screenshot_slides(slides_name, indexes, out_dir):
    """`indexes`（0 始まり）の PNG を `out_dir/slide{番号}.png` に撮る。"""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise click.ClickException(
            "playwright が入っていない。"
            "uv tool install '.[video]' で入れる"
        ) from e

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': WIDTH, 'height': HEIGHT})
        page.goto(paths.PLAYER_HTML.as_uri() + f'?slides={slides_name}')
        page.wait_for_load_state('networkidle')
        for i in indexes:
            page.evaluate(FIT, i)
            page.screenshot(path=str(out_dir / f'slide{i + 1}.png'))
        browser.close()


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


def make_clip(png, mp3, mp3_duration, out_mp4):
    """PNG の静止画 + mp3 + 末尾の無音を 1 本の MP4 にする。"""
    subprocess.run([
        'ffmpeg', '-y',
        '-loop', '1', '-i', str(png),
        '-i', str(mp3),
        '-f', 'lavfi', '-t', str(TAIL_SILENCE_SECONDS), '-i', 'anullsrc=r=44100:cl=stereo',
        '-filter_complex', '[1:a][2:a]concat=n=2:v=0:a=1[aout]',
        '-map', '0:v', '-map', '[aout]',
        '-t', str(mp3_duration + TAIL_SILENCE_SECONDS),
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', f'scale={WIDTH}:{HEIGHT}',
        '-c:a', 'aac', str(out_mp4),
    ], check=True, capture_output=True)


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
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        screenshot_slides(slides_name, [n - 1 for n in numbers], tmp)

        clips = []
        srt_entries = []
        cursor = 0.0
        for number in numbers:
            narration = all_narrations[number - 1]
            print(f'スライド {number}: 撮影済み。読み上げ音声を取得中…')
            spoken = measure.prepare(narration, slides_name)
            mp3 = tmp / f'slide{number}.mp3'
            fetch_speech(spoken, mp3)

            sped_mp3 = tmp / f'slide{number}_sped.mp3'
            subprocess.run(['ffmpeg', '-y', '-i', str(mp3), '-filter:a',
                             f'atempo={measure.BASE_SPEED_MULTIPLIER}', str(sped_mp3)],
                            check=True, capture_output=True)
            duration = probe_duration(sped_mp3)

            clip = tmp / f'clip{number}.mp4'
            make_clip(tmp / f'slide{number}.png', sped_mp3, duration, clip)
            clips.append(clip)

            srt_entries.append((len(srt_entries) + 1, cursor, cursor + duration, narration))
            # ffmpeg のエンコードは長さが数十 ms 丸まるため、次の開始は
            # 計算値ではなく実際に出来たクリップの長さで進める（枚数に
            # 比例してずれが溜まるのを防ぐ）。字幕の終了時刻は音声の長さのまま。
            cursor += probe_duration(clip)
            print(f'スライド {number}: {duration:.2f}s')

        out_mp4 = out_dir / f'{slides_name}.mp4'
        concat_clips(clips, out_mp4)

    out_srt = out_dir / f'{slides_name}.srt'
    out_srt.write_text(build_srt(srt_entries), encoding='utf-8')
    print(f'{out_mp4} と {out_srt} に書き出した')
