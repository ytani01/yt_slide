#!/usr/bin/env python3
"""TODO-080 の先頭・末尾ボタンと Home/End キーを Chromium + Playwright で実測する。"""
from __future__ import annotations

import json
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
URL = f"{BASE}/player.html?slides=user"
TIMEOUT = 20_000


def note(text: str) -> None:
    print(f"[TODO-080] {text}", file=sys.stderr, flush=True)


def add(result: dict, name: str, passed: bool, detail=None) -> None:
    item = {"name": name, "pass": bool(passed)}
    if detail is not None:
        item["detail"] = detail
    result["checks"].append(item)


def state(page):
    return page.evaluate(
        """() => ({
          index: Number(document.querySelector('#slide-num').textContent) - 1,
          slideCount: Number(document.querySelector('#total-slides')?.textContent) || null
        })"""
    )


def blur(page):
    page.evaluate("document.activeElement instanceof HTMLElement && document.activeElement.blur()")


def check_order(page, result):
    ids = page.evaluate(
        """() => Array.from(document.querySelectorAll(
            '#first-btn,#prev-btn,#play-btn,#next-btn,#last-btn'
        )).map(e => e.id)"""
    )
    expected = ["first-btn", "prev-btn", "play-btn", "next-btn", "last-btn"]
    add(result, "DOM order matches", ids == expected, ids)

    rects = page.evaluate(
        """() => ['first-btn','prev-btn','play-btn','next-btn','last-btn'].map(id => {
            const r = document.getElementById(id).getBoundingClientRect();
            return {id, x: r.x};
        })"""
    )
    xs = [r["x"] for r in rects]
    add(result, "x order matches", xs == sorted(xs), rects)


def check_slide_count(page) -> int:
    return page.evaluate("() => Number(document.querySelector('#total-slides')?.textContent) || 0")


def check_first_last(page, result, slide_count):
    page.locator("#next-btn").click()
    page.locator("#next-btn").click()
    page.locator("#first-btn").click()
    s = state(page)
    add(result, "#first-btn goes to slide 1", s["index"] == 0, s)

    page.locator("#last-btn").click()
    s = state(page)
    add(result, "#last-btn goes to last slide", s["index"] == slide_count - 1, {"state": s, "slideCount": slide_count})


def check_home_end(page, result, slide_count):
    page.locator("#next-btn").click()
    page.locator("#next-btn").click()
    blur(page)
    page.keyboard.press("Home")
    s = state(page)
    add(result, "Home key goes to slide 1", s["index"] == 0, s)

    blur(page)
    page.keyboard.press("End")
    s = state(page)
    add(result, "End key goes to last slide", s["index"] == slide_count - 1, {"state": s, "slideCount": slide_count})


def check_edge_no_error(page, result, errors, slide_count):
    # 先頭で #first-btn
    page.locator("#first-btn").click()
    before = state(page)
    page.locator("#first-btn").click()
    after = state(page)
    add(result, "#first-btn at first slide is no-op and no error",
        before == after and len(errors) == 0, {"before": before, "after": after, "errors": list(errors)})

    # 末尾で #last-btn
    page.locator("#last-btn").click()
    before = state(page)
    page.locator("#last-btn").click()
    after = state(page)
    add(result, "#last-btn at last slide is no-op and no error",
        before == after and len(errors) == 0, {"before": before, "after": after, "errors": list(errors)})


def check_no_duplicate_tts(page, result, requests):
    page.locator("#first-btn").click()  # 先頭へ戻して再生開始準備
    requests.clear()
    page.locator("#play-btn").click()
    page.wait_for_timeout(800)
    requests.clear()

    page.locator("#next-btn").click()
    page.wait_for_timeout(600)
    count_next = len(requests)

    requests.clear()
    page.locator("#last-btn").click()
    page.wait_for_timeout(600)
    count_last = len(requests)

    requests.clear()
    page.locator("#first-btn").click()
    page.wait_for_timeout(600)
    count_first = len(requests)

    page.locator("#play-btn").click()
    add(result, "TTS request count is 1 per operation while playing",
        count_last == 1 and count_first == 1,
        {"next": count_next, "last": count_last, "first": count_first})


