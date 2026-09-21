# TODO-096 実装（第 1 段: パッケージ化）

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
（ブランチ `cmd`）。項目の全文は `TODO.md` の TODO-096。

## 目的

`tools/measure-duration.py`・`tools/make-index.py`・`tools/make-video.py` を、
`uv tool install` で入る 1 つの CLI `ytslide` にまとめる。

## 対象範囲（この依頼で触るもの）

- 新規: `pyproject.toml`、`src/ytslide/*.py`、`tests/test_*.py`
- 削除: `tools/`（`git rm -r tools/`）
- `.gitignore` に `/dist/` と `*.egg-info/` を足す
- `index.html` の生成マーカーのコメント文（下記）

**文書（`README.md`・`CLAUDE.md`・`AGENTS.md`・`docs/*.md`）と
`slides/*.js` は、この依頼では触らない。** 別の依頼で直す。

## 作るもの

```
pyproject.toml
src/ytslide/__init__.py      # __version__（importlib.metadata）
src/ytslide/__main__.py      # from .cli import cli
src/ytslide/cli.py           # click の group とサブコマンド
src/ytslide/click_utils.py   # ~/work/tmr/src/tmr/click_utils.py をそのまま
src/ytslide/mylog.py         # ~/work/tmr/src/tmr/mylog.py をそのまま
src/ytslide/paths.py         # 置き場所の解決と同梱データの場所
src/ytslide/measure.py       # tools/measure-duration.py の中身
src/ytslide/index.py         # tools/make-index.py の中身
src/ytslide/video.py         # tools/make-video.py の中身
tests/test_measure.py
tests/test_index.py
tests/test_video.py
```

`__init__.py`・`__main__.py`・`click_utils.py`・`mylog.py` は
`~/work/tmr/src/tmr/` のものを写す（`tmr` 固有の記述だけ直す）。
`cli.py` の書き方（`click.group` + `click_common_opts(__version__)` +
`loggerInit(debug)`）も `~/work/tmr/src/tmr/cli.py` に倣う。

### pyproject.toml

`~/work/tmr/pyproject.toml` に倣う。違うところだけ:

- `name = "ytslide"`、`requires-python = ">=3.13"`
- `dependencies = ["click", "loguru"]`
- `[project.scripts] ytslide = "ytslide.cli:cli"`
- `[project.optional-dependencies] video = ["playwright"]`
  （`video` サブコマンドだけが使う。既定の install を軽くするため外に出す）
- `[dependency-groups] dev = ["pytest", "ruff"]`
- hatchling + hatch-vcs、`[tool.hatch.version] source = "vcs"`
- 同梱データ:

```toml
[tool.hatch.build.targets.wheel.force-include]
"player.html" = "ytslide/data/player.html"
"index.html" = "ytslide/data/index.html"
"slides/template.js" = "ytslide/data/slides/template.js"
```

`uv.lock` は生成してコミット対象に含める。

### paths.py

今の `measure-duration.py` の `REPO_ROOT` / `find_root()` / `set_root()` を
ここへ移す。**リポジトリへ落とす後方互換の分岐は無くす**（install した
`ytslide` にはリポジトリが無い）。

- `find_root(root_arg)`: `--root` があればそこ、無ければカレントディレクトリ
- `set_root(root_arg)`: モジュール変数 `ROOT` / `SLIDES` / `PLAYER_HTML` /
  `INDEX_HTML` を決める。`PLAYER_HTML` は `ROOT/player.html` があればそれ、
  無ければ同梱データの `player.html`
- 同梱データの場所:

```python
DATA = pathlib.Path(__file__).resolve().parent / "data"
if not DATA.is_dir():
    # リポジトリのチェックアウトから動かしたとき（uv run / 開発中）
    DATA = pathlib.Path(__file__).resolve().parents[2]
```

他のモジュールからは `from . import paths` として `paths.SLIDES` の形で読む
（`from .paths import SLIDES` にすると `set_root()` の結果が届かない）。

### cli.py のサブコマンド

既存のオプションは**名前と意味をそのまま**移す。`--root` は
`init` と `web` 以外の全部に付ける。

| サブコマンド | 引数・オプション |
|---|---|
| `init` | オプション無し（カレントディレクトリを初期化） |
| `measure` | 位置引数のスライド番号（複数）、`--text`、`--all`、`--write`、`--slides`、`-n/--repeat`、`--root` |
| `index` | `--root` |
| `update` | `--slides`、`-n/--repeat`、`--root` |
| `video` | `--slides`、`--out`、`--only`、`--root` |
| `web` | `-p/--port`（既定 8000） |

