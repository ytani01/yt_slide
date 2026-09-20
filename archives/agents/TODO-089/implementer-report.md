# TODO-089 implementer 報告

## 変更したファイル

- `slides/readme.js:4-6` `slides/user.js:4-6` `slides/template.js:8-10`
  `slides/developer.js:5-8` `slides/claude-memo.js:4-7` —
  `slidesConfig` に `summary`・`icon` を追加。値は元の `index.html` の
  `<li>` から移した（`developer.js` の `summary` は
  `<span class="font-mono">player.html</span> の作り` と HTML を含んだまま）
- `index.html:23-53` — 手書きの `<li>` 5 個をやめ、`<ul>` の中に
  `<!-- BEGIN GENERATED SLIDES … -->` 〜 `<!-- END GENERATED SLIDES -->`
  のマーカーを入れ、`tools/make-index.py` の実行結果に置き換えた
- `tools/make-index.py`（新規）— `slides/*.js`（`_` 始まりを除く）の
  `slidesConfig` を正規表現で読み、`index.html` のマーカー間を差し替える。
  `--help` あり、オプションは増やしていない。`summary`・`icon` が無い分は
  標準エラーに警告を出し、`summary` は空文字、`icon` は `fa-file` で埋める
- `tools/test_make_index.py`（新規）— `parse_slide_config()`（summary/icon
  抽出、HTML を含む summary、無い場合の None）、`slide_names()`（readme 先頭
  + 残り辞書順、`_` 始まり除外）、`replace_marker_block()`（差し替えと、
  マーカーが無いときに `SystemExit` で止まること）を確認
- `slides/user.js:143-159`（Slide 5・手順3）— タイトルとナレーション、
  本文を「`slidesConfig` に `summary`/`icon` を書いて
  `tools/make-index.py` を走らせる」に変更。`duration` は
  `tools/measure-duration.py --slides user 5 --write` で測り直し、
  変化なし（11 のまま）
- `docs/User.md:44-46, 60-96, 316-328` — 手順 3 を
  「`tools/make-index.py` を走らせる」に変更、`slidesConfig` の説明に
  `summary`/`icon` の段落を追加、「他のサーバーへ持っていくとき」の
  `<li>` 手作業の記述を「不要な `.js` を消してから `make-index.py` を
  走らせ直す」に書き換えた
- `README.md:31-33, 91-92, 95-96` — 冒頭の案内とファイル構成表を
  `tools/make-index.py` に合わせて更新。`tools/test_make_index.py` の
  行も追加
- `CLAUDE.md:7-11` — `index.html` が `tools/make-index.py` の生成物である旨と、
  テストが 3 本になったことを反映

## 決めたこと（判断が要った点）

- 並び順は決まっていた「`readme` 先頭 + 残り辞書順」を厳密に適用した。
  結果、生成後の `index.html` の並びは今までと変わる
  （旧: readme, user, template, developer, claude-memo →
  新: readme, claude-memo, developer, template, user）。
  各 `<li>` の中身・リンク先はすべて一致する。完了条件の
  「見た目・リンク先で一致」は各項目の形について確認し、順序は仕様どおり
  変えている
- `summary`/`icon` が無いスライドの扱いは「標準エラーに警告 + 既定値で埋めて
  生成は続ける」とした（黙って落とさない、を満たす最小の実装）
- 一覧から外したいスライドは、ファイル名の頭に `_` を付ける運用とし、
  その旨を `docs/User.md` に追記した（指示の「`_` で始まるファイルは除く」を
  ユーザー向けにも文書化した）

## 検証

- `python3 tools/make-index.py --help` — 使い方が出ることを確認
- `python3 tools/make-index.py` — 実行後の `index.html` を
  `git diff index.html` で確認。差分はマーカー追加と並び順のみで、
  各 `<li>` の内容（クラス・アイコン・リンク先・説明文）は一致
- 仮のスライド `slides/zzz-test.js`（`summary`/`icon` あり）を置いて
  再実行 → 一覧に 6 件目として追加されることを確認。
  `slides/zzz-nowarn.js`（`summary`/`icon` 無し）でも警告を出しつつ生成が
  止まらないことを確認。両ファイルは確認後に削除し、再実行して
  `index.html` が元の 5 件に戻ることを確認
- `python3 tools/test_make_index.py` → OK
- `python3 tools/test_measure_duration.py` → OK（既存、壊していない）
- `python3 tools/test_make_video.py` → OK（既存、壊していない）
- テストが「壊すと落ちるか」の確認: `slide_names()` の
  `names.insert(0, 'readme')` を `names.append('readme')` に一時的に
  書き換えて `test_make_index.py` を実行し、
  `AssertionError: names[0] == 'readme'` で落ちることを確認してから戻した
- `curl --max-time 5` で Google Translate TTS への疎通を確認できたため、
  `tools/measure-duration.py --slides user 5 --write` を実行できた
  （ネットワークは使えた）

## 残る懸念

- `index.html` の一覧の表示順が変わる（上記）。見た目は仕様どおりだが、
  利用者が「今までと同じ並び」を期待していないか確認してほしい
- `docs/User.md` の `slidesConfig` の説明に `summary`/`icon` の段落を
  新設した。TODO-089 の指示にはこの箇所の明記は無かったが、新しいキーの
  書き方が分からないと手順が成立しないため追加した。範囲を広げすぎと
  判断されれば削ってよい

## レビュー後の修正

reviewer 報告（`archives/agents/TODO-089/reviewer-report.md`）の「要修正」1
件と「検討」1 件目を直した。

1. **`tools/make-index.py`（`parse_slide_config`）** — `summary`/`icon` の
   `\'` を `'` に戻す処理を追加（`measure-duration.py` の
   `load_rules()` と同じ `str.replace(r"\'", "'")`）。
   `tools/test_make_index.py` に `it\'s a test` → `it's a test` を確かめる
   assert を追加。戻す処理だけを外した状態でこのテストを実行すると
   `AssertionError` で落ちることを確認してから直した
2. **`docs/User.md`（`slidesConfig` の summary/icon の段落）** — `summary`
   が `index.html` にエスケープ無しでそのまま挿入されること（HTML を
   埋め込める代わりに `<`・`&` を含む素のテキストはそのまま解釈される
   こと）を 1 文追記した

直さなかったもの（コーディネーターの指示どおり触っていない）:

- マーカーが 2 組・入れ子のときの挙動（テストも追加していない）
- `index.html` の一覧の並び順

## レビュー後の検証

- `python3 tools/make-index.py` を再実行し、`git diff index.html` が
  修正前と同じ（マーカー追加と並び順のみの差分）であることを確認。
  2 回連続で実行しても差分が増えないこと（冪等）も確認
- `python3 tools/test_make_index.py` → OK
- `python3 tools/test_measure_duration.py` → OK
- `python3 tools/test_make_video.py` → OK
- コミットはしていない
