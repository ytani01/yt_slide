# uv run --extra video python archives/agents/TODO-118/verify.py
import pathlib
from playwright.sync_api import sync_playwright
URL = pathlib.Path(__file__).resolve().parents[3].joinpath('player.html').as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio'])
    ctx = b.new_context(viewport={'width': 1280, 'height': 800})
    pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(1000)
    S = lambda: pg.evaluate("({i:currentIndex,p:isPlaying,m:isMuted,fs:document.getElementById('player-viewport').classList.contains('pseudo-fullscreen')})")
    def reset(focus=None):
        pg.evaluate("if(isPlaying)togglePlay()"); pg.evaluate("renderSlide(2,false)")
        pg.evaluate("(document.activeElement).blur()")
        pg.evaluate("if(document.getElementById('player-viewport').classList.contains('pseudo-fullscreen'))document.getElementById('fullscreen-btn').click();if(isMuted)document.getElementById('mute-btn').click()")
        if focus: pg.focus(focus)
        pg.wait_for_timeout(200)
    def r(name, exp, got): print(f"{name}\n  期待: {exp}\n  測定: {got}")
    pg.evaluate("window.__clicks=0;document.getElementById('play-btn').addEventListener('click',()=>window.__clicks++)")
    pg.evaluate("window.__fs=0;document.getElementById('fullscreen-btn')&&document.getElementById('fullscreen-btn').addEventListener('click',()=>window.__fs++)")
    # 1
    reset(); pg.keyboard.press('ArrowRight'); r('1 body →', 'index 2->3', S())
    # 2
    reset(); pg.focus('a[href="index.html"]'); n=len(ctx.pages)
    pg.keyboard.press('ArrowRight'); s1=S(); pg.keyboard.press('Space'); pg.wait_for_timeout(300)
    r('2 a → / Space', 'index 3, playing True, tabs unchanged', (s1, S(), 'tabs', n, len(ctx.pages), 'url', pg.url))
    # 3
    for k in ['ArrowRight','Home','f','m']:
        reset('#play-btn'); pg.evaluate("window.__fs=0"); pg.keyboard.press(k); pg.wait_for_timeout(200)
        r(f'3 button {k}', {'ArrowRight':'index 3','Home':'index 0','f':'fs True (once)','m':'muted True'}[k], (S(), 'fsclicks', pg.evaluate("window.__fs"), 'playclicks', pg.evaluate("window.__clicks")))
    # 4
    reset('#play-btn'); pg.evaluate("window.__clicks=0"); pg.keyboard.press('Space'); pg.wait_for_timeout(300)
    r('4 button Space', 'clicks 1, playing True', (S(), pg.evaluate("window.__clicks")))
    # 5
    for sel in ['#voice-select', '#playlist-search']:
        reset(sel); pg.keyboard.press('ArrowRight'); r(f'5 {sel} →', 'index 2', S())
    # 6
    reset(); pg.keyboard.press('Control+ArrowRight'); r('6 Ctrl+→', 'index 2', S())
    reset(); pg.keyboard.press('Alt+ArrowRight'); r('6 Alt+→', 'index 2', S())
    reset(); pg.keyboard.press('Shift+F'); r('6 Shift+F', 'fs True', S())
    # 7
    reset(); pg.click('#guide-btn'); pg.wait_for_timeout(200); pg.keyboard.press('ArrowRight')
    r('7 guide open →', 'index 2', (S(), 'open', pg.evaluate("document.getElementById('operation-guide').open")))
    b.close()
