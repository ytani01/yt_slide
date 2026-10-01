"""スライド一式の書き間違いを検査する（TODO-117）。

検査の中身は `player.html` の `window.runSlideCheck` に 1 か所だけ置き、
ここは Playwright で `player.html` を開いてその結果を読み出すだけにする
（検査の基準が 2 箇所に分かれないように）。画像の 404 は HTTP 経由でないと
分からないので、`video`・`pdf` と同じく `browser.open_player()` で
一時的にサーバーを立てて開く。
"""
from . import browser


def check(slides_name):
    """`slides_name` を Playwright で開き、`window.runSlideCheck()` の結果を返す。

    `paths.set_root()` は呼び出し側で済んでいる前提。
    """
    with browser.open_player(slides_name) as page:
        return page.evaluate('() => window.runSlideCheck()')
