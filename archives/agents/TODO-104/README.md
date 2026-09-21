# TODO-104 の分担

項目: [TODO-104. 本文の既定サイズを枠に追従させる](../../todo/TODO-104.%20本文の既定サイズを枠に追従させる.md)

`#slide-canvas` に既定の `font-size` を入れる項目。継承の範囲が変わる、
つまり挙動が変わるので、確認の担当（verifier）とは別にレビューの担当
（reviewer）も入れた。並行させると reviewer の指摘で実装が変わり、
verifier の実測が古い差分に対するものになるため、reviewer を先に回した。

実装は main が行った。CSS 1 か所の追加で、複数のファイルにまたがらず、
テストや文書もまとまっては要らない規模だったため。

| 担当 | モデル | effort | 見たもの | 報告 |
|------|--------|--------|----------|------|
| reviewer | Sonnet 5 | high | 差分の妥当性、`clamp` の下限・上限が効く条件、`cqw` の解決先、詳細度、文書との整合 | [reviewer-report.md](reviewer-report.md) |
| verifier | Sonnet 5 | medium | 既存 5 本（69 スライド）の computed font-size の変化、スマホ幅での実表示、下限が 16px を下回らないか | [verifier-report.md](verifier-report.md) |

どちらも定義（`~/.claude/agents/`）のまま。モデルの上書きはしていない。

## 残した計測スクリプトとデータ（verifier）

- `check1_fontsize.js` — 全デッキ・全スライドの computed font-size を変更前後で突き合わせる
- `check2_mobile.js` — 390x844 で装飾なしの `body` を測る
- `check3_widths.js` — 幅 760〜1300px を振って下限を確かめる
- `shot_compare.js` / `noise_check.js` — スクリーンショットの画素差分と、その基準になる読み込み揺れ
- `out1_fontsize_*.json` / `out3_widths.json` — 生データ
- `sample.js` — `docs/User.md`「最小の例」をそのまま保存したもの