def check_mobile_layout(page, result):
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(200)
    ids = ["first-btn", "prev-btn", "play-btn", "next-btn", "last-btn"]
    rects = []
    for _id in ids:
        loc = page.locator(f"#{_id}")
        visible = loc.is_visible()
        box = loc.bounding_box()
        rects.append({"id": _id, "visible": visible, "box": box})

    all_visible = all(r["visible"] and r["box"] is not None for r in rects)

    def overlap(a, b):
        ax1, ay1 = a["x"], a["y"]
        ax2, ay2 = a["x"] + a["width"], a["y"] + a["height"]
        bx1, by1 = b["x"], b["y"]
        bx2, by2 = b["x"] + b["width"], b["y"] + b["height"]
        return not (ax2 <= bx1 or bx2 <= ax1 or ay2 <= by1 or by2 <= ay1)

    boxes = [r["box"] for r in rects]
    no_overlap = True
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            if boxes[i] and boxes[j] and overlap(boxes[i], boxes[j]):
                no_overlap = False
    add(result, "mobile 390px: all 5 buttons visible and non-overlapping",
        all_visible and no_overlap, rects)

    # クリック可能かも実際にクリックして確かめる
    clickable = True
    for _id in ids:
        try:
            page.locator(f"#{_id}").click(timeout=2000)
        except Exception as exc:  # noqa: BLE001
            clickable = False
            note(f"click failed on {_id}: {exc}")
    add(result, "mobile 390px: all 5 buttons clickable", clickable)
    page.set_viewport_size({"width": 1280, "height": 800})


def check_guide_and_text(page, result):
    page.locator("#guide-btn").click()
    page.wait_for_timeout(200)
    guide_text = page.locator("#operation-guide").inner_text()
    has_home_end = "Home" in guide_text and "End" in guide_text
    add(result, "operation guide mentions Home/End", has_home_end,
        {"snippet": guide_text[:400]})
    page.locator("#guide-close-btn").click()

    page_text = page.evaluate("() => document.body.innerText")
    has_restart_text = "最初から" in page_text
    add(result, "'最初から' is not present in rendered body text", not has_restart_text)


def run() -> dict:
    result = {"checks": []}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True, executable_path="/usr/bin/chromium",
            args=["--no-sandbox"], timeout=TIMEOUT)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        context.set_default_timeout(7_000)
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        tts_requests = []
        page.on("request", lambda req: tts_requests.append(req.url)
                 if "translate.google.com" in req.url else None)

        note("load")
        page.goto(URL, wait_until="domcontentloaded", timeout=TIMEOUT)
        page.locator("#guide-btn").wait_for(state="visible", timeout=7_000)

        slide_count = check_slide_count(page)
        result["slideCount"] = slide_count

        note("order")
        check_order(page, result)

        note("first/last buttons")
        check_first_last(page, result, slide_count)

        note("home/end keys")
        check_home_end(page, result, slide_count)

        note("edge no-op / no error")
        check_edge_no_error(page, result, errors, slide_count)

        note("no duplicate TTS while playing")
        check_no_duplicate_tts(page, result, tts_requests)

        note("mobile layout 390px")
        check_mobile_layout(page, result)

        note("guide text / restart text")
        check_guide_and_text(page, result)

        add(result, "no uncaught page errors during whole run", len(errors) == 0, errors)

        context.close()
        browser.close()
    return result


def main() -> None:
    result = run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    failures = [c["name"] for c in result["checks"] if not c["pass"]]
    if failures:
        note("FAILED: " + "; ".join(failures))
        raise SystemExit(1)
    note("all checks passed")


if __name__ == "__main__":
    main()
