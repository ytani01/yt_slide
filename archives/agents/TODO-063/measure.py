#!/usr/bin/env python3
"""TODO-063 検証: template.js 9 枚を測って撮る。"""
import json
import pathlib
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8791/player.html?slides=template"
OUT_DIR = pathlib.Path("/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide/archives/agents/TODO-063/shots")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MEASURE_JS = """
() => {
  const canvas = document.getElementById('slide-canvas');
  const cRect = canvas.getBoundingClientRect();
  const h2 = canvas.querySelector('h2');
  const icon = h2 ? h2.querySelector('i') : null;
  // 本文要素: canvas 直下の最も外側の子要素すべてを見る
  const children = Array.from(canvas.querySelectorAll('*'));
  let maxRight = -Infinity, maxBottom = -Infinity, minLeft = Infinity, minTop = Infinity;
  for (const el of children) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    maxRight = Math.max(maxRight, r.right);
    maxBottom = Math.max(maxBottom, r.bottom);
    minLeft = Math.min(minLeft, r.left);
    minTop = Math.min(minTop, r.top);
  }
  return {
    scrollHeight: canvas.scrollHeight,
    clientHeight: canvas.clientHeight,
    scrollWidth: canvas.scrollWidth,
    clientWidth: canvas.clientWidth,
    canvasRect: {left: cRect.left, top: cRect.top, right: cRect.right, bottom: cRect.bottom},
    contentBounds: {left: minLeft, top: minTop, right: maxRight, bottom: maxBottom},
    hasH2: !!h2,
    h2Text: h2 ? h2.textContent.trim() : null,
    hasIcon: !!icon,
  };
}
"""

def main():
    results = []
    console_errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.on("console", lambda msg: console_errors.append((msg.type, msg.text)) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(("pageerror", str(exc))))
        page.goto(URL)
        page.wait_for_load_state("networkidle")

        n = page.evaluate("slideData.length")
        print(f"slideData.length = {n}")

        for i in range(n):
            page.evaluate("(i) => renderSlide(i, true)", i)
            page.wait_for_timeout(150)
            m = page.evaluate(MEASURE_JS)
            m["index"] = i
            m["title"] = page.evaluate("(i) => slideData[i].title", i)
            results.append(m)
            out_png = OUT_DIR / f"slide-{i+1}.png"
            page.screenshot(path=str(out_png))
            print(f"slide {i+1}: shot -> {out_png}")

        browser.close()

    print(json.dumps(results, indent=2, ensure_ascii=False))
    print("CONSOLE_ERRORS:", json.dumps(console_errors, ensure_ascii=False))

    with open("/tmp/claude-649/-net-fs-vol0-home-localhost-1-ytani-ytani-public-html-yt-slide/bd63a270-cf60-402c-904c-722dcf50a7c0/scratchpad/results.json", "w") as f:
        json.dump({"results": results, "console_errors": console_errors}, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
