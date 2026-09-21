"""apply_durations() の置換と、JS の置換表を読む関数を確かめる。

ネットワークは要らない（測定そのものは Google TTS 任せなので見ない）。
"""
import os
import pathlib
import tempfile

from ytslide import measure, paths

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

JS_SAMPLE = """const SPEECH_RULES = [
    [/TODO/gi, 'トゥードゥー'],
    [/archives\\/todo/gi, 'アーカイブズ'],
    [/TODO-([0-9]+)/gi, 'トゥードゥー $1'],
    [/考え方/g, 'かんがえかた'],
];
"""

COMMENTED_SAMPLE = """const SPEECH_RULES = [
    [/TODO/gi, 'トゥードゥー'],
    // [/foo/gi, 'コメントアウト'],
    [/Claude/gi, 'クロード'],
];
"""

QUOTE_SAMPLE = r"""const SPEECH_RULES = [
    [/it's/gi, 'イッツ\']'],
];
"""

NO_RULES_SAMPLE = """const slidesConfig = {
    title: 'タイトル',
    heading: '見出し',
};
"""


def test_apply_durations():
    written, changed, found = measure.apply_durations(SAMPLE, {1: 12, 2: 7})
    assert found == 2, found
    assert changed == [(1, 10, 12)], changed
    assert 'duration: 12,\n                narration:' in written
    assert 'duration: 7,\n                narration:' in written
    assert 'return `duration: 99,`' in written, 'render の中まで書き換えている'

    written, changed, found = measure.apply_durations(SAMPLE, {})
    assert changed == [] and written == SAMPLE


def test_load_rules():
    rules = measure.load_rules(JS_SAMPLE)
    assert rules == [
        ('TODO', 'トゥードゥー', measure.re.I),
        ('archives/todo', 'アーカイブズ', measure.re.I),
        ('TODO-([0-9]+)', r'トゥードゥー \1', measure.re.I),
        ('考え方', 'かんがえかた', 0),
    ], rules


def test_load_rules_skips_commented_lines():
    # コメントアウトした行（行頭が // ）は読み飛ばす（TODO-054 レビュー指摘 1）。
    rules = measure.load_rules(COMMENTED_SAMPLE)
    assert rules == [
        ('TODO', 'トゥードゥー', measure.re.I),
        ('Claude', 'クロード', measure.re.I),
    ], rules


def test_load_rules_keeps_escaped_quote():
    # 置換文に \' が入っても途中で切れない（レビュー指摘 2）。
    # エスケープした引用符の直後が `]` の形にする。ここが `'(.*?)'` のままだと
    # 手前で切れるので、直っていなければこの検査が落ちる。
    rules = measure.load_rules(QUOTE_SAMPLE)
    assert rules == [("it's", "イッツ']", measure.re.I)], rules


def test_slides_rules_from_text_without_rules():
    # rules: を持たないスライド一式のテキストを渡すと空になる（レビュー指摘 5）。
    assert measure.slides_rules_from_text(NO_RULES_SAMPLE) == []


def test_all_slides_rules_load():
    # リポジトリ直下（既定の場所）の 5 つのスライド一式が全部読めること
    # （スライド一式だけの語があるものは 1 つ以上）。
    paths.set_root(None)
    for slides in ('readme', 'user', 'developer', 'claude-memo'):
        slides_rules = measure.load_slides_rules(slides)
        assert slides_rules, f'{slides}: slidesConfig.rules が読めていない'

    common_rules = measure.load_common_rules()
    assert len(common_rules) == 23, common_rules


def test_measure_takes_median(monkeypatch):
    # 測る回数と中央値（TODO-065）。fetch_duration() を差し替えるので
    # ネットワークは使わない。prepare() は実ファイルの置換表を読むだけ。
    paths.set_root(None)
    calls = []

    def fake_fetch(seconds):
        def fetch(url):
            calls.append(url)
            return seconds[len(calls) - 1]
        return fetch

    monkeypatch.setattr(measure, 'fetch_duration', fake_fetch([3.0, 9.0, 5.0]))
    _spoken, raw, scaled = measure.measure('テスト', repeat=3)
    assert len(calls) == 3, calls
    assert len(set(calls)) == 1, '同じ URL を測り直すだけ'
    assert raw == 5.0, raw           # 並びの真ん中ではなく、値の中央値
    assert scaled == 5.0 / measure.BASE_SPEED_MULTIPLIER, scaled

    # 偶数回のときは真ん中 2 つの平均（statistics.median のふるまい）。
    calls.clear()
    monkeypatch.setattr(measure, 'fetch_duration', fake_fetch([3.0, 6.0]))
    _spoken, raw, scaled = measure.measure('テスト', repeat=2)
    assert raw == 4.5, raw

    # 既定は 1 回（今までと同じ挙動）。
    calls.clear()
    monkeypatch.setattr(measure, 'fetch_duration', fake_fetch([4.2]))
    _spoken, raw, scaled = measure.measure('テスト')
    assert len(calls) == 1, calls
    assert raw == 4.2, raw


def test_find_root_and_player_html(monkeypatch):
    # スライドの探し方（TODO-095 の後継。TODO-096 で後方互換のリポジトリへの
    # 分岐を無くした）: --root があればそこ、無ければカレントディレクトリ。
    _cwd_before = pathlib.Path.cwd()
    try:
        with tempfile.TemporaryDirectory() as outside, tempfile.TemporaryDirectory() as elsewhere:
            outside = pathlib.Path(outside).resolve()
            (outside / 'slides').mkdir()
            elsewhere = pathlib.Path(elsewhere).resolve()

            # 1. --root が最優先。
            os.chdir(elsewhere)
            assert paths.find_root(str(outside)) == outside

            # 2. --root が無ければ、カレントディレクトリ（slides/ の有無を問わない）。
            os.chdir(outside)
            assert paths.find_root(None) == outside
            os.chdir(elsewhere)
            assert paths.find_root(None) == elsewhere

            # player.html: ROOT 側にコピーが無ければ同梱データへ落とす。
            paths.set_root(str(outside))
            assert paths.PLAYER_HTML == paths.DATA / 'player.html'

            # コピーがあればそちらを使う（実際の再生とずれないよう優先）。
            own_player = outside / 'player.html'
            own_player.write_text('dummy', encoding='utf-8')
            paths.set_root(str(outside))
            assert paths.PLAYER_HTML == own_player
    finally:
        os.chdir(_cwd_before)
        paths.set_root(None)
