# TODO-126 verifier 報告

Playwright(chromium, 1280x800, http.server 8765)で `#slide-num`・`#total-slides`・`button span.font-mono` を読み出した。

| 条件 | 読み出した値 | 結果 |
|---|---|---|
| 1. readme | 1 枚目 `1 / 7`、一覧 7 件 `1,2,3…6,7` | 一致 |
| 2. claude-memo | 1 枚目 `01 / 17`、次へ 1 回で `02`、一覧 17 件 `01,02,03…16,17` | 一致 |
| 3. 3 桁(tmp-todo126, 120 枚) | 1 枚目 `001 / 120`、一覧 120 件 先頭 `001,002,003`・末尾 `119,120` | 一致 |

- 3 桁用の `slides/tmp-todo126.js` は claude-memo.js の末尾で slideData を 120 枚に水増しして作り、確認後に削除済み。
- `git status --short`: ` M TODO.md`、` M player.html`、`?? archives/agents/TODO-126/` のみ。指示範囲どおり。
- 差分は player.html の `formatSlideNum()` 追加と 2 か所の置換のみ。
- 確かめていないこと: 再生・読み上げ、レイアウト、他のスライド一式、テスト(`uv run pytest`)。判断が要る点なし。
