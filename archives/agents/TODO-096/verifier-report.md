# TODO-096 確認報告

対象: `brief-verifier.md` の確認項目 1〜10。すべて実際に実行した。
`reviewer-report.md` も読んだ。指摘 1・2（`ytslide` の読みが無い、
`slides/template.js:485` の旧ツール名）は `implementer-C-report.md` の
記述どおり、既に対応済みであることを実測で確認した（下記 8・詳細1参照）。

## 1. `uv run pytest -q`

```
$ uv run pytest -q
........................                                                 [100%]
24 passed in 1.87s
```

通った。

## 2. `uv run ruff check src tests`

```
$ uv run ruff check src tests
All checks passed!
```

通った。

## 3. テストが壊すと落ちるか

### 3a. `tests/test_cli.py`（init）

`src/ytslide/cli.py` の `_skip_if_exists()` を `if path.exists():` →
`if False:` に書き換えて実行:

```
FAILED tests/test_cli.py::test_init_second_run_does_not_overwrite - AssertionError:
E           AssertionError: index.html: 1 件のスライドを書いた
E           assert 'すでにある: template.js' in 'index.html: 1 件のスライドを書いた\n'
1 failed, 1 passed in 0.80s
```

狙ったテストが狙ったとおりに落ちた。`\cp` でバックアップしていた
`cli.py` に戻し、`diff` が空（差分なし）であることを確認。戻したあと
`uv run pytest -q tests/test_cli.py` は 2 passed。

### 3b. `tests/test_index.py`（マーカー差し替え）

`src/ytslide/index.py` の `replace_marker_block()` から `re.DOTALL` を
外して実行:

```
FAILED tests/test_index.py::test_replace_marker_block - click.exceptions.ClickException: ... マーカーが見つからない
FAILED tests/test_index.py::test_replace_marker_block_reads_old_comment_text - 同上
2 failed, 4 passed in 0.22s
```

狙った 2 件が狙ったとおりに落ちた。バックアップに戻し、`diff` が空である
ことを確認。戻したあと `uv run pytest -q` は 24 passed。

**`git diff src/` について**: `src/` はリポジトリに未追跡（`git status`
で `?? src/`）のため `git diff src/` はそもそも何も出さない
（追跡対象外は diff の対象にならない）。代わりに、壊す前に取った
バックアップコピーと `diff` で比較し、両ファイルとも元の内容と
バイト単位で一致することを確認した（上記のとおり `diff` の出力は空）。

## 4. `uv tool install '.[video]' --force` と `--help`

```
$ uv tool install '.[video]' --force
...
Installed 1 executable: ytslide
```

通った。トップレベルと 6 サブコマンドすべての `--help` を実行し、全部
`exit:0` で該当するオプション説明が出た（`init`・`measure`・`index`・
`update`・`video`・`web`）。出力は割愛（食い違い無し）。

## 5. `README.md`・`docs/User.md` のコマンド例

実行して確かめたもの（すべて一致、または既に測定済みの実測値と一致）:

- `ytslide measure --text 'ここに読み上げる文章'` →
  `下書き: 原文 10 字 / 読み 10 字 / 実測 2.376s / BASE_SPEED_MULTIPLIER=1.4 倍速 1.70s -> duration: 2`
  （docs/User.md の例と完全一致。実測秒数まで一致）
- `ytslide measure --slides user --all --write`（分離した一時ディレクトリで
  実行。実リポジトリの `slides/user.js` は書き換えていない）→
  17 枚とも `duration` は既存の値のままで「user.js: 変更なし」。
  すでに測り直し済みの値のため差分は出ないだけで、出力形式は
  ドキュメントの例（「変わったスライドだけ出力される」）と矛盾しない
- `mkdir ~/my-slides && cd ~/my-slides && ytslide init` →
  `index.html: 1 件のスライドを書いた`（一致）
- `ytslide web -p 8000`（実際は空きポート 8091 で確認）→
  `http://localhost:8091/ で配信中（Ctrl-C で止める）`（一致）
- `ytslide index --root <path>` → `index.html: 1 件のスライドを書いた`（一致）
- `ytslide measure --slides mine --all`（`template.js` を `mine.js` に
  コピーして再現）→ 各スライドの測定結果が出力される（一致）

**試していない**（依頼どおり）:

- `uv tool install 'git+https://github.com/ytani01/yt_slide'` 系（ネット・
  実際の GitHub 取得が要る）
- `ytslide video --slides readme` の本実行（ffmpeg・chromium での実描画・
  実時間がかかる。`--help` のみ確認済み、上記 4 参照）
- `sudo apt install curl ffmpeg` / `playwright install chromium`
  （環境変更コマンドのため実行していない）

食い違いは見つからなかった。

## 6. 空の一時ディレクトリで `ytslide init`

```
$ ytslide init
index.html: 1 件のスライドを書いた
```

- `slides/template.js`・`player.html`・`index.html`・`README.md` が出来た
- `index.html` の `<title>item6 - スライド一覧</title>`・
  `<h1 ...>item6</h1>`（ディレクトリ名 `item6` になっている）
- `grep -c "slides=template" index.html` → `1`
- 2 回目の `ytslide init` 実行後、4 ファイルの `md5sum` は 1 回目と完全一致
  （`diff` で確認、差分なし）。2 回目の出力は
  `すでにある: template.js` / `player.html` / `README.md` / `index.html`
  のあと `index.html: 1 件のスライドを書いた`
  （`index` は毎回走るが、内容が変わらないため md5 は同じ）

食い違いなし。

## 7. リポジトリ直下で `ytslide index`

