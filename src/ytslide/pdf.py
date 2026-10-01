"""スライド一式を 1スライド 1ページの PDF に書き出す。

`video.py` と同じ開き方で、スライドだけを 1920×1080 に広げ、
chromium の `page.pdf()` で 1枚ずつ出して `pypdf` でつなぐ。
ナレーション・字幕・操作 UI は入れない。

Playwright（Python, chromium）と `pypdf` が要る（`uv tool install '.[video]'`）。
"""
import io

import click

from . import browser, video


def make_pdf(slides_name, out_dir):
    """スライド一式 `slides_name` を `out_dir/<名前>.pdf` に書き出す。"""
    try:
        from pypdf import PdfWriter
    except ImportError as e:
        raise click.ClickException(f"pypdf が入っていない。\n{browser.install_hint()}") from e

    out_dir.mkdir(parents=True, exist_ok=True)
    out_pdf = out_dir / f'{slides_name}.pdf'
    with browser.open_player(
            slides_name, viewport={'width': video.WIDTH, 'height': video.HEIGHT}) as page:
        page.emulate_media(media='screen')
        # 枚数はページが読み込んだ一式から取る（narration の書き方に左右されない）
        count = page.evaluate('slideData.length')
        writer = PdfWriter()
        for i in range(count):
            page.evaluate(video.FIT, i)
            writer.append(io.BytesIO(page.pdf(
                width=f'{video.WIDTH}px', height=f'{video.HEIGHT}px', print_background=True,
                margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})))
        writer.write(out_pdf)
    print(f'{out_pdf} に書き出した（{count} ページ）')
