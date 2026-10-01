# TODO-125 の分担

| 担当 | モデル / effort | 範囲 |
|------|-----------------|------|
| main | Opus 5.5 / medium | 実装（`player.html`・`docs/Developer.md`・README） |
| reviewer | Opus 5.5 / high | 差分のレビュー。挙動（タップ・fixed の基準・状態の共有）が変わるため |
| verifier | Sonnet 5 / medium | Playwright で、フルスクリーン中の字幕の位置・大きさ・切り替えを実測 |

変更は 1 ファイルの CSS と数行の JS なので、実装は分けなかった。
reviewer を先、verifier を後に回す（指摘で実装が変わるため）。
