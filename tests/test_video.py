"""文の分割・字幕の時刻計算・組み立てを確かめる。

ネットワーク・ffmpeg・Playwright は使わない（TTS_MAX_CHARS を超える文の分割と、
純粋な文字列組み立ての関数だけを見る）。
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
    # 区切りが無いまま max_chars を超える場合は、それ以上分けようが無いので 1 つ。
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
