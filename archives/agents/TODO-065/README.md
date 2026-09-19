# TODO-065 の分担

`tools/measure-duration.py` に `-n`（測る回数、中央値）を足した項目。

| 担当 | 何を頼んだか | 報告 |
|------|--------------|------|
| main | 実装（`-n` の追加、`fetch_duration()` の切り出し、テスト、`docs/User.md`） | — |
| reviewer | 差分を TODO-065 で決めたことと規約に照らして見る。中央値の取り方、引数の検証、テストの強さ | [reviewer-report.md](reviewer-report.md) |
| verifier | `--text` / スライド番号 / `--all --write` のそれぞれで `-n` が効くかを実測 | [verifier-report.md](verifier-report.md) |

## この分担にした理由

- 実装が 1 ファイル 40 行程度なので implementer は立てず、main が書いた。
  そのぶん**確認は必ず別の担当に分ける**（実装した本人は「動くはず」で済ませる）
- 分岐（`repeat` の回数と引数の検証）が増えるので、verifier とは別に reviewer を
  入れた。テストが通ることを見ても、中央値の取り方が正しいかは分からない
- **reviewer を先、verifier を後**に回した。reviewer の指摘で実装が変わると、
  verifier の実測が古い差分に対するものになるため
- `--all --write` の確認先は `claude-memo` と名指しした。同じセッションで
  TODO-059 が `readme` を触っていたので、書き戻しがぶつからないようにした

verifier は TODO-059 の確認も兼ねている。
