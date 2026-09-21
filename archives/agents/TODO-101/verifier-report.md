# TODO-101 verifier 報告

対象: README.md 40〜75 行目の `uv tool install` 手順。GitHub main への
push 後、README どおりに `ytslide` が入るかを実測。

隔離: `UV_TOOL_DIR` / `UV_TOOL_BIN_DIR` を一時ディレクトリ
（`scratchpad/uvtool/{tools,bin}`）に向けて実行。終了後に丸ごと
`\rm -rf` で削除済み。既存の `~/.local/share/uv/tools/ytslide` と
`~/.local/bin/ytslide` は変更前後で確認し、無傷（`ytslide` エントリは
今回作った一時ディレクトリの外に一切生成していない）。

## 結論（最重要）: README どおりのコマンドは失敗する

README 42 行目に書かれているとおりの文字列で実行すると **失敗する**。

```
$ uv tool install 'git+https://github.com/ytani01/yt_slide'
error: /home/ytani/.cache/uv/git-v0/checkouts/98cef985739f7065/c498d9e does not appear to be a Python project, as neither `pyproject.toml` nor `setup.py` are present in the directory
```
終了コード: 2（`--refresh` を付けても再現。キャッシュのせいではない）

### 原因の実測（確認できた事実。推定ではない）

`git+https://github.com/ytani01/yt_slide`（ref 指定なし）は、GitHub の
**リポジトリの既定ブランチ（HEAD）を取りに行く**。ところがこのリポジトリの
既定ブランチは `main` ではなく **`develop`** になっている。

```
$ git ls-remote https://github.com/ytani01/yt_slide HEAD main
c498d9ef1bea3f6093d7b2a06963d699d468d4aa	HEAD
79b239b105dda7ef5f1372a5ab30ac842c910955	refs/heads/main

$ git remote show origin   （フレッシュに clone した先で）
  HEAD branch: develop
```

`develop` の先頭コミット `c498d9e`（TODO-095 時点）には `pyproject.toml` が
無い。`main` の先頭コミット `79b239b`（TODO-100 まで反映済み）には
`pyproject.toml` がある。

```
$ git show origin/develop:pyproject.toml
fatal: path 'pyproject.toml' exists on disk, but not in 'origin/develop'

$ git show origin/main:pyproject.toml | head -3
[project]
name = "ytslide"
dynamic = ["version"]
```

README のコマンドには `@main` のようなブランチ指定が無いため、
**`pyproject.toml` を含む変更を main に push しても、README のコマンドは
`develop` を取りに行ったまま失敗し続ける。**

### `@main` を明示すると通ることの確認（参考。README には無い書き方）

```
$ uv tool install --refresh 'git+https://github.com/ytani01/yt_slide@main'
Resolved 3 packages in 33ms
   Building ytslide @ git+https://github.com/ytani01/yt_slide@79b239b...
Installed 1 executable: ytslide
（終了コード 0）

$ ytslide --version
ytslide 0.7.2.dev14+g79b239b10
```

これは「main を直接指定すれば動く」ことの確認であり、**README の手順を
代替するものではない**。README どおりの文字列を試すのが依頼の主旨だった
ため、上記の「結論」を優先して報告する。

## 項目 2: サブコマンド 6 つ（`@main` を明示して入れたもので確認）

`ytslide --help` の一覧、6 つとも exit 0。

```
Commands:
  index    slides/*.js の slidesConfig から index.html の一覧を作る。
  init     カレントディレクトリを、スライド一式の置き場所として初期化する。
  measure  ナレーションの読み上げ秒数を測る。
  update   measure --all --write のあと index を実行する。
  video    スライド一式を MP4 と .srt に書き出す（playwright が要る）。
  web      カレントディレクトリを配る（http.server）。
```

`ytslide init/index/measure/update/web/video --help` はすべて exit 0。
README 表（48〜53 行目）の 6 つと一致。

## 項目 3: `[video]` extra

README どおりの文字列 `'git+https://github.com/ytani01/yt_slide[video]'`
（ref 指定なし）は、項目 1 と同じ理由（`develop` に `pyproject.toml` が
無い）で失敗する。

```
$ uv tool install --refresh 'git+https://github.com/ytani01/yt_slide[video]'
error: ...c498d9e does not appear to be a Python project...
```

`main` を明示（`git+https://github.com/ytani01/yt_slide@main[video]`）す
ると成功し、`playwright`・`greenlet`・`pyee`・`typing-extensions` が
追加で入ることを確認（`uv tool install '...@main'`（video 無し）との
差分）。`playwright install chromium` は依頼どおり実行していない。

