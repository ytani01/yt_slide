#!/usr/bin/env python3
"""TODO-105 の手順再現と file URL のブラウザ確認。"""

from __future__ import annotations

import json
import hashlib
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
def minimal_example() -> str:
    text = (ROOT / "docs/User.md").read_text(encoding="utf-8")
    match = re.search(r"## 最小の例.*?```js\n(.*?)```", text, re.S)
    if not match:
        raise RuntimeError("docs/User.md の最小の例を抽出できない")
    return match.group(1)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(cmd: list[str], cwd: Path) -> dict:
    proc = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    return {"cmd": cmd, "returncode": proc.returncode,
            "stdout": proc.stdout[-2000:], "stderr": proc.stderr[-2000:]}


def fetch(url: str) -> dict:
    try:
        req = Request(url, headers={"User-Agent": "TODO-105-verifier"})
        with urlopen(req, timeout=10) as response:
            data = response.read()
            return {"url": url, "status": response.status, "bytes": len(data)}
    except Exception as exc:  # network availability is an observation
        return {"url": url, "error": f"{type(exc).__name__}: {exc}"}


def prepare(root: Path) -> dict:
    copy_root = root / "copy-mode"
    (copy_root / "slides").mkdir(parents=True)
    shutil.copy2(ROOT / "player.html", copy_root / "player.html")
    shutil.copy2(ROOT / "slides/template.js", copy_root / "slides/template.js")
    (copy_root / "slides/sample.js").write_text(minimal_example(), encoding="utf-8")
    before = {name: sha256(copy_root / name) for name in ("player.html", "slides/template.js")}

    cli_root = root / "cli-mode"
    cli_root.mkdir()
    init = run(["uv", "run", "ytslide", "init"], cli_root)
    (cli_root / "slides").mkdir(exist_ok=True)
    (cli_root / "slides/sample.js").write_text(minimal_example(), encoding="utf-8")
    index_after_sample = run(["uv", "run", "ytslide", "index"], cli_root)

    # reviewer 指摘の再現: コピー方式から init 後 index までを同じ手順で確認。
    copy_init = run(["uv", "run", "ytslide", "init"], copy_root)
    copy_index = run(["uv", "run", "ytslide", "index"], copy_root)
    after = {name: sha256(copy_root / name) for name in before}
    return {
        "copy_files_before_cli": ["player.html", "slides/template.js", "slides/sample.js"],
        "cli_init": init,
        "cli_files": sorted(str(p.relative_to(cli_root)) for p in cli_root.rglob("*")),
        "cli_index_after_sample": index_after_sample,
        "copy_init_after_manual_files": copy_init,
        "copy_index_after_init": copy_index,
        "copy_player_template_unchanged": before == after,
        "copy_player_template_sha256_before": before,
        "copy_player_template_sha256_after": after,
        "copy_files_after_cli": sorted(str(p.relative_to(copy_root)) for p in copy_root.rglob("*")),
    }


def bounds(page) -> dict:
    return page.evaluate("""() => {
      const vw = innerWidth, vh = innerHeight;
      const canvas = document.querySelector('#slide-canvas')?.getBoundingClientRect();
      const els = [...document.querySelectorAll('#slide-canvas, #slide-canvas *')];
      const outside = els.filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && canvas &&
          (r.left < canvas.left - 1 || r.top < canvas.top - 1 ||
           r.right > canvas.right + 1 || r.bottom > canvas.bottom + 1);
      }).slice(0, 10).map(e => ({tag:e.tagName, text:(e.innerText||'').slice(0,80),
        rect:[e.getBoundingClientRect().left,e.getBoundingClientRect().top,
          e.getBoundingClientRect().right,e.getBoundingClientRect().bottom]}));
      return {viewport:[vw,vh], canvas: canvas && [canvas.left,canvas.top,canvas.right,canvas.bottom],
        scroll:[document.documentElement.scrollWidth, document.documentElement.scrollHeight], outside};
    }""")


def browser_checks(root: Path) -> list[dict]:
    results = []
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True,
                                        executable_path=str(Path.home() / ".cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux-arm64/chrome-headless-shell"),
                                        args=["--autoplay-policy=no-user-gesture-required",
                                              "--disable-crash-reporter", "--disable-breakpad"])
        except Exception as exc:
            return [{"browser_error": f"{type(exc).__name__}: {exc}"}]
        for width, height in [(1280, 720), (390, 844)]:
            context = browser.new_context(viewport={"width": width, "height": height})
            # 外部 TTS へ本文を送信しない安全な確認。表示用 CDN だけ許可する。
            allowed_hosts = {"cdn.tailwindcss.com", "cdnjs.cloudflare.com",
                             "fonts.googleapis.com", "fonts.gstatic.com"}
            def allow_display_cdn(route):
                url = route.request.url
                if url.startswith("file:") or any(host in url for host in allowed_hosts):
                    route.continue_()
                else:
                    route.abort()
            context.route("**/*", allow_display_cdn)
            page = context.new_page()
            tts_responses = []
            page.on("response", lambda response: tts_responses.append({"url": response.url,
                "status": response.status}) if "translate_tts" in response.url else None)
            for label, path, slides, selected in [
                ("sample-copy", root / "copy-mode/player.html", "sample", [1]),
                ("readme", ROOT / "player.html", "readme", [1, 3]),
                ("user", ROOT / "player.html", "user", [1, 3]),
            ]:
                for number in selected:
                    page.goto(path.as_uri() + f"?slides={slides}#{number}", wait_until="domcontentloaded",
                              timeout=5000)
                    page.wait_for_timeout(700)
                    if number == 3:
                        page.get_by_role("button", name="次のスライド").click()
                        page.get_by_role("button", name="次のスライド").click()
                        page.wait_for_timeout(250)
                    title = page.locator("#control-title-preview").inner_text()
                    body = page.locator("#slide-canvas").inner_text()
                    item = {"label": label, "slide": number, "title": title,
                            "body_head": body[:120], "bounds": bounds(page)}
                    if number == 1 and label in {"readme", "user"}:
                        page.get_by_role("button", name="次のスライド").click()
                        page.wait_for_timeout(250)
                        next_title = page.locator("#control-title-preview").inner_text()
                        page.get_by_role("button", name="前のスライド").click()
                        page.wait_for_timeout(250)
                        item["navigation"] = {"next_title": next_title,
                                               "returned_title": page.locator("#control-title-preview").inner_text()}
                    if label == "sample-copy":
                        item["playback"] = {"attempted": False,
                            "reason": "TTS を遮断した安全な表示確認のため再生ボタンは押していない",
                            "tts_responses": list(tts_responses)}
                    results.append({"viewport":[width,height], **item})
            context.close()
        browser.close()
    return results


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="todo105-") as temp:
        temp_root = Path(temp)
        result = {
            "temp_root": str(temp_root),
            "network": [fetch("https://github.com/ytani01/yt_slide/archive/refs/heads/main.zip"),
                        fetch("https://raw.githubusercontent.com/ytani01/yt_slide/main/docs/User.md")],
            "reproduction": prepare(temp_root),
            "browser": browser_checks(temp_root),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
