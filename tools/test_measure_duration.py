#!/usr/bin/env python3
"""apply_durations() の置換と、JS の置換表を読む関数を確かめる。
`tools/test_measure_duration.py` で実行。

ネットワークは要らない（測定そのものは Google TTS 任せなので見ない）。
"""
import importlib.util
import pathlib

spec = importlib.util.spec_from_file_location(
    'measure_duration',
    pathlib.Path(__file__).resolve().parent / 'measure-duration.py')
md = importlib.util.module_from_spec(spec)
spec.loader.exec_module(md)

SAMPLE = """        const slideData = [
            // Slide 1
            {
                title: '1 枚目',
                duration: 10,
                narration: 'ひとつめ',
                render: function() { return `duration: 99,`; }
            },
            // Slide 2
            {
                title: '2 枚目',
                duration: 7,
                narration: 'ふたつめ',
            },
        ];
"""

written, changed, found = md.apply_durations(SAMPLE, {1: 12, 2: 7})
assert found == 2, found
assert changed == [(1, 10, 12)], changed
assert 'duration: 12,\n                narration:' in written
assert 'duration: 7,\n                narration:' in written
assert 'return `duration: 99,`' in written, 'render の中まで書き換えている'

written, changed, found = md.apply_durations(SAMPLE, {})
assert changed == [] and written == SAMPLE


# JS の [/pattern/flags, 'replacement'] を RULES 形式へ読み替える関数。
JS_SAMPLE = """const SPEECH_RULES = [
    [/TODO/gi, 'トゥードゥー'],
    [/archives\\/todo/gi, 'アーカイブズ'],
    [/TODO-([0-9]+)/gi, 'トゥードゥー $1'],
    [/考え方/g, 'かんがえかた'],
];
"""
rules = md.load_rules(JS_SAMPLE)
assert rules == [
    ('TODO', 'トゥードゥー', md.re.I),
    ('archives/todo', 'アーカイブズ', md.re.I),
    ('TODO-([0-9]+)', r'トゥードゥー \1', md.re.I),
    ('考え方', 'かんがえかた', 0),
], rules

# コメントアウトした行（行頭が // ）は読み飛ばす（TODO-054 レビュー指摘 1）。
COMMENTED_SAMPLE = """const SPEECH_RULES = [
    [/TODO/gi, 'トゥードゥー'],
    // [/foo/gi, 'コメントアウト'],
    [/Claude/gi, 'クロード'],
];
"""
rules = md.load_rules(COMMENTED_SAMPLE)
assert rules == [
    ('TODO', 'トゥードゥー', md.re.I),
    ('Claude', 'クロード', md.re.I),
], rules

# 置換文に \' が入っても途中で切れない（レビュー指摘 2）。
# エスケープした引用符の直後が `]` の形にする。ここが `'(.*?)'` のままだと
# 手前で切れるので、直っていなければこの検査が落ちる。
QUOTE_SAMPLE = r"""const SPEECH_RULES = [
    [/it's/gi, 'イッツ\']'],
];
"""
rules = md.load_rules(QUOTE_SAMPLE)
assert rules == [("it's", "イッツ']", md.re.I)], rules

# rules: を持たないスライド一式のテキストを渡すと空になる（レビュー指摘 5）。
NO_RULES_SAMPLE = """const slidesConfig = {
    title: 'タイトル',
    heading: '見出し',
};
"""
assert md.slides_rules_from_text(NO_RULES_SAMPLE) == []

# 4 つのスライド一式すべてが実際に読めること（スライド一式だけの語があるものは 1 つ以上）。
for slides in ('readme', 'user', 'developer', 'claude-memo'):
    slides_rules = md.load_slides_rules(slides)
    assert slides_rules, f'{slides}: slidesConfig.rules が読めていない'

common_rules = md.load_common_rules()
assert len(common_rules) == 23, common_rules


# 測る回数と中央値（TODO-065）。fetch_duration() を差し替えるので
# ネットワークは使わない。prepare() は実ファイルの置換表を読むだけ。
calls = []


def fake_fetch(seconds):
    def fetch(url):
        calls.append(url)
        return seconds[len(calls) - 1]
    return fetch


md.fetch_duration = fake_fetch([3.0, 9.0, 5.0])
spoken, raw, scaled = md.measure('テスト', repeat=3)
assert len(calls) == 3, calls
assert len(set(calls)) == 1, '同じ URL を測り直すだけ'
assert raw == 5.0, raw           # 並びの真ん中ではなく、値の中央値
assert scaled == 5.0 / md.BASE_SPEED_MULTIPLIER, scaled

# 偶数回のときは真ん中 2 つの平均（statistics.median のふるまい）。
calls.clear()
md.fetch_duration = fake_fetch([3.0, 6.0])
spoken, raw, scaled = md.measure('テスト', repeat=2)
assert raw == 4.5, raw

# 既定は 1 回（今までと同じ挙動）。
calls.clear()
md.fetch_duration = fake_fetch([4.2])
spoken, raw, scaled = md.measure('テスト')
assert len(calls) == 1, calls
assert raw == 4.2, raw

print('OK')
