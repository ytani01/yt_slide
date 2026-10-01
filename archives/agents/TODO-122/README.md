# TODO-122 の分担

| 担当 | モデル / effort | 見るもの |
|------|-----------------|----------|
| main | Opus 5.5 / high | 実装・文書・スライド |
| reviewer | Opus 5.5 / high | 差分の設計と分岐（`init --claude`、chromium 起動の失敗の扱い）、文書の食い違い |
| verifier | Sonnet 5.5 / medium | reviewer のあと。CLI を実際に叩く・wheel の中身・文書の手順の再現・スライドの表示 |

**分担の理由** — `init` の分岐と Playwright の失敗の扱いが変わるので reviewer を入れた
（テストが通っても分岐の意味は捕まえられない）。README と UsersGuide に試せる
コマンド例があるので、その再現は verifier に分けた。reviewer の指摘で差分が
変わりうるので、verifier は reviewer のあとに回す。

- [reviewer-report.md](reviewer-report.md)
- [verifier-report.md](verifier-report.md)
