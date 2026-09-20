# TODO-077 の分担

実装と文書は main（Opus 5 / effort medium）。挙動が変わる項目なので、
確認とレビューを別々に分けた（`~/.claude/CLAUDE.md` の規約）。

| 担当 | 役割 | 報告 |
|------|------|------|
| reviewer | 差分を規約と設計に照らして読む。実測はしない | [reviewer-report.md](reviewer-report.md) |
| verifier | Playwright（Chromium）で 1280×800 と 390×844 を実測 | [verifier-report.md](verifier-report.md) |

reviewer を先、verifier を後に回した（reviewer の指摘で実装が変わると、
verifier の実測が古い差分に対するものになるため）。

検証スクリプトは [verify.py](verify.py)。`python3 -m http.server 8777` を
リポジトリ直下で動かしてから実行する。

経緯は [`archives/todo/TODO-077. チャプター一覧を検索できるようにする.md`](../../todo/TODO-077.%20チャプター一覧を検索できるようにする.md)。
