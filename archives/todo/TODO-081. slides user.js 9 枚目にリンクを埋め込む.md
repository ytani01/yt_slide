# TODO-081. `slides/user.js` 9 枚目にリンクを埋め込む

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |
| 実施 | Sonnet 5 / effort 記載なし | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Sonnet 5 | 記載なし | 2,894 | 37,503 | 75% |
| verifier | Sonnet 5 | 記載なし | 3,598 | 20,420 | 25% |
| 合計 |  |  | 6,492 | 57,923 | 概算 $0.4 |

- verifier は呼び出しで sonnet を指定した。集計は `--since '2026-09-20 19:32:00'`（この項目の会話だけ）

## きっかけ

9 枚目「近い見た目をコピーする」の 2 枚のカード（`claude-memo.js`・`docs/User.md`）から、実物を開けるようにしたかった。

## やったこと

`slides/user.js` の 2 枚のカードを `<a>` にした。リンク先は
`https://github.com/ytani01/yt_slide/blob/main/slides/claude-memo.js` と
`.../docs/User.md`。`target="_blank" rel="noopener"` を付け、
`onclick="event.stopPropagation()"` で、`player.html` の
`playerViewport` のクリック（再生・一時停止の切り替え）に伝わらないようにした。

## 確かめたこと

verifier が Playwright で実測した（`archives/agents/TODO-081/verifier-report.md`）。
href・target・rel が想定どおり、クリックで再生状態とスライド番号が変わらず新しいタブが開く、
1280x720 と 390x844 で見た目が崩れない、全 15 枚がエラー無しで描画される。

## 残ること

- `main` ブランチに載っていないと 404 になる。push のとき利用者が確かめる
- `onclick` を外した場合の比較、タッチ操作、キーボード操作は未確認
