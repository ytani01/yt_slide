#!/usr/bin/env python3
"""TODO-076 の操作ガイドを Chromium + Playwright で実測する。"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import Browser, BrowserContext, Page, Route, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
URL = f"{BASE}/player.html?slides=readme"
ADDITIONAL_ONLY = "--additional-only" in sys.argv[2:]
TIMEOUT = 20_000
OUT = Path("/tmp")


def note(text: str) -> None:
    print(f"[TODO-076] {text}", file=sys.stderr, flush=True)


def context_for(browser: Browser, mobile: bool) -> BrowserContext:
    context = browser.new_context(
        viewport={"width": 390, "height": 844} if mobile else {"width": 1280, "height": 800},
        is_mobile=mobile,
        has_touch=mobile,
        device_scale_factor=1,
    )
    context.set_default_timeout(7_000)
    context.set_default_navigation_timeout(TIMEOUT)
    return context


def load(page: Page, step: str) -> None:
    note(f"{step}: load")
    page.goto(URL, wait_until="domcontentloaded", timeout=TIMEOUT)
    page.locator("#guide-btn").wait_for(state="visible", timeout=7_000)


def active(page: Page) -> dict[str, object]:
    return page.evaluate(
        """() => { const e = document.activeElement; return {
          id:e?.id || '', tag:e?.tagName || '',
          inside:Boolean(e?.closest?.('#operation-guide'))
        }}"""
    )


def state(page: Page) -> dict[str, object]:
    return page.evaluate(
        """() => ({
          index:Number(document.querySelector('#slide-num').textContent) - 1,
          playing:document.querySelector('#play-btn').getAttribute('aria-label') === '一時停止',
          mute:document.querySelector('#mute-btn').getAttribute('aria-pressed'),
          fullscreen:document.querySelector('#fullscreen-btn').getAttribute('aria-pressed'),
          open:document.querySelector('#operation-guide').open,
          progress:parseFloat(document.querySelector('#progress-bar').style.width) || 0,
          active:(document.activeElement?.id || document.activeElement?.tagName)
        })"""
    )


def add(result: dict, name: str, passed: bool, detail=None) -> None:
    item = {"name": name, "pass": bool(passed)}
    if detail is not None:
        item["detail"] = detail
    result["checks"].append(item)


def blur(page: Page) -> None:
    page.evaluate("document.activeElement instanceof HTMLElement && document.activeElement.blur()")


def cdp_swipe(
    context: BrowserContext,
    page: Page,
    left: bool,
    selector: str = "#player-viewport",
) -> dict[str, float]:
    box = page.locator(selector).bounding_box()
    if box is None:
        raise RuntimeError("player viewport has no bounding box")
    x1 = box["x"] + box["width"] * (0.78 if left else 0.22)
    x2 = box["x"] + box["width"] * (0.22 if left else 0.78)
    # 長い dialog 本文では bounding box の中央が viewport 外になるため、
    # 実際に見えている範囲内へ収める。
    y = min(box["y"] + box["height"] / 2, page.viewport_size["height"] - 100)
    session = context.new_cdp_session(page)

    def point(x: float) -> dict:
        return {"x": x, "y": y, "id": 1, "radiusX": 2, "radiusY": 2, "force": 1}

    session.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [point(x1)]})
    for step in range(1, 7):
        x = x1 + (x2 - x1) * step / 6
        session.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [point(x)]})
        page.wait_for_timeout(16)
    session.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    session.detach()
    page.wait_for_timeout(150)
    return {"x1": round(x1, 1), "x2": round(x2, 1), "y": round(y, 1)}


def measure_layout(page: Page) -> dict:
    return page.evaluate(
        """() => {
          const ids = ['prev-btn','play-btn','next-btn','guide-btn','restart-btn',
            'toggle-caption-btn','speed-select','pause-select','mute-btn','fullscreen-btn'];
          const rect = e => { const r=e.getBoundingClientRect(); return {
            id:e.id, left:r.left, right:r.right, top:r.top, bottom:r.bottom,
            width:r.width, height:r.height}; };
          return {innerWidth, innerHeight,
            htmlWidth:document.documentElement.scrollWidth, bodyWidth:document.body.scrollWidth,
            controls:ids.map(id => rect(document.getElementById(id)))};
        }"""
    )


def measure_guide(page: Page) -> dict:
    return page.evaluate(
        """() => {
          const g=document.querySelector('#operation-guide');
          const r=e => { const x=e.getBoundingClientRect(); return {
            top:x.top,bottom:x.bottom,left:x.left,right:x.right}; };
          return {viewport:{width:innerWidth,height:innerHeight}, guide:r(g),
            header:r(g.querySelector('.guide-header')), close:r(document.querySelector('#guide-close-btn')),
            last:r(g.querySelector('.guide-body p:last-child')), scrollTop:g.scrollTop,
            scrollHeight:g.scrollHeight, clientHeight:g.clientHeight,
            scrollWidth:g.scrollWidth, clientWidth:g.clientWidth};
        }"""
    )


def verify_viewport(browser: Browser, mobile: bool) -> dict:
    label = "touch-390x844" if mobile else "desktop-1280x800"
    note(f"{label}: start")
    context = context_for(browser, mobile)
    page = context.new_page()
    result = {"viewport": label, "checks": [], "measurements": {}, "screenshots": []}

    # Tab は focus() で代用せず、実際の順序でガイドボタンへ到達させる。
    load(page, f"{label}/open-close")
    tabs = []
    for _ in range(16):
        page.keyboard.press("Tab")
        tabs.append(active(page))
        if tabs[-1]["id"] == "guide-btn":
            break
    add(result, "Tab reaches guide", tabs[-1]["id"] == "guide-btn", tabs)
    page.keyboard.press("Enter")
    add(result, "Enter opens and focuses close", state(page)["open"] and active(page)["id"] == "guide-close-btn", {"state": state(page), "active": active(page)})
    page.keyboard.press("Escape")
    add(result, "Escape closes and restores focus", not state(page)["open"] and active(page)["id"] == "guide-btn", {"state": state(page), "active": active(page)})
    page.keyboard.press("Space")
    add(result, "Space opens and focuses close", state(page)["open"] and active(page)["id"] == "guide-close-btn", {"state": state(page), "active": active(page)})
    page.keyboard.press("Space")
    add(result, "Space on close closes and restores focus", not state(page)["open"] and active(page)["id"] == "guide-btn", {"state": state(page), "active": active(page)})
    page.locator("#guide-btn").click()
    page.locator("#guide-close-btn").click()
    add(result, "click closes and restores focus", not state(page)["open"] and active(page)["id"] == "guide-btn", {"state": state(page), "active": active(page)})

    # Tab/Shift+Tab が背景の操作要素へ漏れない。BODY/HTML は Chrome UI との境界として許容。
    page.locator("#guide-btn").click()
    modal_tabs = []
    for key in ["Tab", "Tab", "Shift+Tab", "Shift+Tab"]:
        page.keyboard.press(key)
        modal_tabs.append(active(page))
    leaks = [x for x in modal_tabs if not x["inside"] and x["tag"] not in {"BODY", "HTML", "DIALOG"}]
    add(result, "modal Tab never focuses background", not leaks, modal_tabs)
    page.keyboard.press("Escape")

    # Space は上で閉じる操作を確認済み。他のショートカットはモーダル中に状態を変えない。
    page.locator("#guide-btn").click()
    before = state(page)
    key_states = []
    for key in ["ArrowRight", "ArrowLeft", "f", "m"]:
        page.keyboard.press(key)
        key_states.append({"key": key, "state": state(page)})
    stable = all(x["state"][field] == before[field] for x in key_states for field in ["index", "playing", "mute", "fullscreen"])
    add(result, "modal Arrow/F/M do not affect player", stable, {"before": before, "after": key_states})
    # open ガードを単独で通るよう dialog 自体をキー対象にする（Tab 検証の代用ではない）。
    page.evaluate("document.querySelector('#operation-guide').focus()")
    guard_before = state(page)
    page.keyboard.press("m")
    add(result, "open guard blocks dialog-targeted shortcut", state(page)["mute"] == guard_before["mute"], {"before": guard_before, "after": state(page)})
    page.keyboard.press("Escape")

    # 再生中の開閉で state と進行が維持される。
    load(page, f"{label}/playing")
    page.locator("#play-btn").click()
    page.wait_for_timeout(200)
    playing_before = state(page)
    page.locator("#guide-btn").click()
    page.wait_for_timeout(300)
    playing_open = state(page)
    page.locator("#guide-close-btn").click()
    page.wait_for_timeout(200)
    playing_closed = state(page)
    result["measurements"]["playing"] = {"before": playing_before, "open": playing_open, "closed": playing_closed}
    add(result, "opening preserves playback", playing_before["playing"] and playing_open["playing"] and playing_open["index"] == playing_before["index"])
    add(result, "playback progresses while modal is open", playing_open["progress"] > playing_before["progress"], result["measurements"]["playing"])
    add(result, "closing preserves playback", playing_closed["playing"] and playing_closed["index"] == playing_before["index"])
    page.locator("#play-btn").click()

    # 通常キーはボタンのフォーカスを blur してから実行する。
    load(page, f"{label}/normal-keys")
    blur(page); page.keyboard.press("Space")
    add(result, "normal Space starts", state(page)["playing"])
    blur(page); page.keyboard.press("Space")
    add(result, "normal Space pauses", not state(page)["playing"])
    index = state(page)["index"]
    blur(page); page.keyboard.press("ArrowRight")
    add(result, "normal ArrowRight advances", state(page)["index"] == index + 1)
    blur(page); page.keyboard.press("ArrowLeft")
    add(result, "normal ArrowLeft returns", state(page)["index"] == index)
    muted = state(page)["mute"]
    blur(page); page.keyboard.press("m")
    add(result, "normal M toggles mute", state(page)["mute"] != muted)
    blur(page); page.keyboard.press("f")
    add(result, "normal F enters fullscreen", state(page)["fullscreen"] == "true")
    blur(page); page.keyboard.press("Escape")
    add(result, "normal Escape exits fullscreen", state(page)["fullscreen"] == "false")

    if mobile:
        load(page, f"{label}/touch")
        viewport = page.locator("#player-viewport")
        viewport.tap(position={"x": 180, "y": 100})
        add(result, "touch tap starts", state(page)["playing"])
        viewport.tap(position={"x": 180, "y": 100})
        add(result, "second touch tap pauses", not state(page)["playing"])
        left = cdp_swipe(context, page, True)
        add(result, "CDP left swipe advances", state(page)["index"] == 1, left)
        right = cdp_swipe(context, page, False)
        add(result, "CDP right swipe returns", state(page)["index"] == 0, right)

    # 狭幅の横あふれ、ガイド末尾、sticky な閉じるボタンを測り、画像を /tmp に保存。
    load(page, f"{label}/layout")
    layout = measure_layout(page)
    result["measurements"]["layout"] = layout
    fit = all(r["left"] >= -0.5 and r["right"] <= layout["innerWidth"] + 0.5 and r["width"] > 0 for r in layout["controls"])
    add(result, "all controls fit width", fit, layout["controls"])
    add(result, "document has no horizontal overflow", max(layout["htmlWidth"], layout["bodyWidth"]) <= layout["innerWidth"], layout)
    controls_img = OUT / f"todo076-{label}-controls.png"
    page.screenshot(path=str(controls_img), full_page=False, timeout=7_000)
    page.locator("#guide-btn").click()
    opened = measure_guide(page)
    open_img = OUT / f"todo076-{label}-guide-open.png"
    page.screenshot(path=str(open_img), full_page=False, timeout=7_000)
    guide_fits = opened["guide"]["left"] >= 0 and opened["guide"]["right"] <= opened["viewport"]["width"] and opened["guide"]["top"] >= 0 and opened["guide"]["bottom"] <= opened["viewport"]["height"]
    add(result, "guide and close fit viewport", guide_fits and opened["close"]["bottom"] <= opened["guide"]["bottom"], opened)
    add(result, "guide has no horizontal overflow", opened["scrollWidth"] <= opened["clientWidth"], opened)
    page.locator("#operation-guide").evaluate("e => e.scrollTop = e.scrollHeight")
    page.wait_for_timeout(100)
    scrolled = measure_guide(page)
    result["measurements"]["guide"] = {"open": opened, "scrolled": scrolled}
    scroll_img = OUT / f"todo076-{label}-guide-scrolled.png"
    page.screenshot(path=str(scroll_img), full_page=False, timeout=7_000)
    max_scroll = scrolled["scrollHeight"] - scrolled["clientHeight"]
    add(result, "guide reaches scroll end", abs(scrolled["scrollTop"] - max_scroll) <= 1, {"top": scrolled["scrollTop"], "max": max_scroll})
    add(result, "last paragraph visible", scrolled["last"]["top"] >= scrolled["guide"]["top"] and scrolled["last"]["bottom"] <= scrolled["guide"]["bottom"] + 1, scrolled)
    add(result, "close stays visible after scroll", scrolled["close"]["top"] >= scrolled["guide"]["top"] and scrolled["close"]["bottom"] <= scrolled["guide"]["bottom"], scrolled)
    add(result, "header stays sticky", abs(scrolled["header"]["top"] - opened["header"]["top"]) <= 1, {"open": opened["header"], "scrolled": scrolled["header"]})
    result["screenshots"] = [str(controls_img), str(open_img), str(scroll_img)]

    context.close()
    note(f"{label}: done")
    return result


def verify_mutation(browser: Browser) -> dict:
    """ブラウザ応答内だけ guide.open ガードを削り、検査が異常を拾うかを見る。"""
    note("mutation: start")
    context = context_for(browser, False)
    count = {"value": 0}

    def mutate(route: Route) -> None:
        response = route.fetch(timeout=TIMEOUT)
        body = response.text()
        old = "if (guide.open || e.defaultPrevented || e.isComposing) return;"
        count["value"] += body.count(old)
        body = body.replace(old, "if (e.defaultPrevented || e.isComposing) return;")
        headers = dict(response.headers)
        headers.pop("content-length", None)
        route.fulfill(status=response.status, headers=headers, body=body)

    context.route("**/player.html*", mutate)
    page = context.new_page()
    load(page, "mutation")
    page.locator("#guide-btn").click()
    page.evaluate("document.querySelector('#operation-guide').focus()")
    before = state(page)
    page.keyboard.press("m")
    after = state(page)
    detected = count["value"] == 1 and before["mute"] != after["mute"]
    context.close()
    note("mutation: done")
    return {"name": "removed guide.open guard is detected", "pass": detected,
            "replacementCount": count["value"], "before": before, "after": after}


def verify_additional(browser: Browser) -> dict:
    """モーダル上の touch と、アイコンボタンの名前・押下状態を補足実測する。"""
    note("additional: modal touch and accessibility")
    context = context_for(browser, True)
    page = context.new_page()
    result = {"name": "modal touch and icon-button accessibility", "checks": []}

    load(page, "additional/modal-touch")
    page.locator("#play-btn").click()
    page.locator("#guide-btn").click()
    before = state(page)
    page.locator("#operation-guide .guide-body").tap(position={"x": 120, "y": 120})
    after_tap = state(page)
    left = cdp_swipe(context, page, True, "#operation-guide .guide-body")
    after_left = state(page)
    right = cdp_swipe(context, page, False, "#operation-guide .guide-body")
    after_right = state(page)
    modal_touch_stable = all(
        snapshot["open"]
        and snapshot["playing"] == before["playing"]
        and snapshot["index"] == before["index"]
        for snapshot in [after_tap, after_left, after_right]
    )
    add(result, "modal tap/swipes do not leak to playback or slide navigation",
        modal_touch_stable,
        {"before": before, "afterTap": after_tap, "afterLeft": after_left,
         "afterRight": after_right, "leftPath": left, "rightPath": right})

    load(page, "additional/accessibility")
    expected_names = [
        "前のスライド", "再生", "次のスライド", "字幕", "消音", "フルスクリーン"
    ]
    role_counts = {
        name: page.get_by_role("button", name=name, exact=True).count()
        for name in expected_names
    }
    initial = page.evaluate(
        """() => Object.fromEntries(['toggle-caption-btn','mute-btn','fullscreen-btn']
          .map(id => [id, document.getElementById(id).getAttribute('aria-pressed')]))"""
    )
    page.locator("#toggle-caption-btn").click()
    caption_on = page.locator("#toggle-caption-btn").get_attribute("aria-pressed")
    page.locator("#toggle-caption-btn").click()
    caption_off = page.locator("#toggle-caption-btn").get_attribute("aria-pressed")
    page.locator("#mute-btn").click()
    mute_on = page.locator("#mute-btn").get_attribute("aria-pressed")
    page.locator("#mute-btn").click()
    mute_off = page.locator("#mute-btn").get_attribute("aria-pressed")
    blur(page)
    page.keyboard.press("f")
    fullscreen_on = page.locator("#fullscreen-btn").get_attribute("aria-pressed")
    blur(page)
    page.keyboard.press("Escape")
    fullscreen_off = page.locator("#fullscreen-btn").get_attribute("aria-pressed")
    states = {
        "initial": initial,
        "caption": [caption_on, caption_off],
        "mute": [mute_on, mute_off],
        "fullscreen": [fullscreen_on, fullscreen_off],
    }
    accessibility_ok = (
        all(count == 1 for count in role_counts.values())
        and all(value == "false" for value in initial.values())
        and states["caption"] == ["true", "false"]
        and states["mute"] == ["true", "false"]
        and states["fullscreen"] == ["true", "false"]
    )
    add(result, "icon buttons expose names and pressed states including captions",
        accessibility_ok, {"roleCounts": role_counts, "states": states})
    context.close()
    note("additional: done")
    return result


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True, executable_path="/usr/bin/chromium",
            # CDP の横スワイプをページの touch event として測る。Chromium 自身の
            # 戻る/進むジェスチャーが先に URL を変えないよう検証起動時だけ止める。
            args=["--no-sandbox", "--disable-features=OverscrollHistoryNavigation"],
            timeout=TIMEOUT)
        if ADDITIONAL_ONLY:
            additional = verify_additional(browser)
            browser.close()
            print(json.dumps({"additional": additional}, ensure_ascii=False, indent=2))
            if any(not check["pass"] for check in additional["checks"]):
                raise SystemExit(1)
            note("additional checks passed")
            return
        viewports = [verify_viewport(browser, False), verify_viewport(browser, True)]
        mutation = verify_mutation(browser)
        additional = verify_additional(browser)
        browser.close()
    output = {"viewports": viewports, "mutation": mutation, "additional": additional}
    print(json.dumps(output, ensure_ascii=False, indent=2))
    failures = [f"{r['viewport']}: {c['name']}" for r in viewports for c in r["checks"] if not c["pass"]]
    if not mutation["pass"]:
        failures.append("mutation")
    failures.extend(
        f"additional: {check['name']}"
        for check in additional["checks"] if not check["pass"]
    )
    if failures:
        note("FAILED: " + "; ".join(failures))
        raise SystemExit(1)
    note("all checks passed")


if __name__ == "__main__":
    main()
