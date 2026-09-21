# TODO-097 verifier report

## 検証環境

- 作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
- 対象: 未コミットの作業ツリー（`git diff --stat`）

```
$ git diff --stat
 AGENTS.md         |  6 +++---
 CLAUDE.md         |  4 ++--
 README.md         | 13 +++++++++++--
 docs/Developer.md |  9 ++++++---
 docs/User.md      | 16 ++++++++++++----
 5 files changed, 34 insertions(+), 14 deletions(-)
```

変更ファイルは依頼の 5 ファイルと一致。それ以外に変更なし
（未追跡の `archives/agents/TODO-097/` のみ）。

## 1. テストの本数と名前

```
$ uv run pytest -v
...
tests/test_cli.py::test_init_creates_files_and_index PASSED
tests/test_cli.py::test_init_second_run_does_not_overwrite PASSED
tests/test_index.py::test_parse_slide_config PASSED
tests/test_index.py::test_load_slide_and_slide_names PASSED
tests/test_index.py::test_replace_marker_block PASSED
tests/test_index.py::test_replace_marker_block_reads_old_comment_text PASSED
tests/test_index.py::test_replace_marker_block_missing_marker_raises PASSED
tests/test_index.py::test_build_index_wires_root PASSED
tests/test_measure.py (6 件) PASSED
tests/test_video.py (8 件) PASSED
============================== 24 passed in 0.71s ==============================
```

ファイルは `test_cli.py`・`test_index.py`・`test_measure.py`・`test_video.py` の 4 本、
計 24 件、全て PASSED。

- `CLAUDE.md`「テストは `tests/` の 4 本（`test_cli`・`test_index`・`test_measure`・
  `test_video`。`uv run pytest`）」→ 一致
- `docs/Developer.md`「テストは `tests/` の 4 本（`uv run pytest`）」→ 一致
- `AGENTS.md`「変更に応じて `tests/` のテストを `uv run pytest` で確認する」→
  本数を明記しない書き方で、矛盾なし

## 2. `docs/Developer.md`「リポジトリの構成」の表

対象 3 行を実ファイルと突き合わせ。

- `src/ytslide/index.py` は存在。ファイル冒頭の docstring は
  「`slides/*.js` の `slidesConfig` から `index.html` の一覧を作る」で、
  表の「`slides/*.js` から `index.html` の一覧を作る（`ytslide index`）」と一致
- `tests/test_index.py`・`tests/test_cli.py` はともに存在し、`ls tests/` の
  4 ファイルに含まれる。表に書かれた役割（`slidesConfig` の読み取りとマーカー
  間の差し替えの自動確認／`ytslide init` が置くファイルと二度目に上書きしない
  ことの自動確認）は、対応するテスト本体を実行して PASSED であることのみ確認
  （個々のアサーション内容までは読んでいない。境界線上の判断であり報告のみ）

一致。

## 3. `README.md`「インストール」のサブコマンド表

```
$ uv run ytslide --help
Commands:
  index    slides/*.js の slidesConfig から index.html の一覧を作る。
  init     カレントディレクトリを、スライド一式の置き場所として初期化する。
  measure  ナレーションの読み上げ秒数を測る。
  update   measure --all --write のあと index を実行する。
  video    スライド一式を MP4 と .srt に書き出す（playwright が要る）。
  web      カレントディレクトリを配る（http.server）。
```

README の表は `init`・`measure`・`index`・`update`・`video`・`web` の 6 行で、
`--help` の 6 コマンドと過不足なく一致（順序は異なるが内容は一致）。
各行の説明文は各サブコマンドの `--help` 冒頭の説明文（上記引用）と一致。

## 4. `--root` の有無

```
$ for c in measure index update video init web; do
    echo "=== $c ==="; ytslide $c --help | grep -i root || echo "(no --root)"
  done
=== measure ===
  --root TEXT   スライドの置き場所（既定はカレントディレクトリ）
=== index ===
  --root TEXT   スライドの置き場所（既定はカレントディレクトリ）
=== update ===
  --root TEXT   スライドの置き場所（既定はカレントディレクトリ）
=== video ===
  --root TEXT   スライドの置き場所（既定はカレントディレクトリ）
=== init ===
(no --root)
=== web ===
(no --root)
```

`docs/User.md`「`--root` があるのは `measure`・`index`・`update`・`video`。
`init` と `web` は無い」と完全に一致。

## 5. コマンド例が動くか

スクラッチパッド配下の空ディレクトリで実行（`/tmp` 直下ではない）。

```
$ ytslide init
index.html: 1 件のスライドを書いた
$ find . -maxdepth 3
./slides
./README.md
./player.html
./index.html
./slides/template.js
```

`docs/User.md`「`ytslide init` は `slides/template.js`・`player.html`・空の
`README.md`・`index.html` をカレントディレクトリに置く」と一致。

```
$ ytslide web -p <空きポート>
http://localhost:<port>/ で配信中（Ctrl-C で止める）
$ curl -s -o /dev/null -w "http_code=%{http_code}\n" http://127.0.0.1:<port>/index.html
http_code=200
```

`init` → `web` は動作した。

`ytslide update`（Online TTS 通信）について、依頼は「通らなければ `--help`
までで良い」としていたが、実際は通信自体は通った。ただし 2 段階の結果になった。

- 既定の `--slides readme` で叩くと、`init` が作るのは `slides/template.js`
  であって `slides/readme.js` ではないため、通信前に失敗する:
  ```
  $ ytslide update
  Error: .../slides/readme.js が無い
  exit=2
  ```
  これは `docs/User.md` の例（`ytslide update --slides user` のように
  `--slides` を明示する）と整合しており、依頼文にある「素の `ytslide update`
  が動くか」という想定そのものが、`init` 直後の状態には当てはまらない
  （文書はどこでも「素の `update`」を使う手順を示していないため、
  食い違いとまでは言えない。境界線上の判断で、判断は管理者に委ねる）
- `--slides template` を明示すると Online TTS まで到達し、19 枚分の
  実測秒数を出して成功した（`exit=0`）。ネットワークは通っていたので、
  「通信が要るので通らないかもしれない」という依頼文の懸念は今回は
  発生しなかった

## 6. README から `docs/User.md#リポジトリの外に自分のスライドを置く` へのリンク

```
$ grep -n "^#" docs/User.md | grep リポジトリの外
369:### リポジトリの外に自分のスライドを置く
```

見出しは実在し、GitHub 標準の見出しスラッグ規則でも見出し文と同一の
アンカー文字列になるため、リンク先は一致する。

## 見なかったもの（依頼どおり）

- 日本語の言い回し・文体
- `archives/` の中身、TODO-096 以前の記述
- `player.html`・`slides/*.js` の表示や読み上げ

## 確かめられなかったこと・判断できないこと

- `docs/Developer.md` の表にある「`slidesConfig` の読み取りとマーカー間の
  差し替えの自動確認」など、役割の文言が各テストの個々のアサーションの
  意図と細部まで一致しているかまでは踏み込んでいない（テストが PASSED する
  ことは確認済み）。境界線上の判断が要るなら報告のみ
- `ytslide update`（既定引数）が `init` 直後の状態と噛み合わない点
  （上記「5.」参照）が、文書の不備として扱うべきか、単に「`init` の直後は
  `--slides` を明示して使うもの」という前提の範囲内かは、判断できない。
  実害は未確認
