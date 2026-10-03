"""オフラインで開けるかを Playwright で確かめる（TODO-132）。

使い方: uv run python archives/agents/TODO-132/offline_check.py <URL の頭>
例:     uv run python archives/agents/TODO-132/offline_check.py http://localhost:8765
"""
import json
import sys

from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip('/')

PROBE = '''async () => {
    const header = document.querySelector('header');
    const cs = header && getComputedStyle(header);
    await document.fonts.ready;
    const fa = [...document.fonts].filter(f => f.family.includes('Font Awesome'))
        .map(f => `${f.family} ${f.weight}: ${f.status}`);
    const icon = document.querySelector('i.fa-solid');
    return {
        title: document.title,
        controlled: !!navigator.serviceWorker.controller,
        onLine: navigator.onLine,
        headerDisplay: cs && cs.display,
        headerBorderBottomWidth: cs && cs.borderBottomWidth,
        faFaces: fa,
        faCheck: document.fonts.check('900 16px "Font Awesome 6 Free"'),
        iconFontFamily: icon && getComputedStyle(icon, '::before').fontFamily,
        slideError: !!document.body.innerText.match(/読み込めませんでした/),
    };
}'''

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context()
    page = ctx.new_page()
    tts = []
    page.on('request', lambda r: 'translate.google' in r.url and tts.append(r.url))

    page.goto(f'{base}/player.html?slides=readme')
    page.evaluate('navigator.serviceWorker.ready.then(() => true)')
    page.wait_for_function('caches.keys().then(k => k.length > 0)')
    page.wait_for_timeout(1500)  # 初回の読み込み分を入れ終わるのを待つ
    cached = page.evaluate('''caches.open('ytslide').then(c => c.keys())
        .then(ks => ks.map(r => r.url.replace(location.origin, '')))''')
    print('cached', json.dumps(cached, ensure_ascii=False))
    page.goto(f'{base}/index.html')  # 一覧も一度開く
    page.wait_for_timeout(500)

    ctx.set_offline(True)
    for path in ('player.html?slides=readme', 'player.html?slides=readme#3',
                 'index.html', 'player.html?slides=developer'):
        page.goto(f'{base}/{path}')
        print('offline', path, json.dumps(page.evaluate(PROBE), ensure_ascii=False))

    # オフラインで再生しても translate_tts を取りに行かない
    page.goto(f'{base}/player.html?slides=readme')
    page.click('#play-btn')
    page.wait_for_timeout(3000)
    print('badge', page.inner_text('#audio-status-badge'),
          '| voice-select', page.input_value('#voice-select'),
          '| tts requests', len(tts))
    browser.close()
