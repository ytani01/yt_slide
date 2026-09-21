"""slidesConfig から summary/icon を読む関数と、マーカー間の差し替えを確かめる。

ネットワークは要らない。
"""
import click
import pytest

from ytslide import index, paths

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

NO_SUMMARY = """const slidesConfig = {
    title: 'タイトル',
    heading: '見出し',
};
"""

HTML_SUMMARY = """const slidesConfig = {
    title: 'タイトル',
    summary: '<span class="font-mono">player.html</span> の作り',
    icon: 'fa-code',
};
"""

QUOTE_SUMMARY = r"""const slidesConfig = {
    summary: 'it\'s a test',
    icon: 'fa-book',
};
"""


def test_parse_slide_config():
    assert index.parse_slide_config(SAMPLE) == ('説明文', 'fa-book')

    # summary/icon が無ければ None（rules だけの slideConfig でも壊れない）。
    assert index.parse_slide_config(NO_SUMMARY) == (None, None)

    # HTML を含む summary もそのまま読める（developer.js の書き方）。
    assert index.parse_slide_config(HTML_SUMMARY) == (
        '<span class="font-mono">player.html</span> の作り', 'fa-code')

    # エスケープしたアポストロフィ（\' ）は ' に戻す（レビュー指摘 1）。
    assert index.parse_slide_config(QUOTE_SUMMARY) == ("it's a test", 'fa-book')


def test_load_slide_and_slide_names():
    paths.set_root(None)

    # 実在の 5 つのスライド一式が全部読めること（summary/icon あり）。
    for name in ('readme', 'user', 'template', 'developer', 'claude-memo'):
        _, summary, icon = index.load_slide(name)
        assert summary, f'{name}: summary が読めていない'
        assert icon, f'{name}: icon が読めていない'

    # 並び: readme が先頭、残りはファイル名の辞書順。
    names = index.slide_names()
    assert names[0] == 'readme', names
    assert names[1:] == sorted(names[1:]), names
    assert not any(n.startswith('_') for n in names), names

    # _ 始まりのファイルは無視する（一時ファイルで確かめる）。
    hidden = paths.SLIDES / '_hidden.js'
    hidden.write_text("const slidesConfig = {};\n", encoding='utf-8')
    try:
        assert '_hidden' not in index.slide_names()
    finally:
        hidden.unlink()


def test_replace_marker_block():
    paths.set_root(None)
    html = f"""<ul>
            {index.BEGIN_MARKER}
            <li>old</li>
            {index.END_MARKER}
        </ul>
"""
    written = index.replace_marker_block(html, '            <li>new</li>')
    assert index.BEGIN_MARKER in written and index.END_MARKER in written
    assert '<li>new</li>' in written
    assert '<li>old</li>' not in written


def test_replace_marker_block_reads_old_comment_text():
    # 古いコメント文（tools/make-index.py が書き換える、の時代のもの）を
    # 持っている index.html でも、開始側はゆるく照合して通す。
    paths.set_root(None)
    old_begin = '<!-- BEGIN GENERATED SLIDES (tools/make-index.py が書き換える。手で編集しない) -->'
    html = f"""<ul>
            {old_begin}
            <li>old</li>
            {index.END_MARKER}
        </ul>
"""
    written = index.replace_marker_block(html, '            <li>new</li>')
    # 書き戻したあとは正本のコメント文になっている。
    assert index.BEGIN_MARKER in written
    assert old_begin not in written
    assert '<li>new</li>' in written


def test_replace_marker_block_missing_marker_raises():
    # マーカーが無ければ例外で止まる（壊れた index.html を黙って書き換えない）。
    with pytest.raises(click.ClickException):
        index.replace_marker_block('<ul></ul>', '<li>x</li>')


def test_build_index_wires_root(tmp_path):
    # --root の配線（TODO-095 reviewer 指摘 2）: paths.set_root() の結果が
    # そのまま ROOT/SLIDES/INDEX_HTML に反映されていること。
    paths.set_root(str(tmp_path))
    try:
        assert paths.ROOT == tmp_path.resolve(), paths.ROOT
        assert paths.SLIDES == tmp_path.resolve() / 'slides', paths.SLIDES
        assert paths.INDEX_HTML == tmp_path.resolve() / 'index.html', paths.INDEX_HTML

        # index.html が無ければ ClickException（未処理の例外で落ちない）。
        with pytest.raises(click.ClickException):
            index.build_index()
    finally:
        paths.set_root(None)
