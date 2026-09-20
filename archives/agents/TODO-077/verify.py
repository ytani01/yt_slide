#!/usr/bin/env python3
"""TODO-077 検証スクリプト。使い回し用に 1 本だけ置く。
使い方: python3 verify.py
前提: リポジトリ直下で `python3 -m http.server 8777` が動いていること。
"""
import json
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8777/player.html?slides=user"
SHOT_DIR = "/home/ytani/tmp/playwright-mcp"


def rect(page, selector):
    return page.eval_on_selector(selector, "el => el.getBoundingClientRect().toJSON()")


def run_checks(page, label):
    out = {}
    page.goto(BASE)
    page.wait_for_selector("#playlist-items button")

    # --- 2. title-only / narration-only search ---
    search = page.locator("#playlist-search")
    search.fill("基本方針")
    page.wait_for_timeout(150)
    out["title_only_count_text"] = page.locator("#playlist-count").inner_text()
    out["title_only_visible_items"] = page.locator("#playlist-items button:not(.hidden)").count()
    out["title_only_empty_hidden"] = page.locator("#playlist-empty").is_hidden()

    search.fill("clamp")
    page.wait_for_timeout(150)
    out["narr_only_count_text"] = page.locator("#playlist-count").inner_text()
    out["narr_only_visible_items"] = page.locator("#playlist-items button:not(.hidden)").count()

    # 該当なし
    search.fill("該当しない文字列XYZ123")
    page.wait_for_timeout(150)
    out["nohit_count_text"] = page.locator("#playlist-count").inner_text()
    out["nohit_visible_items"] = page.locator("#playlist-items button:not(.hidden)").count()
    out["nohit_empty_visible"] = page.locator("#playlist-empty").is_visible()
    out["nohit_empty_text"] = page.locator("#playlist-empty").inner_text()

    # 空欄に戻す・解除
    search.fill("")
    page.wait_for_timeout(150)
    out["empty_count_text"] = page.locator("#playlist-count").inner_text()
    out["empty_visible_items"] = page.locator("#playlist-items button:not(.hidden)").count()

    # --- 3. 番号は元のまま / 選ぶと移動 ---
    search.fill("clamp")
    page.wait_for_timeout(150)
    visible_btn = page.locator("#playlist-items button:not(.hidden)").first
    out["filtered_item_text"] = visible_btn.inner_text()
    visible_btn.click()
    page.wait_for_timeout(300)
    out["after_click_current_index"] = page.evaluate("currentIndex")
    out["url_after_click"] = page.url
    search.fill("")
    page.wait_for_timeout(150)

    # --- 4. total time 不変 / 絞り込み中の次送り ---
    out["total_time_before"] = page.locator("#total-time-display").inner_text()
    search.fill("基本方針")
    page.wait_for_timeout(150)
    out["total_time_during_filter"] = page.locator("#total-time-display").inner_text()
    next_btn = page.locator("#next-btn")
    if next_btn.count():
        next_btn.click()
        page.wait_for_timeout(200)
        out["total_time_after_next_during_filter"] = page.locator("#total-time-display").inner_text()
    out["scrollY_after_next_during_filter"] = page.evaluate("window.scrollY")
    search.fill("")
    page.wait_for_timeout(150)

    # --- 5. Space / 矢印が検索欄では再生操作に渡らない ---
    # 状態を確認するため再生を止めた状態から始める
    play_state_before = page.eval_on_selector(
        "#play-btn", "el => el.getAttribute('aria-label') || el.className"
    )
    slide_num_before = page.evaluate("currentIndex")
    search.click()
    search.fill("")
    page.keyboard.press("Space")
    page.keyboard.press("ArrowRight")
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(150)
    out["slide_index_after_keys_in_search"] = page.evaluate("currentIndex")
    out["slide_index_before_keys_in_search"] = slide_num_before
    out["search_value_after_arrow_keys"] = search.input_value()

    # Escape in fullscreen
    page.evaluate("document.getElementById('player-viewport').classList.add('pseudo-fullscreen')")
    search.fill("x")
    page.keyboard.press("Escape")
    page.wait_for_timeout(100)
    out["fullscreen_class_after_escape_in_search"] = page.eval_on_selector(
        "#player-viewport", "el => el.classList.contains('pseudo-fullscreen')"
    )
    page.evaluate("document.getElementById('player-viewport').classList.remove('pseudo-fullscreen')")
    search.fill("")

    # --- 6. sidebar bottom vs button panel bottom ---
    sidebar_rect = rect(page, "#sidebar")
    panel_rect = rect(page, "div.flex.flex-col.gap-3.shadow-lg")
    out["sidebar_rect"] = sidebar_rect
    out["panel_rect"] = panel_rect
    out["bottom_diff_no_caption"] = sidebar_rect["bottom"] - panel_rect["bottom"]

    caption_btn = page.locator("#toggle-caption-btn")
    if caption_btn.count():
        caption_btn.click()
        page.wait_for_timeout(200)
        sidebar_rect2 = rect(page, "#sidebar")
        panel_rect2 = rect(page, "div.flex.flex-col.gap-3.shadow-lg")
        out["sidebar_rect_with_caption"] = sidebar_rect2
        out["panel_rect_with_caption"] = panel_rect2
        out["bottom_diff_with_caption"] = sidebar_rect2["bottom"] - panel_rect2["bottom"]
        caption_btn.click()
        page.wait_for_timeout(200)

    # --- 7. mobile screenshot ---
    if "mobile" in label:
        page.screenshot(path=f"{SHOT_DIR}/todo-077-{label}-full.png", full_page=True)
        out["screenshot"] = f"{SHOT_DIR}/todo-077-{label}-full.png"
        sidebar_h = page.eval_on_selector(
            "#sidebar", "el => el.getBoundingClientRect().height"
        )
        out["sidebar_height_mobile"] = sidebar_h
        out["page_scroll_width_vs_client"] = page.evaluate(
            "document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )

    return out


def main():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # 1280x800
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        page = ctx.new_page()
        results["desktop_1280x800"] = run_checks(page, "desktop")
        ctx.close()

        # 390x844 touch/mobile
        ctx2 = browser.new_context(
            viewport={"width": 390, "height": 844},
            has_touch=True,
            is_mobile=True,
        )
        page2 = ctx2.new_page()
        results["mobile_390x844"] = run_checks(page2, "mobile")
        ctx2.close()

        browser.close()

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
