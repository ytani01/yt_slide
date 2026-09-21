# TODO-107 の分担

[TODO-107](../../todo/TODO-107.%20スライドの見本の呼び方を「型」から「テンプレート」に変える.md)

| 担当 | 受け持ち |
|------|----------|
| main | 「型」→「テンプレート」の置き換え、`duration` の測り直し、`index.html` の再生成 |
| verifier | 置き換え漏れ・誤った置き換え・`duration`・描画の確認 |

## この分担にした理由

文言だけで分岐は変わらないので reviewer は立てなかった。
置き換えは 1 件ずつ意味を見る必要があり（「定型」「Python の型」が
混ざる）、implementer に渡すより main でやるほうが速い。
確認は実装した本人とは別の目が要るので verifier に分けた。

## ファイル

- [verifier-brief.md](verifier-brief.md) — 依頼文
- [verifier-report.md](verifier-report.md) — 報告
- `shot/` — 描画確認のスクリーンショット 26 枚