実行前後で `index.html` の `md5sum` が完全一致、`git diff --stat index.html`
も実行前後で同一（1 行差分のまま増減なし）。この 1 行差分は
`tools/make-index.py が書き換える` → `ytslide index が書き換える` という
コメント文言の変更で、TODO-096 の実装差分そのもの（今回の実行で新たに
発生したものではない）。

食い違いなし。

## 8. `ytslide.measure.prepare()` の読み替え

`slides/developer.js` 2 枚目、`slides/user.js` 12 枚目の narration を
`uv run python3` から `measure.prepare()` に通した:

```
DEV: リポジトリの中身は プレイヤー ドット エイチティーエムエル が本体、
     スライズ の下にスライドデータがあります。デュレーション を測ったり
     動画に書き出したりするコマンドは、ワイティー スライド という CLI を
     インストールして使います。…
USER: デュレーション には、読み上げ音声を測った秒数を入れます。
      ワイティー スライド measure に文章を渡すと、そのまま使える秒数が出ます。
```

両方とも `ytslide` → `ワイティー スライド` に置き換わっていることを確認
（`'ytslide' in result` は両方 `False`、`'ワイティー スライド' in result`
は両方 `True`）。

`grep -rn "メジャー デュレーション\|measure-duration" player.html slides/*.js
src/ytslide` はヒット無し。`measure-duration` という読みは残っていない
（reviewer 指摘 1 で「死んだルールが残っている」とされていたが、
`player.html:803` を確認したところ、現在は
`[/ytslide/gi, 'ワイティー スライド'],` に置き換わっており、
死んだ `measure-duration.py` のルール自体も見当たらなかった。
`implementer-C-report.md` に記載は無いが、対応済みと思われる。
**誰がいつ直したかは追っていない**）。

## 9. Playwright での `player.html`・`index.html` の確認

`uv run --extra video python3` から `playwright.sync_api` の chromium で
`file://` を開いて確認。

- `player.html?slides=developer`: コンソールエラー無し。`#slide-canvas`
  に「DEVELOPER GUIDE / player.html を直す人へ / …」のテキストが入って
  おり、スクリーンショットも見出し・本文・チャプター一覧が正常に描画
  されている（真っ暗・欠けは無し）
- 同スライドの 2 枚目（`#2`）も確認: コンソールエラー無し、`#slide-canvas`
  に表（`ytslide measure`・`ytslide video` を含む）のテキストが入っている
- `index.html`: コンソールに 1 件エラーが出た。
  `Fetch API cannot load file:///.../README.md. URL scheme "file" is not
  supported.` — `README.md` を `fetch()` で読もうとして `file://` では
  失敗している。ただし一覧自体（`yt_slide` の見出しと 5 件のスライドの
  カード）はスクリーンショットで正常に描画されており、真っ暗・欠けでは
  ない。**このエラーが既存の仕様どおりか（`docs/User.md` に file:// で
  README を読めない旨の記載は見当たらない）は判断できない。TODO-096 の
  差分で生じたものか、以前からの挙動かは未確認**

スクリーンショット:
`player_developer.png`・`player_developer_slide2.png`・`index.png`
（作業用ディレクトリに保存。報告書には含めていない）

## 10. TODO-096 のチェック項目 4 つ

- `src/ytslide/` に click のサブコマンドとして作り直す →
  `src/ytslide/cli.py` に `@click.group()` と 6 サブコマンドを確認。満たす
- `tools/*.py` と `tools/test_*.py` を移して `tools/` を消す →
  `ls tools/` は `No such file or directory`。`git status` で 6 ファイルが
  `D`（削除）。満たす
- `uv tool install .` で `ytslide` が入るようにする →
  上記 4 で実行済み・成功。満たす
- `tools/` を指す記述を書き換える →
  `grep -rn "tools/" --include="*.md" --include="*.js" --include="*.html" .
  | grep -v archives/` の結果は `TODO.md` のみ（項目自身の記述として残る
  のが自然）。それ以外は書き換わっている。満たす

## 変更されたファイルの一覧と指示の範囲

`git status --short`（作業開始時・終了時で同一）:

```
 M .gitignore / AGENTS.md / CLAUDE.md / README.md / TODO.md
 M docs/Developer.md / docs/User.md / index.html / player.html
 M slides/claude-memo.js / slides/developer.js / slides/readme.js
 M slides/template.js / slides/user.js
 D tools/*.py (6 本)
?? archives/agents/TODO-096/ / pyproject.toml / src/ / tests/ / uv.lock
```

TODO-096 の「巻き込む範囲」（`AGENTS.md`・`CLAUDE.md`・`README.md`・
`docs/User.md`・`docs/Developer.md`・`index.html`・`player.html`・
`slides/*.js` の 5 本、`tools/` の削除、`src/`・`tests/`・`pyproject.toml`・
`uv.lock` の新規追加）と一致している。指示に無いファイルの変更は
見当たらなかった。

**私が壊して戻した `src/ytslide/cli.py`・`src/ytslide/index.py` は、
確認のたびにバックアップとの `diff` で元通りであることを確認済み。**

## 確かめられなかったこと・判断できなかったこと

- `index.html` を `file://` で開いたときの `README.md` fetch エラーが、
  TODO-096 の差分で新たに生じたものか、TODO-093（README を index.html に
  載せる）の時点から既にあった挙動かは切り分けていない。実害
  （見た目が崩れるか）は無いように見えたが、**境界線上の判断はしていない**
- `ytslide video` の本実行（ffmpeg・chromium を使った実際の MP4 書き出し）
  は試していない（依頼どおり）
- `git+https://...` からの `uv tool install` はネットワークが要るため
  試していない（依頼どおり）
- reviewer 指摘 1・2 を「誰が・いつ直したか」は `archives/agents/TODO-096/`
  の報告ファイル群からは特定できなかった。修正後の状態が正しいことは
  実測で確認したが、経緯の追跡はしていない