なお `git+https://github.com/ytani01/yt_slide[video]@main`
（extras を @ref より前に書く形）は uv がリポジトリ URL の一部として
`[video]` を解釈してしまい `Repository not found` で失敗した
（`@main[video]` の順なら成功）。README にはどちらの extras 付き ref 指定も
書かれていないため、この並び順の違いは参考情報として書くのみで、
README の記述とは直接比較していない。

## 項目 4: README 42〜43 行目とコマンドの一致

README に書かれている 2 行

```
uv tool install 'git+https://github.com/ytani01/yt_slide'          # video 以外
uv tool install 'git+https://github.com/ytani01/yt_slide[video]'   # video も使う
```

は、実行した文字列と一字一句一致している（コピペで使った）。
**一致はしているが、その文字列自体が現状のリポジトリ設定
（既定ブランチ＝develop）の下では失敗する**、というのが今回の核心。

## 変更ファイル

このリポジトリのファイルは一切変更していない（`git status` で
`nothing to commit, working tree clean` を確認済み）。今回の報告ファイル
`archives/agents/TODO-101/verifier-report.md` の追加のみ。

## 判断が要る点（verifier からは決めない）

- 直し方の選択肢はいくつか考えられる（GitHub 側の既定ブランチを `main` に
  変える／README のコマンドに `@main` を明示する／`develop` に
  `pyproject.toml` を合わせる、など）。**どれを取るかは判断が要るので
  ここでは決めない。**
- `main` と `develop` の間で他にも差分（TODO-096〜TODO-100 の内容）が
  あるはずだが、その差分の全体像までは調べていない（依頼の範囲外と
  判断した）。
- extras の並び順（`[video]@main` vs `@main[video]`）の違いは pip/uv の
  一般的な仕様によるものと見えるが、断定はしない（未検証の一般論）。

---

## 追記: 既定ブランチを main に直した後の再確認

管理者が GitHub の既定ブランチを `develop` から `main` へ変更し、
`develop` を `main`（79b239b）へ fast-forward して push した後に、
README どおりの文字列（ref 指定なし）で再実測した。

```
$ git ls-remote https://github.com/ytani01/yt_slide HEAD main develop
79b239b105dda7ef5f1372a5ab30ac842c910955	HEAD
79b239b105dda7ef5f1372a5ab30ac842c910955	refs/heads/develop
79b239b105dda7ef5f1372a5ab30ac842c910955	refs/heads/main
```
HEAD・main・develop がすべて同一コミットになっていることを確認。

### 項目 1: README どおりの `uv tool install 'git+https://github.com/ytani01/yt_slide'`

```
$ uv tool install --refresh 'git+https://github.com/ytani01/yt_slide'
Resolved 3 packages in 20ms
Installed 3 packages in 0.84ms
 + click==8.5.0
 + loguru==0.7.3
 + ytslide==0.7.2.dev14+g79b239b10 (from git+https://github.com/ytani01/yt_slide@79b239b105dda7ef5f1372a5ab30ac842c910955)
Installed 1 executable: ytslide
```
終了コード 0。**前回の失敗は解消し、README どおりの文字列で成功する。**

### 項目 2: `ytslide --version` とサブコマンド 6 つの `--help`

```
$ ytslide --version
ytslide 0.7.2.dev14+g79b239b10
```

`ytslide --help` の一覧は前回と同じ 6 つ（init/index/measure/update/
web/video）。`init/index/measure/update/web/video --help` は全て
exit 0（前回すでに `@main` 明示で確認済みの結果と同じ）。

### 項目 3: README どおりの `uv tool install 'git+https://github.com/ytani01/yt_slide[video]'`

```
$ uv tool install --refresh 'git+https://github.com/ytani01/yt_slide[video]'
Resolved 7 packages in 44ms
Installed 4 packages in 3ms
 + greenlet==3.5.6
 + playwright==1.63.0
 + pyee==13.0.1
 + typing-extensions==4.16.0
Installed 1 executable: ytslide
```
終了コード 0。`[video]` extra の依存（playwright・greenlet・pyee・
typing-extensions）が入ることを確認（前回 `@main[video]` で確認した
依存の組と同じ）。`playwright install chromium` は今回も実行していない。

### 隔離・後始末

`UV_TOOL_DIR`/`UV_TOOL_BIN_DIR` を新しい一時ディレクトリ
（`scratchpad/uvtool2/{tools,bin}`）に向けて実行し、確認後に
`\rm -rf` で削除した。実行前後で実際の
`~/.local/share/uv/tools/`・`~/.local/bin/ytslide` に変化が無いことを
確認した。

### 結論

README 40〜75 行目のインストール手順は、**書かれている文字列のまま**で
1〜3 すべて成功する。前回報告した「既定ブランチが develop になっている
ため失敗する」問題は解消済み。
