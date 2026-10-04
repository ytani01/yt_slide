"""文の分割・字幕の時刻計算・組み立てと、コマ送りの書き出しを確かめる。

ネットワークは使わない。`test_clip_writer_*` は ffmpeg を、`test_make_video_frame_step` は
ffmpeg と Playwright（chromium）を起動する（無ければ飛ばす）。ほかは純粋な関数と
コマンドの引数の受け渡しだけを見る。
"""
from click.testing import CliRunner

from ytslide import video
from ytslide.cli import cli


def test_split_for_tts_short_text_stays_one_piece():
    assert video.split_for_tts('ひとつめ', 180) == ['ひとつめ']


def test_split_for_tts_splits_long_text_without_losing_chars():
    # 長い文は区切り記号の位置で、max_chars 以下に分ける（切り捨てない）。
    long_text = ('あ' * 50 + '。') * 5  # 255 字
    chunks = video.split_for_tts(long_text, 100)
    assert ''.join(chunks) == long_text, '分割しても中身が減ってはいけない'
    assert all(len(c) <= 100 for c in chunks), chunks
    assert len(chunks) > 1, chunks


def test_split_for_tts_without_punctuation_stays_one_piece():
    # 区切りが無いまま max_chars を超える場合は、それ以上分けようが無いので 1つ。
    no_punct = 'あ' * 200
    assert video.split_for_tts(no_punct, 180) == [no_punct]


def test_split_for_tts_just_under_limit():
    # claude-memo.js の最長ナレーション相当（176 字、余裕が無い）でも壊れない。
    just_under = 'あ、' * 88  # 176 字
    assert ''.join(video.split_for_tts(just_under, 180)) == just_under


def test_srt_timestamp():
    assert video.srt_timestamp(0) == '00:00:00,000'
    assert video.srt_timestamp(11.664) == '00:00:11,664'
    assert video.srt_timestamp(3661.5) == '01:01:01,500'


def test_build_srt():
    # .srt の組み立て。開始・終了・本文がそのまま出る。
    srt = video.build_srt([(1, 0.0, 11.664, 'ひとつめ'), (2, 13.664, 25.808, 'ふたつめ')])
    assert srt == (
        '1\n00:00:00,000 --> 00:00:11,664\nひとつめ\n\n'
        '2\n00:00:13,664 --> 00:00:25,808\nふたつめ\n'
    ), srt


def test_video_command_only_accepts_repeated_flag(tmp_path, monkeypatch):
    # --only は nargs='+' の `--only 1 2` ではなく、click の multiple=True で
    # `--only 1 --only 2` と繰り返す形になった（TODO-096 判断が要る点 1）。
    # make_video() を差し替えて、実際に渡る値を確かめる（ffmpeg・Playwright
    # には触れない）。
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')

    calls = []

    def fake_make_video(slides_name, out_dir, only=None):
        calls.append((slides_name, out_dir, only))

    monkeypatch.setattr(video, 'make_video', fake_make_video)

    runner = CliRunner()
    result = runner.invoke(cli, [
        'video', '--slides', 'sample', '--only', '1', '--only', '2', '--root', str(tmp_path),
    ])
    assert result.exit_code == 0, result.output
    assert len(calls) == 1, calls
    slides_name, _out_dir, only = calls[0]
    assert slides_name == 'sample'
    assert only == [1, 2], only


def test_video_command_root_wiring(tmp_path):
    # --root の配線（TODO-095 reviewer 指摘 2 の後継）: video コマンドが
    # paths.set_root(root) を呼んでいること。呼ばれないと存在しない
    # --root/--slides の組でも既定の置き場所を見に行ってしまい、エラー
    # メッセージに --root のパスが出ない。src.exists() のチェックで
    # UsageError になる時点で止まるので、Playwright・ffmpeg には触れない。
    (tmp_path / 'slides').mkdir()
    runner = CliRunner()
    result = runner.invoke(cli, ['video', '--slides', 'nope', '--root', str(tmp_path)])
    assert result.exit_code == 2, result.output
    assert str(tmp_path) in result.output, result.output


def test_pdf_command_passes_slides_and_out(tmp_path, monkeypatch):
    # make_pdf() を差し替えて、--slides・--out が渡ることを確かめる
    # （Playwright・pypdf には触れない）。
    from pathlib import Path

    from ytslide import pdf

    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')
    calls = []
    monkeypatch.setattr(pdf, 'make_pdf', lambda name, out_dir: calls.append((name, out_dir)))

    result = CliRunner().invoke(cli, [
        'pdf', '--slides', 'sample', '--out', 'o', '--root', str(tmp_path)])
    assert result.exit_code == 0, result.output
    assert calls == [('sample', Path('o'))], calls


