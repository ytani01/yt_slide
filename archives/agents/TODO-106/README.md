# TODO-106 の分担

| 担当     | 何を任せたか |
|----------|--------------|
| main     | README.md・docs/User.md・slides/readme.js・slides/user.js の執筆、`duration` の測定 |
| verifier | 構文チェック、描画のスクリーンショット確認、リンクの href 確認、`duration` の再測定、依頼文の例と実装の整合、アンカーの照合 |

## この分担にした理由

文言だけの変更で分岐は変わらないので reviewer は立てなかった。ただし
`slides/user.js` に枚を足し、`slides/readme.js` の 4 つの枚を書き換えたので、
描画と `duration` は実測が要る。書いた本人は「動くはず」で済ませるため、
確認は verifier に分けた。

## 報告

- [verifier-report.md](verifier-report.md) — 6 項目すべて食い違いなし。
  スクリーンショットは同ディレクトリの `readme_1.png` / `readme_4.png` /
  `readme_5.png` / `readme_6.png` / `user_5.png`
