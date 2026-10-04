"""`check`・`video`・`pdf` が使う chromium を起動し、`player.html` を開く（TODO-122）。
作業場所を配る HTTP のハンドラーは `web` も使う（TODO-129）。

Playwright のパッケージか chromium が無いときは、入れ方を添えて止める。
`player.html` は作業場所を HTTP で配って開く。作業場所に `player.html` が
無ければ、それだけ同梱のものを返す（TODO-128）。有無はリクエストのたびに見る。
`uv tool install` で入れた `ytslide` では `playwright` コマンドが PATH に
出ないので、chromium の入れ方は `sys.executable -m playwright` の形で示す。
"""
import contextlib
import functools
import http.server
import os
import sys
import threading
import urllib.parse

import click

from . import paths


def install_hint():
    """Playwright と chromium の入れ方（エラーの文に添える）。"""
    return (
        "入れ方:\n"
        "  uv tool install 'git+https://github.com/ytani01/yt_slide[video]'\n"
        "  （リポジトリのチェックアウトからなら uv tool install '.[video]'）\n"
        f"  {sys.executable} -m playwright install chromium"
    )


@contextlib.contextmanager
def chromium():
    """chromium を起動して `Browser` を渡し、抜けるときに閉じる。"""
    try:
        from playwright.sync_api import Error, sync_playwright
    except ImportError as e:
        raise click.ClickException(
            f"playwright が入っていない。\n{install_hint()}") from e

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Error as e:
            first = str(e).strip().splitlines()[0] if str(e).strip() else ''
            raise click.ClickException(
                f"chromium を起動できない: {first}\n{install_hint()}") from e
        try:
            yield browser
        finally:
            browser.close()


class PlayerHandler(http.server.SimpleHTTPRequestHandler):
    """作業場所を配り、作業場所に `player.html` が無ければ同梱のものを返す。"""

    def translate_path(self, path):
        local = super().translate_path(path)
        if (urllib.parse.urlsplit(path).path == '/player.html'
                and not os.path.exists(local)):
            return str(paths.DATA / 'player.html')
        return local


class _Handler(PlayerHandler):
    """リクエストのログを出さない `PlayerHandler`（書き出し中の出力を汚さない）。"""

    def log_message(self, *args):
        pass


@contextlib.contextmanager
def serve_root():
    """作業場所（`paths.ROOT`）を 127.0.0.1 の空いたポートで配り、URL の頭を渡す。"""
    handler = functools.partial(_Handler, directory=str(paths.ROOT))
    with http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler) as httpd:
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            yield f'http://127.0.0.1:{httpd.server_address[1]}'
        finally:
            httpd.shutdown()
            thread.join()


@contextlib.contextmanager
def open_player(slides_name, install_clock=False, **page_options):
    """`player.html?slides=<名前>` を開き、読み込みが済んだ `Page` を渡す。

    `install_clock` が真なら、開く前に `page.clock` を入れる（`video` のコマ送り。TODO-134）。
    `paths.set_root()` は呼び出し側で済んでいる前提。
    """
    with serve_root() as base, chromium() as b:
        page = b.new_page(**page_options)
        if install_clock:
            page.clock.install()
        page.goto(f'{base}/player.html?slides={slides_name}')
        page.wait_for_load_state('networkidle')
        yield page
