"""`browser.chromium()` の確かめ（TODO-122）。

Playwright は使わない。パッケージが無いときと、chromium を起動できないときに、
入れ方を添えた `ClickException` で止まるかを見る。
"""
import sys
import types

import click
import pytest

from ytslide import browser


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
