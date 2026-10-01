# TODO-124 の分担

- main（Opus 5.5 / medium）: 事前の実測と実装。`player.html` に CSS 1 行と JS を十数行足すだけなので分けない
- reviewer（Opus 5.5 / high）: クリックの扱い（スワイプ・暗幕・再生ボタンとの兼ね合い）の分岐が変わるため
- verifier（Sonnet 5.5 / medium）: Playwright での実測。reviewer の後に回す

事前の実測は `probe.py`。Playwright（chromium）の `touchscreen.tap` を 2 回と
`mouse.dblclick` で、どちらも `click`（detail 1）→ `click`（detail 2）→ `dblclick`
の順に届いた。実機の Android Chrome では測っていない。

報告は同じディレクトリの `reviewer-report.md`・`verifier-report.md`。
