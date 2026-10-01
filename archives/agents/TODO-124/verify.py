import pathlib
from playwright.sync_api import sync_playwright
url = pathlib.Path('player.html').resolve().as_uri()
ST = """() => ({playing: document.getElementById('play-btn').getAttribute('aria-label')==='一時停止',
  fs: document.getElementById('viewport-stage').classList.contains('is-fullscreen'),
  slide: document.getElementById('slide-num').textContent})"""
MOB = dict(viewport={'width':412,'height':915}, is_mobile=True, has_touch=True, device_scale_factor=2.6)
def st(p): return p.evaluate(ST)
def new(b, mobile, playing):
    page = b.new_context(**(MOB if mobile else dict(viewport={'width':1280,'height':800}))).new_page()
    page.goto(url); page.wait_for_timeout(500)
    if playing:
        page.evaluate("document.getElementById('play-btn').click()"); page.wait_for_timeout(200)
    return page
def ctr(page):
    bx = page.locator('#player-viewport').bounding_box()
    return bx['x']+bx['width']/2, bx['y']+bx['height']/2, bx
def dtap(page, x, y):
    page.touchscreen.tap(x, y); page.wait_for_timeout(80); page.touchscreen.tap(x, y); page.wait_for_timeout(400)
def report(label, before, after): print(f'{label}: before={before} after={after}')
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for mobile in (False, True):
        for playing in (False, True):
            page = new(b, mobile, playing); x, y, _ = ctr(page)
            def mdt():
                cx, cy, _ = ctr(page); dtap(page, cx, cy)  # フルスクリーン中は枠の位置が動くので毎回測る
            act = mdt if mobile else (lambda: (page.mouse.dblclick(x, y), page.wait_for_timeout(400)))
            s0 = st(page); act(); s1 = st(page); act(); s2 = st(page)
            tag = f"1/2 {'mobile' if mobile else 'desktop'} start={'play' if playing else 'pause'}"
            report(tag+' enter', s0, s1); report(tag+' exit', s1, s2)
    # 3 single tap
    page = new(b, True, False); x, y, _ = ctr(page)
    s0 = st(page); page.touchscreen.tap(x, y); page.wait_for_timeout(600); report('3 single tap', s0, st(page))
    # 4 swipe then tap
    page = new(b, True, False); x, y, _ = ctr(page)
    cdp = page.context.new_cdp_session(page)
    s0 = st(page)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':x+60,'y':y}]})
    for i in range(1, 7):
        cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':x+60-20*i,'y':y}]})
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    page.wait_for_timeout(30); page.touchscreen.tap(x, y); page.wait_for_timeout(600)
    report('4 swipe+tap', s0, st(page))
    # 5 curtain double tap
    page = new(b, True, False); x, y, bx = ctr(page)
    dtap(page, x, y); s1 = st(page); _, _, bx = ctr(page)
    print('5 frame box', bx)
    dtap(page, x, 10); report('5 curtain dtap (top band y=10)', s1, st(page))
    page.wait_for_timeout(500); print('5 after 500ms more', st(page))
    # 6 key F and exit button
    page = new(b, False, False)
    s0 = st(page); page.keyboard.press('f'); page.wait_for_timeout(300); s1 = st(page)
    report('6 key F on', s0, s1)
    page.click('#fullscreen-exit-btn'); page.wait_for_timeout(300); report('6 exit btn', s1, st(page))
    b.close()
