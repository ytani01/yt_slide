# TODO-125 実測。実行: uv run python archives/agents/TODO-125/measure.py
import json, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(__file__).resolve().parent
URL = (ROOT / "player.html").as_uri()
CONDS = {
    "A": dict(viewport=dict(width=1920, height=1080)),
    "B": dict(viewport=dict(width=1280, height=1024)),
    "C": dict(viewport=dict(width=844, height=390), has_touch=True, is_mobile=True),
    "D": dict(viewport=dict(width=390, height=844), has_touch=True, is_mobile=True),
}
R = lambda sel: f"(()=>{{const r=document.querySelector('{sel}').getBoundingClientRect();return {{t:r.top,b:r.bottom,l:r.left,r:r.right}}}})()"

def new(p, c):
    b = p.chromium.launch()
    ctx = b.new_context(**CONDS[c])
    pg = ctx.new_page()
    pg.goto(URL); pg.wait_for_timeout(800)
    return b, pg

def show_caption(pg):
    if pg.get_attribute("#toggle-caption-btn", "aria-pressed") != "true":
        pg.click("#toggle-caption-btn")
    pg.wait_for_timeout(200)

with sync_playwright() as p:
    for c in CONDS:
        b, pg = new(p, c)
        print(f"== {c}")
        show_caption(pg)
        sb, fr = pg.evaluate(R("#subtitle-banner")), pg.evaluate(R("#viewport-frame"))
        print("1 normal banner", sb, "frame", fr, "OK" if sb["t"] >= fr["b"] - 0.5 else "NG")
        pg.evaluate("document.getElementById('viewport-stage').scrollIntoView()")
        pg.keyboard.press("f"); pg.wait_for_timeout(500)
        fs = pg.evaluate("document.getElementById('viewport-stage').classList.contains('is-fullscreen')")
        sb, st = pg.evaluate(R("#subtitle-banner")), pg.evaluate(R("#viewport-stage"))
        fr = pg.evaluate(R("#viewport-frame"))
        cs = pg.evaluate("""(()=>{const t=document.getElementById('caption-text');const s=getComputedStyle(t);
          return {fs:s.fontSize, ta:s.textAlign, text:t.textContent.slice(0,30),
          wave:getComputedStyle(document.getElementById('wave-container')).display,
          head:getComputedStyle(document.getElementById('caption-heading')).display,
          win:[innerWidth,innerHeight]}})()""")
        print("2 fs", fs, "banner", sb, "stage", st, "frame", fr, cs)
        cx = (sb["l"] + sb["r"]) / 2
        print("  center-x banner", cx, "stage-center", (st["l"] + st["r"]) / 2,
              "inside-screen", sb["l"] >= 0 and sb["r"] <= cs["win"][0] and sb["t"] >= 0 and sb["b"] <= cs["win"][1])
        print("  banner.bottom - stage.bottom", sb["b"] - st["b"], " banner.top - stage.bottom", sb["t"] - st["b"])
        pg.screenshot(path=str(OUT / f"shot-{c}.png"))
        if c == "A":
            print("4 btn")
            pg.keyboard.press("f"); pg.wait_for_timeout(300)
            print("  normal display:", pg.evaluate("getComputedStyle(document.getElementById('fullscreen-caption-btn')).display"))
            pg.keyboard.press("f"); pg.wait_for_timeout(300)
            info = pg.evaluate("""(()=>{const b=document.getElementById('fullscreen-caption-btn'),x=document.getElementById('fullscreen-exit-btn');
              const r=b.getBoundingClientRect(),e=x.getBoundingClientRect();
              return {disp:getComputedStyle(b).display,text:b.textContent,cap:[r.left,r.right,r.top,r.bottom],exit:[e.left,e.right,e.top,e.bottom]}})()""")
            print("  fs", info)
            st = lambda: pg.evaluate("""({btn:document.getElementById('fullscreen-caption-btn').getAttribute('aria-pressed'),
              tog:document.getElementById('toggle-caption-btn').getAttribute('aria-pressed'),
              ls:localStorage.getItem('ytSlidePlayer.showCaptions'),
              bannerHidden:document.getElementById('subtitle-banner').classList.contains('hidden')})""")
            print("  before", st())
            pg.click("#fullscreen-caption-btn"); print("  after click1", st())
            pg.click("#fullscreen-caption-btn"); print("  after click2", st())
            print("5 C key")
            g = lambda: pg.evaluate("document.getElementById('toggle-caption-btn').getAttribute('aria-pressed')")
            v = g(); pg.keyboard.press("c"); print("  fs: ", v, "->", g())
            pg.keyboard.press("C"); print("  fs: back ->", g())
            pg.keyboard.press("f"); pg.wait_for_timeout(300)
            v = g(); pg.keyboard.press("c"); print("  normal:", v, "->", g()); pg.keyboard.press("c")
            v = g()
            pg.focus("#playlist-search"); pg.keyboard.press("c"); print("  search focus:", v, "->", g(), "value", pg.input_value("#playlist-search"))
            pg.evaluate("document.activeElement.blur()")
            pg.keyboard.press("Control+c"); print("  ctrl+c:", v, "->", g())
            print("7 notice")
            pg.keyboard.press("f"); pg.wait_for_timeout(300)
            show_caption(pg)
            pg.evaluate("document.getElementById('audio-error-notice').classList.remove('hidden')")
            pg.wait_for_timeout(200)
            n, sb = pg.evaluate(R("#audio-error-notice")), pg.evaluate(R("#subtitle-banner"))
            ox, oy = max(n["l"], sb["l"]), max(n["t"], sb["t"])
            ex, ey = min(n["r"], sb["r"]), min(n["b"], sb["b"])
            print("  notice", n, "banner", sb)
            if ex > ox and ey > oy:
                x, y = (ox + ex) / 2, (oy + ey) / 2
                print("  overlap point", x, y, pg.evaluate(f"(()=>{{const e=document.elementFromPoint({x},{y});return e.id+' in notice='+!!e.closest('#audio-error-notice')+' in banner='+!!e.closest('#subtitle-banner')}})()"))
                pg.screenshot(path=str(OUT / "shot-A-notice.png"))
            else:
                print("  no overlap")
        if c in "CD":
            x, y = (sb["l"] + sb["r"]) / 2, (sb["t"] + sb["b"]) / 2
            print("6 elementFromPoint", pg.evaluate(f"(()=>{{const e=document.elementFromPoint({x},{y});return e.id||e.className}})()"),
                  "inside banner:", pg.evaluate(f"!!document.elementFromPoint({x},{y}).closest('#subtitle-banner')"),
                  "inside frame:", pg.evaluate(f"!!document.elementFromPoint({x},{y}).closest('#viewport-frame')"))
            pg.touchscreen.tap(x, y); pg.wait_for_timeout(100)
            print("  after tap: fs", pg.evaluate("document.getElementById('viewport-stage').classList.contains('is-fullscreen')"),
                  "tap-icon shown", pg.evaluate("document.getElementById('tap-feedback-icon').classList.contains('is-shown')"))
        b.close()