- `measure`: 位置引数（スライド番号）と `--slides`（スライド一式の名前）は
  今と同じ綴りのまま両立させる。click では
  `@click.argument("numbers", nargs=-1, type=int)` と
  `@click.option("--slides", "slides_name", ...)` で衝突しない。
  argparse の `parser.error()` は `click.UsageError` / `click.BadParameter`
  に置き換える
- `update`: `measure --all --write` 相当を走らせてから `index` 相当を走らせる
- `web`: 標準ライブラリの `http.server`。`ThreadingHTTPServer` +
  `functools.partial(SimpleHTTPRequestHandler, directory=...)` でカレント
  ディレクトリを配る。開始時に URL を 1 行出す。Ctrl-C で止める
- `init`: 次をこの順で行う。**既にあるファイルは上書きしない**
  （「すでにある: <名前>」と出して飛ばす）
  1. `slides/` を作る
  2. 同梱データの `slides/template.js` を `slides/` に置く
  3. 同梱データの `player.html` を置く
  4. 空の `README.md` を作る
  5. 同梱データの `index.html` を置く。そのとき `yt_slide` という文字列を
     カレントディレクトリ名に差し替える（`<title>` と `<h1>` の 2 か所）
  6. `index` 相当を走らせて一覧を作り直す

### index.py

- マーカーは、**開始側を正規表現でゆるく照合する**
  （`<!-- BEGIN GENERATED SLIDES` で始まり `-->` で終わる 1 つのコメント）。
  古いコメント文のまま持っている `index.html` でも通るようにする
- 書き戻すときの正本のコメント文は
  `<!-- BEGIN GENERATED SLIDES (ytslide index が書き換える。手で編集しない) -->`
- リポジトリ直下の `index.html` の同じコメントも、この文に書き換える
  （`tools/make-index.py` を指したままにしない）

### video.py

`playwright` の import は `screenshot_slides()` の中で行い、
`ImportError` のときは「`uv tool install '.[video]'` で入れる」と分かる
メッセージで止める（`click.ClickException`）。

### tests/

`tools/test_*.py` 3 本を `tests/` へ移し、pytest の関数に書き直す。
`importlib.util.spec_from_file_location` でファイル名をたどる細工は消し、
`from ytslide import index, measure, video` と普通に import する。
**今ある assert を減らさない**（1 つも落とさずに移す）。ネットワークが
要るものは今も無いはずなので、増やさない。

## 完了条件

1. `uv run pytest` が全部通る
2. `uv tool install '.[video]' --force` が通り、`ytslide --help` と
   各サブコマンドの `--help` が出る
3. 空のディレクトリで `ytslide init` を実行すると、`slides/template.js`・
   `player.html`・`index.html`・`README.md` が出来て、`index.html` の一覧に
   `template` が 1 件入り、`<title>` と `<h1>` がそのディレクトリ名になる。
   2 度目の `ytslide init` は上書きせず「すでにある」と出す
4. リポジトリ直下で `ytslide index` を実行しても、`index.html` の一覧が
   今と同じ 5 件（`readme`・`claude-memo`・`developer`・`template`・`user`）の
   ままで、マーカーのコメント文だけが新しくなる（`git diff` で確かめる）
5. `ytslide measure --text 'テスト'` が秒数を出す（ネットワークが要る）
6. `ytslide web -p 8099` を起動し、別のシェルから
   `curl -sS -o /dev/null -w '%{http_code}' http://localhost:8099/index.html`
   が 200 を返す。確かめたら止める
7. `tools/` が消えていて、`git status` に残骸が無い

## 検証方法

上の 1〜7 を実際に実行し、**コマンドと出力を報告に貼る**。
静的な読み合わせで済ませない。`ytslide video` は実行しなくてよい
（ffmpeg と chromium が要るため）。ただし `ytslide video --help` は確かめる。

## 報告

`archives/agents/TODO-096/implementer-A-report.md` に書く。
変更点、完了条件 1〜7 の実行結果（コマンドと出力）、残る懸念の 3 つに絞る。
**返事は 5 行以内**（終わったか・報告ファイルのパス・判断が要る点）。
コミットはしない（管理者が行う）。
