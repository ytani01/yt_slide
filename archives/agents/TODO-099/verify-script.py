"""
TODO-099 検証で使った Playwright スクリプト。
`.venv/bin/python archives/agents/TODO-099/verify-script.py <サブコマンド> ...` で使う。

サブコマンド:
  body <URL>                 - body のテキストを表示する（本文・ナレーション・エラー文言の確認）
  play <URL>                 - 再生ボタンを押し、audio-status-badge の推移を記録する
  user-slides <player.htmlの絶対パス> - slides/user.js の対象スライド(3,4,5,11,12)を
                                1280x720 / 390x844 でスクリーンショットし、
                                font-size と枠はみ出しを測る

このファイルは検証時に使ったものをそのまま残している。
"""
import sys, time, json
from playwright.sync_api import sync_playwright


def cmd_body(url):
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        page.goto(url)
        page.wait_for_timeout(1500)
        print(page.inner_text("body")[:800])
        b.close()


def cmd_play(url):
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        page.goto(url)
        page.wait_for_timeout(800)
        page.click('#play-btn')
        start = time.time()
        for _ in range(20):
            page.wait_for_timeout(1000)
            num = page.eval_on_selector('#slide-num', 'e=>e.textContent')
            badge = page.eval_on_selector('#audio-status-badge', 'e=>e.textContent')
            print(f"t={time.time()-start:.1f}s slide={num} badge={badge}")
        b.close()


def get_body_fontsizes(page):
    return page.evaluate("""
        () => {
            const canvas = document.querySelector('#slide-canvas');
            if (!canvas) return null;
            const all = canvas.querySelectorAll('*');
            const results = [];
            for (const el of all) {
                const style = el.getAttribute('style') || '';
                if (style.includes('clamp(0.9rem')) {
                    const cs = getComputedStyle(el);
                    results.push({tag: el.tagName, text: el.textContent.trim().slice(0,40), fontSizePx: cs.fontSize});
                }
            }
            return results;
        }
    """)


def check_overflow(page):
    return page.evaluate("""
        () => {
            const canvas = document.querySelector('#slide-canvas');
            const canvasRect = canvas.getBoundingClientRect();
            const all = canvas.querySelectorAll('div, span');
            const out = [];
            for (const el of all) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) continue;
                const overflowRight = r.right - canvasRect.right;
                const overflowLeft = canvasRect.left - r.left;
                if (overflowRight > 1 || overflowLeft > 1) {
                    out.push({text: el.textContent.trim().slice(0,50), overflowRight, overflowLeft});
                }
            }
            return out;
        }
    """)


def cmd_user_slides(player_html_path, outdir):
    url = f"file://{player_html_path}?slides=user"
    viewports = [(1280, 720), (390, 844)]
    targets = [3, 4, 5, 11, 12]
    results = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for (w, h) in viewports:
            vp_key = f"{w}x{h}"
            results[vp_key] = {}
            for n in range(1, 17):
                page = b.new_page(viewport={"width": w, "height": h})
                page.goto(f"{url}#{n}")
                page.wait_for_timeout(1000)
                if n in targets:
                    path = f"{outdir}/{n}-{w}.png"
                    page.screenshot(path=path)
                    fs = get_body_fontsizes(page)
                    overflow = check_overflow(page)
                    results[vp_key][n] = {"fontsize": fs, "overflow": overflow}
                    print(f"vp={vp_key} slide={n} fontsize={fs} overflow={overflow}")
                page.close()
        b.close()
    with open(f"{outdir}/fontsize_results.json", "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    sub = sys.argv[1]
    if sub == "body":
        cmd_body(sys.argv[2])
    elif sub == "play":
        cmd_play(sys.argv[2])
    elif sub == "user-slides":
        cmd_user_slides(sys.argv[2], sys.argv[3])
    else:
        print("unknown subcommand")
