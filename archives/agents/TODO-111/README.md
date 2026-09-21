# TODO-111 の分担

| 担当 | 受け持ち |
|------|----------|
| main | 文言の修正、スペースの一括置換、`duration` の測り直し、`ytslide index` |
| verifier | ブラウザでの表示確認と `uv run pytest` |

## この分担にした理由

文言だけの変更で分岐も条件式も変わらないため、reviewer は入れない。ただし
`slides/*.js` の `title`・本文と `index.html` の説明文は画面に出るので、
「書式が揃っているか」だけでは済まない。表示の確認は実装した本人に任せず、
verifier に分けた（`~/.claude/CLAUDE.md` の「確認の担当を別に分ける」）。

実装は 1 行単位の置換が中心で、対象の列挙も `grep` で済むため main が行った。

## 報告

- [verifier-report.md](verifier-report.md)
