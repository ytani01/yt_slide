# TODO-093 の分担

`index.html` に `README.md` をレンダリングして載せる項目。

| 担当 | 何を頼んだか |
|------|--------------|
| main | 実装（`index.html`） |
| reviewer | 差分を規約と設計に照らしてレビュー |
| verifier | Playwright（Chromium）で実測 |

分担にした理由は、`CLAUDE.md` の「コードやファイルを変える項目では、確認の
担当を別のサブエージェントに分ける」と、「挙動が変わる項目、分岐や条件式が
変わる項目にはレビューの担当も入れる」による。`README.md` が取れなかった
ときに何も出さない分岐が増えるので reviewer も立てた。reviewer を先、
verifier を後にした。

- [reviewer の報告](reviewer-report.md)
- [verifier の報告](verifier-report.md)

スクリーンショットは `1280-*.png`・`390-*.png`。
