"""`browser.chromium()` と `browser.serve_root()` の確かめ（TODO-122・TODO-128）。

Playwright は使わない。パッケージが無いときと、chromium を起動できないときに、
入れ方を添えた `ClickException` で止まるかを見る。`serve_root()` は
`urllib` で取り出して、`player.html` の出どころを見る。
"""
import sys
import types
import urllib.request

import click
import pytest

from ytslide import browser, paths


def test_no_playwright_shows_install_hint(monkeypatch):
    monkeypatch.setitem(sys.modules, 'playwright.sync_api', None)  # import で ImportError
    with pytest.raises(click.ClickException) as e, browser.chromium():
        pass
    msg = e.value.message
    assert 'playwright が入っていない' in msg, msg
    assert "git+https://github.com/ytani01/yt_slide[video]" in msg, msg
    assert f'{sys.executable} -m playwright install chromium' in msg, msg


def test_no_chromium_shows_install_hint(monkeypatch):
    class Error(Exception):
        pass

    class FakePlaywright:
        class chromium:
            @staticmethod
            def launch():
                raise Error("BrowserType.launch: Executable doesn't exist at /x\nmore")

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    fake = types.ModuleType('playwright.sync_api')
    fake.Error = Error
    fake.sync_playwright = FakePlaywright
    monkeypatch.setitem(sys.modules, 'playwright.sync_api', fake)

    with pytest.raises(click.ClickException) as e, browser.chromium():
        pass
    msg = e.value.message
    assert "chromium を起動できない: BrowserType.launch: Executable doesn't exist at /x\n" in msg, msg
    assert 'more' not in msg, msg  # 2 行目以降は出さない
    assert f'{sys.executable} -m playwright install chromium' in msg, msg


def test_browser_closed_on_exit(monkeypatch):
    closed = []

    class FakeBrowser:
        def close(self):
            closed.append(True)

    class FakePlaywright:
        class chromium:
            @staticmethod
            def launch():
                return FakeBrowser()

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    fake = types.ModuleType('playwright.sync_api')
    fake.Error = Exception
    fake.sync_playwright = FakePlaywright
    monkeypatch.setitem(sys.modules, 'playwright.sync_api', fake)

    with pytest.raises(RuntimeError), browser.chromium():
        raise RuntimeError  # 途中で例外が出ても閉じる
    assert closed == [True]


def _get(url):
    with urllib.request.urlopen(url) as r:
        return r.read()


def test_serve_root_falls_back_to_bundled_player(tmp_path):
    # 作業場所に player.html が無くても、slides/ と画像は作業場所から配る（TODO-128）。
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('// mine', encoding='utf-8')
    paths.set_root(str(tmp_path))
    try:
        with browser.serve_root() as base:
            assert _get(f'{base}/player.html?slides=sample') == \
                (paths.DATA / 'player.html').read_bytes()
            assert _get(f'{base}/slides/sample.js') == b'// mine'
    finally:
        paths.set_root(None)


def test_serve_root_prefers_own_player(tmp_path):
    (tmp_path / 'player.html').write_text('mine', encoding='utf-8')
    paths.set_root(str(tmp_path))
    try:
        with browser.serve_root() as base:
            assert _get(f'{base}/player.html') == b'mine'
    finally:
        paths.set_root(None)
