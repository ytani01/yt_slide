# TODO-131 verifier 報告

CSS: `font-size: clamp(14px, min(1.8vw, 3.2dvh), 33px);`（`player.html`）。Playwright (chromium) で、字幕をオンにして再生、`#fullscreen-btn` で全画面に入り（`is-fullscreen` が付いたことを確認）、計算後の fontSize を読んだ。

| 画面 | 期待 | `#subtitle-banner` | `#caption-text` |
|---|---|---|---|
| 1920×1080 | 33px | 33px | 33px |
| 1280×720 | 23.04px | 23.04px | 23.04px |
| 390×844 | 14px | 14px | 14px |

3 件とも一致。

## スクリーンショット（1280×720）
字幕は枠の下端（bottom 691px / 高さ 720px）に収まり、3 行で欠けていない。余計なものは無い（左上に × と「字幕」ボタン、右上にスライド番号のみ）。

## pytest
`uv run pytest -q` → 41 passed。

## 変更ファイル
TODO.md, docs/Developer.md, player.html（各 数行）。player.html は CSS 2 行とコメント 1 行。範囲は指示と合っている。

## 補足
- 字幕は既定で非表示（`showCaptions = false`）。測定では `#toggle-caption-btn` を先に押した。
- 立てた http.server（8765）は止めた。ポート 8000 の別の http.server（PID 51694）は自分のものではないので触っていない。
