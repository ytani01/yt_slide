# TODO-117 の分担

見込みどおり implementer + reviewer + verifier の 3 分担。項目を立てたときの
見込みで常設の定義（`~/.claude/agents/*.md`）が足りると判断済みだったので、
着手時に分担案を出し直してはいない。

- **implementer** — player.html・src/ytslide/check.py（新規）・cli.py・
  docs・tests/test_check.py（新規）を実装し、実機で壊れたスライドを試して
  確認した。報告: `implementer-report.md`
- **reviewer** — 差分をレビューし、要修正 0 件・検討事項 6 件を報告した。
  報告: `reviewer-report.md`
- **verifier** — TODO-117 のチェックリスト 4 項目を実機で独立に確認した。
  報告: `verifier-report.md`

詳しい振り返りは `archives/todo/TODO-117. スライドの書き間違いを事前に見つけ、失敗の理由を画面に出す.md`
の「分担の振り返り」節にある。
