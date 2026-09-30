import asyncio, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.abspath(__file__))
URL = "file://" + os.path.abspath(os.path.join(ROOT, "../../../player.html"))
ST = "()=>({fs:!!document.fullscreenElement,ps:document.getElementById('viewport-stage').classList.contains('is-fullscreen')})"
async def run(p, name, ctxargs):
    b = await p.chromium.launch(headless=True)
    async def fresh():
        c = await b.new_context(**ctxargs); pg = await c.new_page()
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append("pageerror:" + str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        return c, pg, errs
    async def st(pg): return await pg.evaluate(ST)
    async def clk(pg):
        if (await pg.evaluate(ST))["ps"]: await pg.evaluate("document.getElementById('fullscreen-btn').click()")  # stage covers the button in fullscreen
        else: await pg.click("#fullscreen-btn")
        await pg.wait_for_timeout(500)
    print("==", name)
    c, pg, errs = await fresh()
    await clk(pg); print("1 on ", await st(pg))
    if "is_mobile" in ctxargs:
        await pg.screenshot(path=os.path.join(ROOT, "fs-mobile.png"))
        print("7 rect", await pg.evaluate("()=>{const r=document.getElementById('viewport-stage').getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height,iw:innerWidth,ih:innerHeight}}"))
    await clk(pg); print("1 off", await st(pg))
    await pg.keyboard.press("f"); await pg.wait_for_timeout(500); print("2 F on ", await st(pg))
    await pg.keyboard.press("f"); await pg.wait_for_timeout(500); print("2 F off", await st(pg))
    await clk(pg)
    print("3 before", await st(pg)); await pg.evaluate("document.exitFullscreen()"); await pg.wait_for_timeout(500); print("3 exitFullscreen", await st(pg))
    print("pre4", await st(pg))
    await pg.click("#fullscreen-btn"); await pg.evaluate("document.getElementById('fullscreen-btn').click()"); await pg.wait_for_timeout(500)
    print("4 two clicks no wait", await st(pg))
    # 5
    await pg.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'f',repeat:true,bubbles:true}))"); await pg.wait_for_timeout(500)
    print("5 repeat (off state)", await st(pg))
    await pg.keyboard.press("f"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'f',repeat:true,bubbles:true}))"); await pg.wait_for_timeout(500)
    print("5 repeat (on state)", await st(pg))
    print("errors so far", errs)
    await c.close()
    # 6
    c, pg, errs = await fresh()
    await pg.evaluate("Element.prototype.requestFullscreen = undefined")
    await clk(pg); print("6 no API", await st(pg), "errors", errs)
    await clk(pg); print("6 off", await st(pg), "errors", errs)
    # 8
    print("8", await pg.evaluate("()=>[...document.head.querySelectorAll('meta[name^=apple-mobile]')].map(m=>m.name+'='+m.content)"))
    await c.close(); await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, "mobile 844x390", dict(viewport={"width":844,"height":390}, is_mobile=True, has_touch=True))
        await run(p, "pc 1280x800", dict(viewport={"width":1280,"height":800}))
asyncio.run(main())
