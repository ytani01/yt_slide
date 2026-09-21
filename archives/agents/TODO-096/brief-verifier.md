# TODO-096 確認

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
（ブランチ `cmd`、未コミット）。項目の全文は `TODO.md` の TODO-096。

## 目的

`tools/*.py` 3 本を `ytslide` という 1 つの CLI にまとめた変更が、
TODO-096 に書いたとおりに動くかを確かめる。

## 読むもの

- `TODO.md` の TODO-096（何を作ると決めたか。チェック項目 4 つ）
- `archives/agents/TODO-096/reviewer-report.md`（レビューの指摘）

実装の報告（`implementer-*-report.md`）は**読まなくてよい**。
「動いたと書いてある」ことを確かめるのではなく、自分で叩いて確かめる。

## 確かめること

**すべて実際に実行し、コマンドと出力を報告に貼る。** 静的な読み合わせで
済ませない。

1. `uv run pytest -q` が全部通る
2. `uv run ruff check src tests` が通る
3. **テストが壊すと落ちるか。** `tests/test_cli.py` の `init` のテストと
   `tests/test_index.py` のマーカー差し替えのテストについて、実装側
   （`src/ytslide/`）を 1 行わざと壊して `pytest` が落ちることを見てから戻す。
   戻したあと `git diff src/` が空であることを確かめる
4. `uv tool install '.[video]' --force` が通り、`ytslide --help` と
   6 つのサブコマンド（`init`・`measure`・`index`・`update`・`video`・`web`）の
   `--help` が出る
5. **`README.md` と `docs/User.md` に書いてあるコマンド例を、書いてあるとおりに
   叩いて再現する。** 動かないもの、出力が説明と食い違うものを挙げる。
   ネットワークや ffmpeg・chromium が要るもの（`ytslide video` の本実行、
   `uv tool install 'git+https://github.com/…'`）は `--help` の確認と
   「試していない」の報告でよい
6. 空の一時ディレクトリで `ytslide init` → `slides/template.js`・`player.html`・
   `index.html`・`README.md` が出来る。`index.html` の `<title>` と `<h1>` が
   そのディレクトリ名になり、一覧に `template` が 1 件入る。
   2 回目の `ytslide init` で既存ファイルの中身が変わらない
   （前後の `md5sum` を比べる）
7. リポジトリ直下で `ytslide index` を実行しても `index.html` が変わらない
   （`git diff index.html` が空のまま）
8. **`ytslide` の読みが読み上げに乗っているか。** `uv run python3` から
   `ytslide.measure.prepare()` を呼び、`slides/developer.js` の 2 枚目と
   `slides/user.js` の 12 枚目のナレーションが「ワイティー スライド」に
   置き換わることを確かめる。`measure-duration` という読みがどこにも
   残っていないことも確かめる
9. **`player.html` がブラウザで壊れていないか。** `player.html` は
   読み上げ置換表を書き換えたので、JS が壊れていると全部動かなくなる。
   Playwright（chromium、`uv run python3` から使える）で
   `player.html?slides=developer` と `index.html` を `file://` で開き、
   (a) コンソールにエラーが出ないこと、(b) スライドの中身が描かれていること
   （`#slide-canvas` の中にテキストがある、スクリーンショットが真っ暗でない）
   を確かめる。**見た目の良し悪しは評価しなくてよい**が、
   「何も映っていない」「欠けている」は見る
10. `TODO-096` のチェック項目 4 つが実際に満たされているか

## してはいけないこと

- **直さない。** 見つけたことは報告するだけ（3 の「わざと壊して戻す」は例外）
- **原因の切り分けや、境界線上の判断もしない。**
  迷ったら「実害は未確認」と添えて報告する
- レイアウトの測り直しは要らない
- `slides/*.js` の `duration` の値が妥当かは見なくてよい（測り直し済み）

## 報告

`archives/agents/TODO-096/verifier-report.md` に書く。
**一致したものは 1 行、食い違いだけ詳しく。** 各項目にコマンドと出力を残す。
**返事は 5 行以内**（終わったか・報告ファイルのパス・食い違いの有無）。
