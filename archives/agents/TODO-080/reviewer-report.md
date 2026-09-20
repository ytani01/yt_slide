# TODO-080 reviewer report

対象: `git diff -- player.html`（未コミット）。`docs/Developer.md` の
「再生ロジック」「読み上げ」節、`CLAUDE.md`、`TODO.md` の TODO-080 節を
確認した上でのレビュー。

## 結論

要修正・検討とも無し。指摘なし。

## 確認した観点ごとのメモ

### ハンドラの形（`prev-btn` / `next-btn` との整合）

`firstBtn` / `lastBtn` のクリックハンドラ（`player.html:1212-1218`）は
`renderSlide()` のみを呼び、`playPresentation()` は呼んでいない。
TODO-080 が「決めてあること」に書いた懸念（旧 `restartBtn` が
`renderSlide()` の後に `playPresentation()` も呼び、再生中に
`speakCurrentNarration()` が二重に走る）は解消されている。

`prevBtn` / `nextBtn` は境界チェック（`if (currentIndex > 0)` 等）を
`renderSlide()` の外で行うが、`firstBtn` / `lastBtn` は常に `0` /
`slideData.length - 1` を渡すだけで境界チェックが無い。ただし
`renderSlide()` 自体が `index < 0 || index >= slideData.length` で
弾く（`player.html:964`）ため、既に先頭・末尾にいるときに押しても
同じスライドが再描画されるだけで壊れない（実測は verifier に委ねる。
静的に読んだ限りでは異常な分岐は無い）。

### `restart-btn` の残存参照

`grep -rn "restart\|最初から" player.html docs slides README.md` で
`player.html` / `docs` / `slides` / `README.md` に該当なし。
`TODO.md` の TODO-080 節と `archives/` 配下には文言が残るが、前者は
作業中の項目記述（決着後に archives へ移す運用）、後者は過去の
経緯の記録なので、いずれもコードの参照ではない（`archives/` は
現行仕様として参照しないと `CLAUDE.md` にある）。実害なし。

`archives/agents/TODO-076/verify_playwright.py:107` に `restart-btn`
という ID 文字列が残っているが、これは TODO-076 のときの一回限りの
確認スクリプトで、`CLAUDE.md` に書かれたテストは `tools/test_*.py`
の 2 本のみ。現行のテスト実行対象ではないため実害は無い（未確認：
このスクリプトが何らかの形で再利用される運用になっていないか）。

### キー操作の分岐位置

`Home` / `End` の分岐（`player.html:1366-1371`）は `ArrowLeft` の
`else if` に続けて追加されており、`keydown` ハンドラ冒頭の除外条件
（`guide.open || e.defaultPrevented || e.isComposing` を先頭で
`return`、続けて `e.target.closest('button, input, textarea, select,
a, [contenteditable]...')` でも `return`）の**内側**に位置する。
既存の `ArrowLeft` / `ArrowRight` / `Space` と同じガードを共有しており、
矛盾は無い。`e.preventDefault()` の呼び方も他の分岐と同じ形。

### 操作ガイドの文言

- キー操作一覧に `<dt>Home / End</dt><dd>先頭／最後のスライド</dd>`
  が 1 行足された。既存の `<dt>← / →</dt><dd>前／次のスライド</dd>`
  と同じ「対になるキーを 1 行にまとめる」形式に揃っている。
- 冒頭の説明文 `Space・矢印・Home・End・F・M は...` にも `Home・End`
  が足された。
- 「その他のボタン」の段落は「最初から」の記述を削除し、送りボタンの
  並び順（先頭のスライド → 前のスライド → 再生 → 次のスライド →
  最後のスライド）を説明する文に置き換えられている。実際の HTML の
  並び（`first-btn` → `prev-btn` → `play-btn` → `next-btn` →
  `last-btn`）と一致している。

### アクセシビリティ（`aria-label` / `title`）

`first-btn` / `last-btn` の `aria-label`（「先頭のスライド」「最後の
スライド」）と `title`（「先頭のスライドへ移動（Home）」「最後の
スライドへ移動（End）」）は、`prev-btn` / `next-btn` の付け方
（`aria-label` は短い名詞、`title` は「〜へ移動（キー）」）と同じ形。
`class` も `w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700
text-slate-200 flex items-center justify-center transition border
border-slate-700` で `prev-btn` / `next-btn` と同一。アイコンは
TODO-080 の「決めてあること」どおり `fa-backward-fast` /
`fa-forward-fast`。

### 範囲外の変更

`git diff` の範囲はボタン追加・削除、操作ガイド文言、キー操作の
分岐のみで、TODO-080 の対象外の変更は見当たらない。