def test_pdf_command_errors_without_slides(tmp_path):
    (tmp_path / 'slides').mkdir()
    result = CliRunner().invoke(cli, ['pdf', '--slides', 'nope', '--root', str(tmp_path)])
    assert result.exit_code == 2, result.output
    assert str(tmp_path) in result.output, result.output


def test_make_pdf_without_pypdf_shows_install_hint(tmp_path, monkeypatch):
    # pypdf が無いときは、chromium を起こす前に入れ方を添えて止める。
    import sys

    import click
    import pytest

    from ytslide import pdf

    monkeypatch.setitem(sys.modules, 'pypdf', None)  # import で ImportError
    with pytest.raises(click.ClickException, match='pypdf が入っていない') as e:
        pdf.make_pdf('sample', tmp_path)
    assert '[video]' in e.value.message



def test_video_command_shows_ffmpeg_error(tmp_path, monkeypatch):
    # ffmpeg などが落ちたら、エラー文の末尾を添えて止める（Traceback にしない）。
    import subprocess

    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')

    def failing_make_video(slides_name, out_dir, only=None):
        raise subprocess.CalledProcessError(
            1, ['ffmpeg', '-y'], stderr=b'line1\nUnknown encoder libx264\n')

    monkeypatch.setattr(video, 'make_video', failing_make_video)
    result = CliRunner().invoke(cli, ['video', '--slides', 'sample', '--root', str(tmp_path)])
    assert result.exit_code == 1, result.output
    assert 'ffmpeg が失敗した（終了コード 1）' in result.output, result.output
    assert 'Unknown encoder libx264' in result.output, result.output


def _need_ffmpeg():
    import shutil

    import pytest

    if not shutil.which('ffmpeg'):
        pytest.skip('ffmpeg が無い')


def test_clip_writer_reports_ffmpeg_error(tmp_path):
    # ffmpeg が先に落ちて書き込みが BrokenPipeError になっても、ffmpeg のエラー文を持った
    # CalledProcessError になる。ffmpeg はコマを読んでから mp3 を開こうとして落ちるので、
    # 落ちたあとも本物の JPEG を書き続ける。
    import subprocess

    import pytest

    _need_ffmpeg()
    jpeg = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=320x180',
                           '-frames:v', '1', '-f', 'mjpeg', '-'],
                          check=True, capture_output=True).stdout
    with pytest.raises(subprocess.CalledProcessError) as e, \
            video.clip_writer(tmp_path / 'nope.mp3', 1.0, tmp_path / 'out.mp4') as frames_in:
        for _ in range(100_000):
            frames_in.write(jpeg)
            frames_in.flush()
    assert e.value.returncode != 0
    assert b'nope.mp3' in e.value.stderr, e.value.stderr


# 1 枚目: element.animate()（linear、2 秒で 40cqw）。動き始めてから実時間で 0.3 秒ほど
# 費やすので、getAnimations() の時刻合わせが無いと、0 秒のコマで既に動いている。
# 2 枚目: player.html の再生中の状態を見て動く（再生前は動き終わった位置、isPlaying が
# 真になって speechRunId が変わったら 0 から 2 秒で 40cqw）。読み上げが始まると
# fallbackAudioElement ができるので、そのときは四角を隠す。
# 緑の四角は、赤・青の四角の動き出す前の位置の目印。
FRAME_STEP_SLIDES = """const slidesConfig = { title: 'frame', heading: 'frame', rules: [] };
const stage = (id, color) => `<div style="position: relative; height: 100%;">
    <div style="position: absolute; left: 5cqw; top: 5cqw; width: 5cqw; height: 5cqw; background: #0f0;"></div>
    <div id="${id}" style="position: absolute; left: 5cqw; top: 15cqw; width: 5cqw; height: 5cqw; background: ${color};"></div>
</div>`;
const slideData = [
    {
        title: 'animate',
        duration: 3,
        narration: 'いち。',
        render: function() {
            setTimeout(() => {
                const a = document.getElementById('anim').animate(
                    [{ transform: 'translateX(0)' }, { transform: 'translateX(40cqw)' }],
                    { duration: 2000, easing: 'linear', fill: 'forwards' });
                // 動き始めて（開始時刻が決まって）から、実時間を費やす
                a.ready.then(() => {
                    let x = 0;
                    for (let i = 0; i < 1e9; i++) x += i;
                    window.__spent = x;
                });
            });
            return stage('anim', '#f00');
        },
    },
    {
        title: 'narration',
        duration: 3,
        narration: 'に。',
        render: function() {
            setTimeout(() => {
                const box = document.getElementById('narr');
                let start = null, run = speechRunId;
                const frame = () => {
                    if (!box.isConnected) return;
                    const now = performance.now();
                    if (isPlaying && speechRunId !== run) start = now;
                    run = speechRunId;
                    const k = isPlaying && start !== null ? Math.min(1, (now - start) / 2000) : 1;
                    box.style.transform = `translateX(${k * 40}cqw)`;
                    box.style.visibility = fallbackAudioElement ? 'hidden' : '';
                    requestAnimationFrame(frame);
                };
                frame();
            });
            return stage('narr', '#00f');
        },
    },
];
"""


