# TODO-064 の分担

| 担当 | モデル | 役割 |
|------|--------|------|
| main | Opus 5 / effort high | 追記の内容を決め、`~/.claude/CLAUDE.md` を書き換える |
| verifier | Sonnet 5 / effort medium | TODO-061 の表と追記後の CLAUDE.md を突き合わせる |

## 分担にした理由

文書だけを変える項目だが、**確かめる中身が「書式が揃っているか」では
済まない**（13 件が漏れなく入っているか、採らないと決めた 2 件が紛れて
いないかの突き合わせ）。`~/.claude/CLAUDE.md` の「main が確認してよい」
例外に当たらないので、確認は別の担当に分けた。

分岐や挙動は変わらないので reviewer は入れていない。

突き合わせは手順が決まっているため、モデルは定義のまま Sonnet 5。

## ファイル

- `verifier-request.md` — 依頼書
- `verifier-report.md` — 報告
