# TODO-123 verifier report

測定: `uv run --with playwright python archives/agents/TODO-123/verify.py`（終了コード 0、headless chromium）。
各画面で再生ボタンを押して再生中にしてから、`#fullscreen-btn` でフルスクリーンにした。

| 項目 | 1920x1080 | 1280x800 | 844x390 (touch) | 390x844 (touch) |
|---|---|---|---|---|
| 1 通常表示の display | none | none | none | none |
| 2 フルスクリーン時 display / rect [l,t,r,b] | flex / [12,12,52,52] | flex / [12,12,52,52] | flex / [12,12,52,52] | flex / [12,12,52,52] |
| 2 elementFromPoint(中心) | 子の I（×の子） | 同 | 同 | 同 |
| 3 枚数表示の親の矩形 [l,t,r,b] | [1749,25,1895,59] | [1109,65,1255,99] | [645.2,18.1,750.6,42.6] | [330.3,322.5,379.8,334.7] |
| 3 重なり | なし | なし | なし | なし |
| 4 クリック/tap 後 is-fullscreen / fullscreenElement | 外れた / null | 同 | 同 | 同 |
| 4 再生アイコン 前→後 | pause→pause | pause→pause | pause→pause | pause→pause |
| コンソールエラー | 0 | 0 | 0 | 0 |

- 操作ガイド（dialog）に「左上の ×」を含む: true（1280x800 で確認）
- スクリーンショット: `fs-1920x1080.png` `fs-1280x800.png` `fs-844x390.png` `fs-390x844.png`
  - 4 枚とも × は欠けず、前面に見えている。

## 食い違い・気づき（実害は未確認）

- 1280x800 では、フルスクリーン中のレターボックス（枠の外）に裏のページのヘッダー（ロゴと「yt_slide の紹介」）が薄く映っており、× がそのロゴのアイコンに重なって見える（`fs-1280x800.png`）。× 自体は押せる（elementFromPoint は × を返し、クリックで戻った）。見た目の問題かどうかは判断しない。
- 844x390 と 390x844 でも裏のページが暗幕越しに見えるが、× とは干渉していない。

## 確かめていないこと
- 実機の Android / iPhone。擬似フルスクリーン（requestFullscreen なし）の経路での × は未測定（headless chromium は Fullscreen API があり fullscreenElement が立つ経路のみ）。
- 再生が止まった状態から押した場合（今回は再生中のみ）。
- 差分は player.html / docs/Developer.md / TODO.md のみで、指示範囲外のファイル変更は見ていない。
