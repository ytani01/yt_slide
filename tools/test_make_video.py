#!/usr/bin/env python3
"""文の分割・字幕の時刻計算・組み立てを確かめる。
`tools/test_make_video.py` で実行。

ネットワーク・ffmpeg・Playwright は使わない（TTS_MAX_CHARS を超える文の分割と、
純粋な文字列組み立ての関数だけを見る）。
"""
import importlib.util
import pathlib

spec = importlib.util.spec_from_file_location(
    'make_video', pathlib.Path(__file__).resolve().parent / 'make-video.py')
mv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mv)


# 短い文はそのまま 1 つ。
assert mv.split_for_tts('ひとつめ', 180) == ['ひとつめ']

# 長い文は区切り記号の位置で、max_chars 以下に分ける（切り捨てない）。
long_text = ('あ' * 50 + '。') * 5  # 255 字
chunks = mv.split_for_tts(long_text, 100)
assert ''.join(chunks) == long_text, '分割しても中身が減ってはいけない'
assert all(len(c) <= 100 for c in chunks), chunks
assert len(chunks) > 1, chunks

# 区切りが無いまま max_chars を超える場合は、それ以上分けようが無いので 1 つ。
no_punct = 'あ' * 200
assert mv.split_for_tts(no_punct, 180) == [no_punct]

# claude-memo.js の最長ナレーション相当（176 字、余裕が無い）でも壊れない。
just_under = 'あ、' * 88  # 176 字
assert ''.join(mv.split_for_tts(just_under, 180)) == just_under


# srt のタイムスタンプ。
assert mv.srt_timestamp(0) == '00:00:00,000'
assert mv.srt_timestamp(11.664) == '00:00:11,664'
assert mv.srt_timestamp(3661.5) == '01:01:01,500'


# .srt の組み立て。開始・終了・本文がそのまま出る。
srt = mv.build_srt([(1, 0.0, 11.664, 'ひとつめ'), (2, 13.664, 25.808, 'ふたつめ')])
assert srt == (
    '1\n00:00:00,000 --> 00:00:11,664\nひとつめ\n\n'
    '2\n00:00:13,664 --> 00:00:25,808\nふたつめ\n'
), srt

print('OK')
