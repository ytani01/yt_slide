import pathlib
from playwright.sync_api import sync_playwright
url = pathlib.Path('player.html').resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch()
    for mobile in (False, True):
        kw = dict(viewport={'width':412,'height':915}, is_mobile=True, has_touch=True, device_scale_factor=2.6) if mobile else {}
        page = b.new_context(**kw).new_page()
        page.goto(url)
        page.evaluate("""() => { window.ev=[]; const v=document.getElementById('player-viewport');
          ['touchstart','touchend','click','dblclick'].forEach(t=>v.addEventListener(t,e=>ev.push(t+(t==='click'?':'+e.detail:'')),true)); }""")
        box = page.locator('#player-viewport').bounding_box()
        x, y = box['x']+box['width']/2, box['y']+box['height']/2
        if mobile:
            page.touchscreen.tap(x, y); page.wait_for_timeout(80); page.touchscreen.tap(x, y)
            page.wait_for_timeout(400)
            print('touch tap x2:', page.evaluate('ev'))
            page.evaluate('ev.length=0')
            cdp = page.context.new_cdp_session(page)
            cdp.send('Input.synthesizeTapGesture', {'x':x,'y':y,'tapCount':2,'gestureSourceType':'touch'})
            page.wait_for_timeout(400)
            print('synth tapCount=2:', page.evaluate('ev'))
            page.evaluate('ev.length=0')
            cdp.send('Input.synthesizeTapGesture', {'x':x,'y':y,'tapCount':1,'gestureSourceType':'touch'})
            page.wait_for_timeout(60)
            cdp.send('Input.synthesizeTapGesture', {'x':x,'y':y,'tapCount':1,'gestureSourceType':'touch'})
            page.wait_for_timeout(400)
            print('synth tap x2:', page.evaluate('ev'))
        else:
            page.mouse.dblclick(x, y); page.wait_for_timeout(300)
            print('mouse dblclick:', page.evaluate('ev'))
    b.close()
