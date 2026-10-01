# TODO-127. フルスクリーン中の字幕の背景を少し薄くする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 18 | 2,795 | 9,680 | 504,185 | 89% |
| verifier | Sonnet 5.5 | medium | 6 | 44 | 25,403 | 38,533 | 11% |
| 合計 |  |  | 24 | 2,839 | 35,083 | 542,718 | 計 580,664 |

- verifier は定義の `model: sonnet` のまま。見込みには Sonnet 5 と書いたが、実際に動いたのは Sonnet 5.5

## きっかけ

TODO-125 でフルスクリーン中の字幕を映画の字幕のように出したが、利用者から
背景の黒をもう少しだけ薄くしてほしいと言われた。値は 0.6 / 0.5 / 0.45 / 0.4 から
利用者が 0.45 を選んだ。

## やったこと

`player.html` の `#viewport-stage.is-fullscreen > #subtitle-banner` の背景を
`rgba(0, 0, 0, 0.6)` から `rgba(0, 0, 0, 0.45)` にした。通常時の字幕の背景は変えていない。

## 確かめたこと

verifier が 1920x1080 の Playwright で実測した（[報告](../agents/TODO-127/verifier-report.md)）。

- フルスクリーン中の背景の計算値が `rgba(0, 0, 0, 0.45)` になった（変更前は 0.6）
- 通常時の背景は変更前と同じ `rgba(2, 6, 23, 0.95)`
- スクリーンショットで、背景が透けた半透明の黒の上に白い文字が読め、欠けや余計なものが無い

明るい背景のスライドでの読みやすさは見ていない（文字には `text-shadow` が付いている）。

## 分担の振り返り

- verifier は計算値が 0.45 になったことと、通常時に波及していないことを実測で確かめた。食い違いは見つけなかった
- 見込みとの食い違いは verifier のモデル名だけ（`sonnet` が Sonnet 5.5 を指していた）。次から見込みにも Sonnet 5.5 と書く
- CSS の値 1 つの変更なら、次も main の実装と verifier 1 つで組む。verifier の依頼は条件を 1 つに絞り、前の項目の計測スクリプトを流用させると、今回の量（cache_creation 25k）で済む
