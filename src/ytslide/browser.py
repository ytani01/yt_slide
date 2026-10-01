"""`check`・`video`・`pdf` が使う chromium を起動する（TODO-122）。

Playwright のパッケージか chromium が無いときは、入れ方を添えて止める。
`uv tool install` で入れた `ytslide` では `playwright` コマンドが PATH に
出ないので、chromium の入れ方は `sys.executable -m playwright` の形で示す。
"""
import contextlib
import sys

import click


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
