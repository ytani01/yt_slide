import sys, pathlib
from playwright.sync_api import sync_playwright
P = pathlib.Path(__file__).resolve().parents[3] / "player.html"
base = f"file://{P}?slides=readme"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1280,"height":720})
    num = lambda: pg.text_content("#slide-num")
    pg.goto(base + "#4"); pg.wait_for_selector("#slide-num")
    N = pg.evaluate("slideData.length"); print("N", N)
    print("1 open#4", num(), pg.url[-2:])
    pg.evaluate("location.hash='#7'"); pg.wait_for_timeout(300)
    print("1 ->#7", num(), pg.evaluate("location.hash"))
    for h in ("#abc", "#999"):
        pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(300)
        print("2", h, num(), pg.evaluate("location.hash"))
    pg.evaluate("location.hash='#3'"); pg.wait_for_timeout(300)
    pg.evaluate("window.__c=0; window.addEventListener('hashchange',()=>window.__c++)")
    pg.evaluate("location.hash='#abc'"); pg.wait_for_timeout(500)
    print("3 hashchange count", pg.evaluate("window.__c"), num(), pg.evaluate("location.hash"))
    pg.goto(base + "#4"); pg.wait_for_timeout(300); a = num()
    pg.goto(base + "#7"); pg.wait_for_timeout(300)
    print("4 goto #4 ->#7", a, num())
    b.close()
