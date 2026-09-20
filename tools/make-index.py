#!/usr/bin/env python3
"""`slides/*.js` の `slidesConfig` から `index.html` の一覧を作る。

`slidesConfig` に持たせた `summary`（一覧に出す説明）と `icon`
（FontAwesome のクラス名）を読み、`index.html` のマーカーコメントの間の
`<li>` を差し替える。マーカーの外は触らない。

    tools/make-index.py

並びは `readme` を先頭、残りはファイル名の辞書順。`_` で始まるファイルは
無視する。`summary`・`icon` が無いスライドは標準エラーに警告を出し、
空文字（`icon` は既定 `fa-file`）で埋める。

`slidesConfig` の中身は JS のパーサを使わず、正規表現で拾う
（`tools/measure-duration.py` が `rules` を読むのと同じやり方）。
"""
import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SLIDES = ROOT / 'slides'
INDEX_HTML = ROOT / 'index.html'

BEGIN_MARKER = '<!-- BEGIN GENERATED SLIDES (tools/make-index.py が書き換える。手で編集しない) -->'
END_MARKER = '<!-- END GENERATED SLIDES -->'

DEFAULT_ICON = 'fa-file'

SLIDES_CONFIG_RE = re.compile(r'const slidesConfig = \{(.*?)\n\};', re.S)
SUMMARY_RE = re.compile(r"summary:\s*'((?:\\.|[^'\\])*)'")
ICON_RE = re.compile(r"icon:\s*'((?:\\.|[^'\\])*)'")


def slide_names():
    """`slides/*.js`（`_` 始まりを除く）の名前を、並びの規則に沿って返す。

    `readme` を先頭、残りはファイル名の辞書順。
    """
    names = sorted(
        p.stem for p in SLIDES.glob('*.js') if not p.stem.startswith('_'))
    if 'readme' in names:
        names.remove('readme')
        names.insert(0, 'readme')
    return names


def parse_slide_config(text):
    """`slidesConfig` の本文から `summary` と `icon` を読む（無ければ None）。

    `\\'` は `'` に戻す（`measure-duration.py` の `load_rules()` と同じ）。
    """
    m = SLIDES_CONFIG_RE.search(text)
    body = m.group(1) if m else ''
    summary_m = SUMMARY_RE.search(body)
    icon_m = ICON_RE.search(body)
    summary = summary_m.group(1).replace(r"\'", "'") if summary_m else None
    icon = icon_m.group(1).replace(r"\'", "'") if icon_m else None
    return summary, icon


def load_slide(name):
    """`slides/<name>.js` を読み、(name, summary, icon) を返す。無い分は警告する。"""
    text = (SLIDES / f'{name}.js').read_text(encoding='utf-8')
    summary, icon = parse_slide_config(text)
    if summary is None:
        print(f'警告: {name}: slidesConfig.summary が無い', file=sys.stderr)
        summary = ''
    if icon is None:
        print(f'警告: {name}: slidesConfig.icon が無い', file=sys.stderr)
        icon = DEFAULT_ICON
    return name, summary, icon


LI_TEMPLATE = '''            <li>
                <a href="player.html?slides={name}" class="block rounded-xl bg-slate-900 border border-slate-700 p-4 hover:border-lime-400">
                    <span class="font-bold"><i class="fa-solid {icon} text-lime-400 mr-2"></i>{name}</span>
                    <span class="block text-sm text-slate-400 mt-1">{summary}</span>
                </a>
            </li>'''


def render_li(name, summary, icon):
    return LI_TEMPLATE.format(name=name, summary=summary, icon=icon)


def build_list_html(slides):
    return '\n'.join(render_li(name, summary, icon) for name, summary, icon in slides)


def replace_marker_block(html, list_html):
    pattern = re.compile(
        re.escape(BEGIN_MARKER) + r'.*?' + re.escape(END_MARKER), re.S)
    if not pattern.search(html):
        raise SystemExit(
            f'{INDEX_HTML} にマーカー（{BEGIN_MARKER} 〜 {END_MARKER}）が見つからない')
    replacement = f'{BEGIN_MARKER}\n{list_html}\n            {END_MARKER}'
    return pattern.sub(replacement, html)


def main():
    parser = argparse.ArgumentParser(
        description='slides/*.js の slidesConfig から index.html の一覧を作る')
    parser.parse_args()

    slides = [load_slide(name) for name in slide_names()]
    list_html = build_list_html(slides)
    html = INDEX_HTML.read_text(encoding='utf-8')
    written = replace_marker_block(html, list_html)
    INDEX_HTML.write_text(written, encoding='utf-8')
    print(f'{INDEX_HTML.name}: {len(slides)} 件のスライドを書いた')


if __name__ == '__main__':
    main()
