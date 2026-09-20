#!/usr/bin/env python3
"""TODO-062 検証用のスクリーンショット撮影スクリプト。

tools/make-video.py の FIT を流用し、1920x1080 で各スライドを撮る。

    python3 shot.py <html_path> <slides_name> <index0> <out_png>

<html_path> は player.html か player-head.html への相対/絶対パス。
<index0> は 0 始まりのスライド番号。
"""
import sys
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent.parent
WIDTH, HEIGHT = 1920, 1080

FIT = """(i) => {
  renderSlide(i);
  document.getElementById('slide-canvas').classList.remove('slide-fade-enter');
  document.querySelectorAll('body > *').forEach(e => e.style.display = 'none');
  const v = document.getElementById('player-viewport');
  document.body.appendChild(v);
  Object.assign(v.style, {position:'fixed', inset:'0', width:'%(width)dpx', height:'%(height)dpx',
                          borderRadius:'0', border:'none', margin:'0', display:'flex'});
  v.querySelector('#slide-num').closest('div.flex').style.display = 'none';
  document.getElementById('tap-feedback-icon').parentElement.style.display = 'none';
}""" % {'width': WIDTH, 'height': HEIGHT}


def shoot(html_path, slides_name, index0, out_png):
    html_path = pathlib.Path(html_path).resolve()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': WIDTH, 'height': HEIGHT})
        page.goto(html_path.as_uri() + f'?slides={slides_name}')
        page.wait_for_load_state('networkidle')
        page.evaluate(FIT, index0)
        page.screenshot(path=str(out_png))
        browser.close()


def measure(html_path, slides_name, index0, selector_js):
    """FIT 後に selector_js（JS 式）を evaluate して返す（getBoundingClientRect 等）。"""
    html_path = pathlib.Path(html_path).resolve()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': WIDTH, 'height': HEIGHT})
        page.goto(html_path.as_uri() + f'?slides={slides_name}')
        page.wait_for_load_state('networkidle')
        page.evaluate(FIT, index0)
        result = page.evaluate(selector_js)
        browser.close()
        return result


if __name__ == '__main__':
    _, html_path, slides_name, index0, out_png = sys.argv
    shoot(html_path, slides_name, int(index0), out_png)
    print(f'saved: {out_png}')
