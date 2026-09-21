# TODO-096 の分担

項目の記録は
[`archives/todo/TODO-096. ytslide コマンド 1 つで扱えるようにする.md`](../../todo/TODO-096.%20ytslide%20コマンド%201%20つで扱えるようにする.md)。
2 つの表（見込みと実施、消費トークン）はそちらにある。

## なぜ分けたか

複数のファイルにまたがり、実装・テスト・文書がまとまって要る項目なので、
実装の担当を分けた。挙動が変わる項目なので、確認の担当とは別にレビューの
担当も入れた（`~/.claude/CLAUDE.md`）。reviewer を先、verifier を後に回し、
レビューの指摘を直してから実測させた。

## 依頼と報告

| 担当 | 依頼 | 報告 | 何を頼んだか |
|------|------|------|--------------|
| implementer（1 回目） | [brief-implementer-A.md](brief-implementer-A.md) | [implementer-A-report.md](implementer-A-report.md) | パッケージ化。`src/ytslide/`・`pyproject.toml`・`tests/`、`tools/` の削除 |
| implementer（2 回目） | [brief-implementer-B.md](brief-implementer-B.md) | [implementer-B-report.md](implementer-B-report.md) | 文書とスライドの書き換え |
| implementer（3 回目） | 依頼はメッセージで直接 | [implementer-C-report.md](implementer-C-report.md) | レビュー指摘の手当て（`init` と `--only` のテスト、ruff） |
| reviewer | [brief-reviewer.md](brief-reviewer.md) | [reviewer-report.md](reviewer-report.md) | 差分を規約と設計に照らして見る |
| verifier | [brief-verifier.md](brief-verifier.md) | [verifier-report.md](verifier-report.md) | 実際に叩いて確かめる |

implementer は**立て直さず、同じ担当に 3 回続けて頼んだ**。
