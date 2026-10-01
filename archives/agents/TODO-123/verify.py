import asyncio, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.abspath(__file__))
URL = "file://" + os.path.abspath(os.path.join(ROOT, "../../../player.html"))
X = "#fullscreen-exit-btn"
INFO = """()=>{const x=document.getElementById('fullscreen-exit-btn'),r=x.getBoundingClientRect(),
 n=document.getElementById('slide-num').parentElement.getBoundingClientRect(),
 cx=r.left+r.width/2,cy=r.top+r.height/2,e=document.elementFromPoint(cx,cy);
 return {disp:getComputedStyle(x).display,rect:[r.left,r.top,r.right,r.bottom].map(v=>+v.toFixed(1)),iw:innerWidth,ih:innerHeight,
 hit:e?(e===x||x.contains(e)):false,hitTag:e&&e.tagName+'#'+e.id,
 num:[n.left,n.top,n.right,n.bottom].map(v=>+v.toFixed(1)),
 overlap:!(r.right<=n.left||n.right<=r.left||r.bottom<=n.top||n.bottom<=r.top),
 ps:document.getElementById('viewport-stage').classList.contains('is-fullscreen'),fs:!!document.fullscreenElement,
 icon:document.getElementById('play-icon').className}}"""
CASES = [("1920x1080",dict(viewport={"width":1920,"height":1080})),
 ("1280x800",dict(viewport={"width":1280,"height":800})),
 ("844x390",dict(viewport={"width":844,"height":390},is_mobile=True,has_touch=True)),
 ("390x844",dict(viewport={"width":390,"height":844},is_mobile=True,has_touch=True))]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        for name, args in CASES:
            c = await b.new_context(**args); pg = await c.new_page(); errs=[]
            pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
            pg.on("pageerror", lambda e: errs.append("pageerror:"+str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(1500)
            print("==", name)
            print("1 normal", (await pg.evaluate(INFO))["disp"])
            if name=="1280x800":
                g = await pg.evaluate("()=>{document.getElementById('guide-btn').click();return document.getElementById('operation-guide').textContent.includes('左上の ×')}")
                print("guide has '左上の ×':", g, "errors so far", errs)
                await pg.evaluate("document.getElementById('guide-close-btn').click()")
            await pg.click("#play-btn"); await pg.wait_for_timeout(300)
            await pg.click("#fullscreen-btn"); await pg.wait_for_timeout(600)
            i = await pg.evaluate(INFO); print("2", i)
            await pg.screenshot(path=os.path.join(ROOT, f"fs-{name}.png"))
            if args.get("has_touch"): await pg.tap(X)
            else: await pg.click(X)
            await pg.wait_for_timeout(600)
            a = await pg.evaluate(INFO)
            print("4 after", dict(ps=a["ps"],fs=a["fs"],icon=a["icon"],disp=a["disp"]), "before icon", i["icon"])
            print("errors", errs)
            await c.close()
        await b.close()
asyncio.run(main())
