# TODO-127 実測。実行: uv run python archives/agents/TODO-127/measure.py [noshot]
import pathlib, sys
from playwright.sync_api import sync_playwright
OUT = pathlib.Path(__file__).resolve().parent
URL = (OUT.parents[2] / "player.html").as_uri()
BG = "getComputedStyle(document.getElementById('subtitle-banner')).backgroundColor"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport=dict(width=1920, height=1080)).new_page()
    pg.goto(URL); pg.wait_for_timeout(800)
    if pg.get_attribute("#toggle-caption-btn", "aria-pressed") != "true":
        pg.click("#toggle-caption-btn")
    pg.wait_for_timeout(200)
    print("normal bg:", pg.evaluate(BG))
    pg.evaluate("document.getElementById('viewport-stage').scrollIntoView()")
    pg.keyboard.press("f"); pg.wait_for_timeout(500)
    print("fullscreen:", pg.evaluate("document.getElementById('viewport-stage').classList.contains('is-fullscreen')"))
    print("fullscreen bg:", pg.evaluate(BG))
    if "noshot" not in sys.argv:
        pg.screenshot(path=str(OUT / "shot.png"))
    b.close()
