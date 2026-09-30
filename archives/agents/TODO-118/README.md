# TODO-118 の分担

- main（Opus 5.5）: 実装。変更が keydown のガード 1 か所と文言だけなので、分けなかった
- reviewer（Opus 5.5 / high）: 分岐の意味が変わるのでレビューを入れた。2 回目は指摘を受けた修正だけを見た → `reviewer-report.md`
- verifier（Sonnet 5.5 / medium）: キーとフォーカス先の組み合わせを Playwright で実測した → `verifier-report.md`、`verify.py`