def test_make_video_frame_step(tmp_path, monkeypatch):
    # コマ送りで撮れているか。動きの位置が決まった時刻で決まった値になること、
    # クリップの長さが音声 + 無音になることを見る。
    #  - getAnimations() の時刻合わせを消すと、1 枚目の 0 秒で既に動いていて落ちる
    #  - PLAY（isPlaying・speechRunId）を消すと、2 枚目が動き終わった位置のままで落ちる
    #  - renderSlide() の前の isPlaying = false を消すと、2 枚目で読み上げが始まって四角が消え、落ちる
    #  - 撮る長さから末尾の無音を落とすと、映像が短くなって落ちる
    import json
    import subprocess

    import click
    import pytest

    from ytslide import paths

    pytest.importorskip('playwright.sync_api')
    _need_ffmpeg()
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'frame.js').write_text(FRAME_STEP_SLIDES, encoding='utf-8')
    monkeypatch.setattr(paths, 'ROOT', tmp_path)
    monkeypatch.setattr(paths, 'SLIDES', tmp_path / 'slides')

    def silent_speech(text, out_mp3):  # TTS（ネットワーク）の代わりに 0.5 秒の無音
        subprocess.run(['ffmpeg', '-y', '-f', 'lavfi', '-t', '0.5', '-i', 'anullsrc=r=44100:cl=mono',
                        str(out_mp3)], check=True, capture_output=True)

    monkeypatch.setattr(video, 'fetch_speech', silent_speech)
    try:
        video.make_video('frame', tmp_path / 'out')
    except click.ClickException as e:  # chromium が無い
        pytest.skip(e.message)
    mp4 = tmp_path / 'out' / 'frame.mp4'

    # 長さ: 字幕の終了 = 音声の長さ。映像のコマ数は (音声 + 無音) × FPS の切り上げ
    srt = (tmp_path / 'out' / 'frame.srt').read_text(encoding='utf-8')
    times = [line.split(' --> ') for line in srt.splitlines() if ' --> ' in line]

    def sec(ts):
        h, m, s = ts.replace(',', '.').split(':')
        return int(h) * 3600 + int(m) * 60 + float(s)

    audio = [sec(end) - sec(start) for start, end in times]
    second_start = sec(times[1][0])
    assert abs(second_start - (audio[0] + video.TAIL_SILENCE_SECONDS)) < 0.05, (second_start, audio)
    probe = json.loads(subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v', '-count_frames',
         '-show_entries', 'stream=nb_read_frames', '-of', 'json', str(mp4)],
        check=True, capture_output=True, text=True).stdout)
    frames = int(probe['streams'][0]['nb_read_frames'])
    # ffmpeg の -t は、終わりが -t を超えるコマを落とすので、クリップごとに 1 コマ未満短くなりうる
    expected = sum((a + video.TAIL_SILENCE_SECONDS) * video.FPS for a in audio)
    assert expected - len(audio) <= frames <= expected, (frames, expected)

    def frame_at(seconds):
        return subprocess.run(
            ['ffmpeg', '-v', 'error', '-ss', f'{seconds:.3f}', '-i', str(mp4), '-frames:v', '1',
             '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
            check=True, capture_output=True).stdout

    def left_edge(raw, color):  # その色の画素のいちばん左の x（無ければ None）
        row = video.WIDTH * 3
        xs = [i // 3 for y in range(0, video.HEIGHT, 8) for i in range(0, row, 3)
              if all(abs(raw[y * row + i + c] - color[c]) < 60 for c in range(3))]
        return min(xs) if xs else None

    def progress(start, t, color):  # 目印からの動きを、40cqw を 1 とした割合で返す
        raw = frame_at(start + t)
        x, mark = left_edge(raw, color), left_edge(raw, (0, 255, 0))
        assert x is not None and mark is not None, (start, t, x, mark)
        return (x - mark) / (video.WIDTH * 0.4 * travel_scale)

    # 40cqw が何 px かは、スライドの幅で決まる。1 枚目の 1 秒後と 0.5 秒後の差から測らずに、
    # 動き終わった 2 秒過ぎ（終わりの無音の中）の位置を 1 とする
    travel_scale = 1
    end1 = progress(0, 2.2, (255, 0, 0))
    travel_scale = end1
    p0, p1 = progress(0, 0, (255, 0, 0)), progress(0, 1, (255, 0, 0))
    assert abs(p0) < 0.03, p0
    assert abs(p1 - 0.5) < 0.04, p1
    q0, q1 = progress(second_start, 0, (0, 0, 255)), progress(second_start, 1, (0, 0, 255))
    assert abs(q0) < 0.04, q0
    assert abs(q1 - 0.5) < 0.04, q1
