"""オフラインで Web Speech が失敗したときの進み方を確かめる（TODO-132）。

使い方: uv run --extra video python archives/agents/TODO-132/offline_speech_check.py http://localhost:8765
ヘッドレスの Chromium には音声合成エンジンが無いので、Web Speech は必ず失敗する。
"""
import sys
import time

from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip('/')
with sync_playwright() as p:
    b = p.chromium.launch()
    for offline in (True, False):
        ctx = b.new_context()
        page = ctx.new_page()
        tts = []
        page.on('request', lambda r: 'translate.google' in r.url and tts.append(r.url))
        page.goto(f'{base}/player.html?slides=readme')
        page.evaluate('navigator.serviceWorker.ready.then(() => true)')
        page.wait_for_timeout(1500)
        ctx.set_offline(offline)
        page.goto(f'{base}/player.html?slides=readme')
        # Web Speech を選んでおく（Online のままでもオフラインなら同じ経路）
        dur = page.evaluate('slideData[0].duration')
        t0 = time.monotonic()
        page.click('#play-btn')
        page.wait_for_timeout(1000)
        badge = page.inner_text('#audio-status-badge')
        notice = page.is_visible('#audio-error-notice')
        page.wait_for_function('location.hash === "#2"', timeout=(dur + 10) * 1000)
        print(f'offline={offline} duration={dur} advanced_after={time.monotonic() - t0:.1f}s '
              f'badge@1s={badge!r} notice@1s={notice} tts_requests={len(tts)}')
        ctx.close()
    b.close()
