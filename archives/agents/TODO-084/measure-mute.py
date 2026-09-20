"""TODO-084 項目7: 消音時に duration で自動的に進むかを実測する。

使い方:
    python3 -m http.server 8765 &   # リポジトリのトップで配信
    python3 archives/agents/TODO-084/measure-mute.py
    kill <server pid>

ケース A: 再生開始後、1 枚目の途中で消音ボタンを押す
ケース B: 先に消音ボタンを押してから再生を始める
ケース C: 読み終わり（バッジが「朗読完了」）から次のスライドへ移るまでの
          待ちの最中に消音ボタンを押す（速度 2.0x・待ち 1 秒にして
          待ちの窓を捕まえやすくする。TODO-084 の最終確認で追加）

それぞれ、押した直後から一定間隔でハッシュと状態表示を記録し、
duration(12s) + pause(2s) の 2 倍(28s) を超えるまで観測する。
"""
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8765/player.html?slides=readme"
WATCH_SECONDS = 32  # duration(12) + pause(2) = 14s の 2 倍強
POLL_INTERVAL = 2


def get_state(page):
    h = page.evaluate("location.hash")
    badge = page.evaluate(
        "document.getElementById('audio-status-badge')?.textContent ?? ''"
    )
    return h, badge


def watch(page, label, start_time):
    log = []
    t0 = time.monotonic()
    while time.monotonic() - t0 < WATCH_SECONDS:
        elapsed = time.monotonic() - t0
        h, badge = get_state(page)
        log.append((round(elapsed, 1), h, badge))
        time.sleep(POLL_INTERVAL)
    return log


def run_case_a(browser):
    page = browser.new_page()
    page.goto(BASE_URL)
    page.wait_for_selector("#play-btn")
    page.click("#play-btn")
    # 1 枚目の途中（3 秒後）で消音ボタンを押す
    time.sleep(3)
    page.click("#mute-btn")
    print("[Case A] muted at t=3s after play start (mid-slide 1)")
    log = watch(page, "A", time.monotonic())
    page.close()
    return log


def run_case_b(browser):
    page = browser.new_page()
    page.goto(BASE_URL)
    page.wait_for_selector("#mute-btn")
    page.click("#mute-btn")
    page.click("#play-btn")
    print("[Case B] muted before play, then play pressed")
    log = watch(page, "B", time.monotonic())
    page.close()
    return log


def run_case_c(browser):
    """読み終わりの待ち（1〜3 秒）の最中に消音ボタンを押す。

    待ちの窓を捕まえやすくするため、速度を 2.0x、待ち秒数を 1 秒に
    変えてから再生する。バッジのテキストを 100ms 間隔でポーリングし、
    「朗読完了」に変わった直後に消音ボタンを押す。
    """
    page = browser.new_page()
    page.goto(BASE_URL)
    page.wait_for_selector("#play-btn")
    page.select_option("#speed-select", "2")
    page.select_option("#pause-select", "1")
    page.click("#play-btn")

    t_start = time.monotonic()
    caught_at = None
    # 朗読完了になるまで最大 20 秒待つ（1 枚目 duration=12s / 速度2.0x なら
    # 音声側が長引いても 20 秒あれば届くはず）
    deadline = t_start + 20
    while time.monotonic() < deadline:
        _, badge = get_state(page)
        if badge == "朗読完了":
            caught_at = time.monotonic() - t_start
            page.click("#mute-btn")
            break
        time.sleep(0.1)

    if caught_at is None:
        print("[Case C] '朗読完了' を検出できなかった（20 秒待っても出なかった）")
        page.close()
        return None

    print(f"[Case C] muted at t={caught_at:.2f}s after play start "
          f"(badge showed '朗読完了'; speed=2.0x, pause=1s)")
    log = watch(page, "C", time.monotonic())
    page.close()
    return log


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            args=["--autoplay-policy=no-user-gesture-required"]
        )
        log_a = run_case_a(browser)
        print("Case A log (elapsed_s, hash, badge):")
        for row in log_a:
            print(" ", row)

        log_b = run_case_b(browser)
        print("Case B log (elapsed_s, hash, badge):")
        for row in log_b:
            print(" ", row)

        log_c = run_case_c(browser)
        print("Case C log (elapsed_s, hash, badge):")
        if log_c is None:
            print("  (捕まえられなかったため観測なし)")
        else:
            for row in log_c:
                print(" ", row)

        browser.close()


if __name__ == "__main__":
    main()
