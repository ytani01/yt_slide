"""スライド一式の書き間違いを検査する（TODO-117）。

検査の中身は `player.html` の `window.runSlideCheck` に 1 か所だけ置き、
ここは Playwright で `player.html` を開いてその結果を読み出すだけにする
（検査の基準が 2 箇所に分かれないように）。画像の 404 は HTTP 経由でないと
分からないので、`ytslide web` と同じように一時的にサーバーを立てて開く。
"""
import functools
import http.server
import threading

import click

from . import paths


def check(slides_name):
    """`slides_name` を Playwright で開き、`window.runSlideCheck()` の結果を返す。

    `paths.set_root()` は呼び出し側で済んでいる前提。
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise click.ClickException(
            "playwright が入っていない。"
            "uv tool install '.[video]' で入れる"
        ) from e

    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler, directory=str(paths.ROOT))
    with http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler) as httpd:
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page()
                page.goto(f'http://127.0.0.1:{port}/player.html?slides={slides_name}')
                page.wait_for_load_state('networkidle')
                result = page.evaluate('() => window.runSlideCheck()')
                browser.close()
        finally:
            httpd.shutdown()
            thread.join()

    return result
