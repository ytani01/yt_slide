# TODO-120 の分担

- main: 実装（1 行の追加と文書 2 か所）
- reviewer（Opus 5.5 / high）: 分岐が増える挙動変更なので入れた。`replaceState` との相互作用、再生中の扱い、文書との食い違いを見た → `reviewer-report.md`
- verifier（Sonnet 5.5 / medium）: reviewer の後。Playwright で実測、壊すと落ちるかも確かめた → `verifier-report.md`・`verify.py`
