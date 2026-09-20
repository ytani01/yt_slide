# TODO-078 の分担

挙動が変わる項目（分岐と非同期の順序が変わる）なので、実装・レビュー・確認を別々に分けた（`~/.claude/CLAUDE.md` の規約）。方針と文書の整理は main。

| 担当 | 役割 | 報告 |
|------|------|------|
| implementer | `player.html` の実装、文書、確認スクリプトの作成 | [implementer-report.md](implementer-report.md) |
| reviewer | 差分を読み、分岐と非同期の順序を確かめる。実測はしない | [reviewer-report.md](reviewer-report.md) |
| verifier | Playwright（Chromium）で失敗の再現・再試行・切替・位置を実測 | [verifier-report.md](verifier-report.md) |

reviewer を先、verifier を後に回した（reviewer の指摘で実装が変わると、verifier の実測が古い差分に対するものになるため）。位置の直しのあとは verifier に縦持ちだけ再測定させた。

確認スクリプトは [implementer-check.mjs](implementer-check.mjs)（implementer の自己確認）、[verify.mjs](verify.mjs)・[verify-v2.mjs](verify-v2.mjs)（verifier）。

経緯は [`archives/todo/TODO-078. 音声の再生失敗を画面に知らせる.md`](../../todo/TODO-078.%20音声の再生失敗を画面に知らせる.md)。
