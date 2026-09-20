# TODO-089 reviewer 報告

対象: 作業ツリーの未コミット差分（`git diff` + 新規 `tools/make-index.py`・
`tools/test_make_index.py`）。`CLAUDE.md`・`TODO.md` の TODO-089 節・
`archives/agents/TODO-089/implementer-report.md` を読んだ上でのレビュー。
コードは直していない。

## 要修正

- **`tools/make-index.py:32-33`（`SUMMARY_RE`/`ICON_RE`）**
  summary にエスケープしたアポストロフィ（`\'`）が入ると、生成 HTML に
  バックスラッシュが残る。実測（下記コマンド）で確認済み。

  ```python
  parse_slide_config("""const slidesConfig = {
      summary: 'it\\'s a test & <b>bold</b>',
      icon: 'fa-book',
  };
  """)
  # -> ("it\\'s a test & <b>bold</b>", 'fa-book')
  ```

  正規表現は `\'` を「1 つのエスケープ済み文字」として飲み込むだけで、
  `measure-duration.py` の `load_rules()` が
  `replacement.replace(r"\'", "'")` で行っているような戻し変換をしていない。
  結果、`<li>` の説明文に文字どおり `\'` が表示される。
  いまの 5 つの `slidesConfig.summary` にはアポストロフィが無いため
  顕在化していないが、今後 summary に `'` を書く（英語の contraction や
  引用符）と壊れる。`docs/User.md` にもこの制約は書かれていないため、
  利用者が気づかずに踏む恐れがある。

## 検討

- **`docs/User.md`（summary の説明）**
  `summary` が `index.html` にエスケープ無しでそのまま挿入される
  （`developer.js` のように HTML を意図的に埋め込める）仕様が明記されて
  いない。`<` や `&` を含む素のテキストを書くと、意図せず HTML として
  解釈される可能性がある。現状の 5 ファイルでは問題にならないが、実害は
  未確認。ドキュメント化するかは判断が要る。

- **`index.html` の一覧の並び順が変わる**（実装者の報告に既出）
  旧: readme, user, template, developer, claude-memo →
  新: readme, claude-memo, developer, template, user。
  「`readme` 先頭 + 残りファイル名辞書順」という決めた仕様どおりの結果だが、
  利用者が「今までと同じ並び」を期待していないか確認が要る（境界線上の
  判断は報告のみに留める）。

- **`tools/make-index.py:88-95`（`replace_marker_block`）**
  マーカーが 2 組ある場合・入れ子になっている場合の挙動を実測した。

  - 2 組ある場合: 両方とも同じ内容に置き換わる（`re.sub` が全マッチを
    処理するため）
  - 入れ子（`BEGIN … BEGIN … END … END`）の場合: 外側の `BEGIN` から
    最初の `END` までが非貪欲マッチで消え、2 個目の `END` マーカーだけが
    取り残される

  現状の `index.html` にはマーカーが 1 組しか無く、マーカー自体に
  「手で編集しない」と明記されているため、通常の運用では踏まない。
  実害は未確認。テスト（`test_make_index.py`）もこの 2 パターンは
  カバーしていない。

## 好みの範囲

- 特になし。

## 問題の無かった観点

- `SLIDES_CONFIG_RE` の `slidesConfig` 本体の切り出しは、現状の 5 ファイル
  （`rules` 配列の閉じが `],` で `slidesConfig` の閉じが `};`）では
  誤爆しない。`slides/user.js` の `ICON_GROUPS`（`icon` という語を含まない
  文字列配列）や `slideData` 内の `icon:`（スライドごとのアイコン）も、
  `slidesConfig` の外にあるため拾われないことを実測で確認した。
- マーカー間の差し替えは冪等（`make-index.py` を実行後、`git diff` は
  マーカー追加と並び順以外に差が無く、再実行しても差分が出ない）ことを
  実測で確認した。
- `tools/test_make_index.py` は「壊すと落ちるテスト」になっている
  （実装者の報告どおり `slide_names()` の `insert(0, ...)` を
  `append(...)` に変えると落ちることを実測で確認済み。今回のレビューでは
  再実行して `OK` になることのみ確認）。テスト実行で作業ツリーに余計な
  差分が残らないことも確認した（`_hidden.js` は finally で削除される）。
- `docs/User.md`・`README.md`・`CLAUDE.md`・`slides/user.js` の記述は、
  実際の `tools/make-index.py` の挙動と一致している。同じ主張が
  複数箇所にある「持っていくとき `.js` を消してから再実行する」件も、
  `docs/User.md` の 2 箇所（手順とファイル構成の節）で表現は違うが内容は
  食い違っていない。
- `tools/measure-duration.py` との書き方の揃い（`ROOT`/`SLIDES` の置き方、
  docstring の書式、argparse の説明文の体裁、正規表現で JS を読む方針）は
  一致している。
- オプションを増やしていない（`--help` のみ）、`measure-duration.py` に
  混ぜず新規スクリプトにしている、といった決めたことは守られている。
  ponytail の観点で過剰な抽象化・オプションは見当たらない。
