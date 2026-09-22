# TODO-115 の分担

| 担当 | モデル | 役割 |
|------|--------|------|
| main | Opus 5 / effort low | `index.html`・`docs/User.md` から README 埋め込みを削る |
| verifier | Sonnet 5 / effort medium | 削り残しと一覧ページの表示を実測で確かめる |

削除だけの小さい項目だが、`index.html` は挙動のあるファイルなので、
確認は別の担当に分けた（`~/.claude/CLAUDE.md` の規約）。分岐や条件式は
変わらず、機能を丸ごと消すだけなので reviewer は立てていない。

- [brief-verifier.md](brief-verifier.md) — verifier への依頼
- [verifier-report.md](verifier-report.md) — verifier の報告
