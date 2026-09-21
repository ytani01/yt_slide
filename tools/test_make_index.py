#!/usr/bin/env python3
"""slidesConfig から summary/icon を読む関数と、マーカー間の差し替えを確かめる。
`tools/test_make_index.py` で実行。ネットワークは要らない。
"""
import contextlib
import importlib.util
import io
import pathlib
import sys
import tempfile

spec = importlib.util.spec_from_file_location(
    'make_index',
    pathlib.Path(__file__).resolve().parent / 'make-index.py')
mi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mi)

# slidesConfig から summary/icon を拾う ---------------------------------
SAMPLE = """const slidesConfig = {
    title: 'タイトル',
    heading: '見出し',
    summary: '説明文',
    icon: 'fa-book',
    rules: [
        [/foo/gi, 'フー'],
    ],
};
"""
assert mi.parse_slide_config(SAMPLE) == ('説明文', 'fa-book')

# summary/icon が無ければ None（rules だけの slideConfig でも壊れない）。
NO_SUMMARY = """const slidesConfig = {
    title: 'タイトル',
    heading: '見出し',
};
"""
assert mi.parse_slide_config(NO_SUMMARY) == (None, None)

# HTML を含む summary もそのまま読める（developer.js の書き方）。
HTML_SUMMARY = """const slidesConfig = {
    title: 'タイトル',
    summary: '<span class="font-mono">player.html</span> の作り',
    icon: 'fa-code',
};
"""
assert mi.parse_slide_config(HTML_SUMMARY) == (
    '<span class="font-mono">player.html</span> の作り', 'fa-code')

# エスケープしたアポストロフィ（\' ）は ' に戻す（レビュー指摘 1）。
QUOTE_SUMMARY = r"""const slidesConfig = {
    summary: 'it\'s a test',
    icon: 'fa-book',
};
"""
assert mi.parse_slide_config(QUOTE_SUMMARY) == ("it's a test", 'fa-book')

# 実在の 5 つのスライド一式が全部読めること（summary/icon あり）。
for name in ('readme', 'user', 'template', 'developer', 'claude-memo'):
    _, summary, icon = mi.load_slide(name)
    assert summary, f'{name}: summary が読めていない'
    assert icon, f'{name}: icon が読めていない'

# 並び: readme が先頭、残りはファイル名の辞書順。
names = mi.slide_names()
assert names[0] == 'readme', names
assert names[1:] == sorted(names[1:]), names
assert not any(n.startswith('_') for n in names), names

# _ 始まりのファイルは無視する（一時ファイルで確かめる）。
tmp_dir = pathlib.Path(__file__).resolve().parent.parent / 'slides'
hidden = tmp_dir / '_hidden.js'
hidden.write_text("const slidesConfig = {};\n", encoding='utf-8')
try:
    assert '_hidden' not in mi.slide_names()
finally:
    hidden.unlink()

# マーカー間の差し替え -----------------------------------------------------
HTML = f"""<ul>
            {mi.BEGIN_MARKER}
            <li>old</li>
            {mi.END_MARKER}
        </ul>
"""
written = mi.replace_marker_block(HTML, '            <li>new</li>')
assert mi.BEGIN_MARKER in written and mi.END_MARKER in written
assert '<li>new</li>' in written
assert '<li>old</li>' not in written

# マーカーが無ければ例外で止まる（壊れた index.html を黙って書き換えない）。
try:
    mi.replace_marker_block('<ul></ul>', '<li>x</li>')
    assert False, 'マーカーが無いのに通った'
except SystemExit:
    pass

# --root の配線（TODO-095 reviewer 指摘 2）: set_root() が md.find_root() の
# 結果をそのまま ROOT/SLIDES/INDEX_HTML に反映していること。
_orig_root, _orig_slides, _orig_index = mi.ROOT, mi.SLIDES, mi.INDEX_HTML
try:
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp).resolve()
        mi.set_root(str(tmp))
        assert mi.ROOT == tmp, mi.ROOT
        assert mi.SLIDES == tmp / 'slides', mi.SLIDES
        assert mi.INDEX_HTML == tmp / 'index.html', mi.INDEX_HTML

        # index.html が無ければ parser.error（未処理の例外で落ちない。要修正 1）。
        _orig_argv = sys.argv
        try:
            sys.argv = ['make-index.py', '--root', str(tmp)]
            buf = io.StringIO()
            try:
                with contextlib.redirect_stderr(buf):
                    mi.main()
                assert False, 'index.html が無いのに通った'
            except SystemExit as e:
                assert e.code == 2, e.code
            assert str(tmp) in buf.getvalue(), buf.getvalue()
        finally:
            sys.argv = _orig_argv
finally:
    mi.ROOT, mi.SLIDES, mi.INDEX_HTML = _orig_root, _orig_slides, _orig_index

print('OK')
