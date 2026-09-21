# TODO-098 の分担

| 担当 | 依頼 | 報告 |
|------|------|------|
| implementer（1 回目・取り下げ） | [brief-implementer.md](brief-implementer.md) | [implementer-report.md](implementer-report.md) |
| implementer（2 回目・レビュー手当てを含む） | [brief-implementer-2.md](brief-implementer-2.md) | [implementer-2-report.md](implementer-2-report.md) |
| reviewer | [brief-reviewer.md](brief-reviewer.md) | [reviewer-report.md](reviewer-report.md) |
| verifier | [brief-verifier.md](brief-verifier.md) | [verifier-report.md](verifier-report.md) |

## この分担にした理由

`src/ytslide/cli.py`・`player.html`・テスト・文書にまたがるので、
実装を implementer に分けた。**`init` と `player.html` の挙動が変わる**ため、
確認の verifier とは別に reviewer を立てた。reviewer を先、verifier を
後に回した（並行させると、指摘で実装が変わって verifier の実測が
古い差分に当たる）。

1 回目の実装は方針の差し替えで取り下げたが、**依頼と報告は消さずに残した**
（同じ話を蒸し返さないため）。

表（見込みと実施、消費トークン）は
[`archives/todo/TODO-098. ytslide init した先に既定の readme が無い.md`](../../todo/TODO-098.%20ytslide%20init%20した先に既定の%20readme%20が無い.md)
にある。
