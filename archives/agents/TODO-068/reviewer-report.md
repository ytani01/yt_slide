# TODO-068 reviewer 報告

対象: `git diff` / `git status`（作業ディレクトリ:
`/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`）。
`implementer-brief.md` / `implementer-report.md` と突き合わせて確認した。
コードは直していない。

## 要修正

- **`README.md:3` と `slides/readme.js`（title / narration 2 箇所 / 見出し 2 箇所）
  の「ファイル 3 つ」が、実装後の実際の配布数（2 つ）と食い違っている。**
  `README.md:3`「**ファイル 3 つを置くだけで、ナレーション付きのプレゼンが動く。**」、
  `slides/readme.js:5` の title「ファイル 3 つで動く…」、`:23` と `:260` の
  narration、`:31` と `:270` の見出しの「3 つ」が、いずれも旧構成
  （`player.html` / `slides/_rules.js` / `slides/<名前>.js`）の数のまま残っている。
  `docs/User.md:185` の「他のサーバーへ持っていくとき」は今回 3→2 に直されており
  （`git diff`で確認）、同じ性質の記述が README とスライド本体（readme デッキの
  冒頭・まとめの両方）に残っている。根拠: `implementer-brief.md:6-8`
  「配布ファイルが `player.html` + `slides/<名前>.js` の 2 つに減るのは結果」、
  および `reviewer-brief.md:38-41`「文書とスライドの記述が実装と合っているか…
  もう成り立たない説明が残っていないか」。
  `implementer-brief.md` の「4. `_rules.js` への言及を直す」の列挙にこの 2 ファイルは
  無く、grep 対象も `_rules` という文字列なので拾われない（実際
  `grep -rn '_rules' … | grep -v archives` では検出できないことを実行して確認した）。
  実害（読み上げ・表示上の誤り）は未確認だが、README の 1 行目と紹介スライドの
  冒頭・まとめという最も目立つ箇所が対象。

## 検討

（該当なし）

## 一致・問題なし（1 行）

- `player.html` の `SPEECH_RULES` は `slides/_rules.js`（`git show HEAD:slides/_rules.js`）
  と 23 ルール・並び順とも完全一致（diff で 1 字の差も無いことを確認）。
- `SPEECH_RULES` は `prepareSpeechText()` と同じ `<script>`（472 行目開始）の中、
  直前に定義されており読み込み順の問題は無い。
- `load_common_rules()` の `const SPEECH_RULES = \[(.*?)\n\s*\];` は、実際に
  `player.html` に対して実行し 23 ルールが正しく切り出せることを確認した
  （広く当たりすぎ・取りこぼしとも無し）。見つからない場合に `SystemExit` で
  止まることも、テキストを差し替えて実行し確認した。
- `docs/Developer.md` の「`_rules.js` はスライド一式より先に読む必要がある」の
  記述は削除済みで、読み込み順の制約に関する矛盾は残っていない。
- `docs/User.md` の「他のサーバーへ持っていくとき」（3→2）、「この 2 種類の `.js`」
  （→「この `.js`」）は実装と一致。
- `README.md` / `docs/Developer.md` のファイル構成表から `slides/_rules.js` の行が
  削除されている。
- `slides/{readme,user,developer,claude-memo}.js` のコメント「共通は
  `slides/_rules.js`」は各 1 行とも「共通は `player.html`」に直っている。
- `slides/developer.js` の narration・帯の本文は、依頼書（`implementer-brief.md:41-47`）
  の文面と 1 字違わず一致。下の 2 枚のカードと注釈は diff 上変更無し。
- `grep -rn '_rules' --include='*.md' --include='*.js' --include='*.py' --include='*.html' . | grep -v '^./archives/' | grep -v __pycache__`
  を実行し、残るのは `TODO.md`（対象外指定どおり）と関数名 `load_slides_rules` /
  `load_common_rules` / `slides_rules_from_text`（ファイル名ではなく識別子）のみ。
  `slides/_rules.js` への言及は無い。
- `slides/_rules.js` は `git rm` されている（`git status` の `D  slides/_rules.js`）。
- `tools/test_measure_duration.py` を実行し `OK`（exit 0）。`load_common_rules()` を
  直接呼んで 23 ルール・内容とも実測で確認（テストの `assert len == 23` だけに
  頼っていない）。
- diff に含まれるファイルは `implementer-brief.md` が列挙した対象と一致し、
  範囲外のファイルへの変更は無い（`git status --porcelain` で確認）。

## 判断が要る点

- README.md / slides/readme.js の「ファイル 3 つ」の扱いは、TODO-068 の
  実装依頼書の対象外だった箇所であり、直すかどうか・別項目にするかは
  管理者の判断が要る。
