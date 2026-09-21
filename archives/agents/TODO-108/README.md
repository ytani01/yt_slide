# TODO-108 の分担

| 担当 | モデル | 役割 |
|------|--------|------|
| main | Opus 5 / effort high | `player.html` の実装 |
| verifier | Sonnet 5 / effort medium | 広い画面と狭い画面での表示の実測 |

ヘッダーの見た目だけを変える項目で、分岐や条件式は変わらないので reviewer は
付けなかった。実装は 2 箇所の書き換えで済むので main が直接行い、
確認だけ分けた（実装した本人は「動くはず」で済ませてしまうため）。

- [verifier の報告](verifier-report.md)
