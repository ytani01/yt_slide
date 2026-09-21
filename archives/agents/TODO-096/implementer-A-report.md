# TODO-096 実装（第 1 段: パッケージ化）報告

## 変更点

- 新規: `pyproject.toml`
  - `name = "ytslide"`、`requires-python = ">=3.13"`、`dependencies = ["click", "loguru"]`
  - `[project.optional-dependencies] video = ["playwright"]`
  - `[project.scripts] ytslide = "ytslide.cli:cli"`
  - hatchling + hatch-vcs、`[tool.hatch.version] source = "vcs"`
  - `[tool.hatch.build.targets.wheel.force-include]` で `player.html`・
    `index.html`・`slides/template.js` を `ytslide/data/` に同梱
  - `[dependency-groups] dev = ["pytest", "ruff"]`
- 新規: `uv.lock`（`uv run pytest` / `uv tool install` で生成）
- 新規: `src/ytslide/__init__.py`・`__main__.py`・`click_utils.py`・
  `mylog.py`（`~/work/tmr/src/tmr/` のものをそのまま。tmr 固有の記述なし）
- 新規: `src/ytslide/paths.py` — `find_root()`/`set_root()`（後方互換の
  リポジトリへの分岐は無くし、`--root` 無指定時はカレントディレクトリのみ）、
  同梱データの場所 `DATA`
- 新規: `src/ytslide/measure.py` — `tools/measure-duration.py` の中身
  （argparse の `main()` は cli.py 側へ）。エラーは `click.ClickException`
- 新規: `src/ytslide/index.py` — `tools/make-index.py` の中身。
  `index.py:19` `BEGIN_MARKER_RE` で開始側をゆるく照合し（`.*?-->`）、
  `index.py:20` の正本コメント文
  `<!-- BEGIN GENERATED SLIDES (ytslide index が書き換える。手で編集しない) -->`
  に書き戻す。マーカー不在・`index.html` 不在は `click.ClickException`
- 新規: `src/ytslide/video.py` — `tools/make-video.py` の中身。
  `video.py:96` `screenshot_slides()` の中で `playwright` を import し、
  `ImportError` のとき `uv tool install '.[video]'` を案内する
  `click.ClickException`
- 新規: `src/ytslide/cli.py` — `click.group` + `click_common_opts` +
  `loggerInit`。サブコマンド `init`・`measure`・`index`・`update`・
  `video`・`web` を実装。`update` は `ctx.invoke(measure, ...)` →
  `ctx.invoke(index, ...)` で `measure --all --write` → `index` を再利用。
  `web` は `functools.partial(SimpleHTTPRequestHandler, directory=...)` +
  `ThreadingHTTPServer`
- 新規: `tests/test_measure.py`・`tests/test_index.py`・`tests/test_video.py`
  — `tools/test_*.py` 3 本を pytest 関数に書き直して移した（元の assert は
  すべて残した。詳細は「判断が要る点」参照）
- 削除: `git rm -r tools/`、残っていた `tools/__pycache__` と空の `tools/`
  も削除
- `.gitignore:12-14` に `/dist/` と `*.egg-info/` を追加
- `index.html:52` の生成マーカーのコメント文を新しい正本に書き換え

## 完了条件の実行結果

1. `uv run pytest -q` → `21 passed in 0.36s`
2. `uv tool install '.[video]' --force` → 成功
   （`ytslide==0.7.2.dev1+g2380db2c2.d20260921` を含む 7 パッケージを導入）。
   `ytslide --help` と 6 サブコマンドすべての `--help` が出ることを確認
3. 空の一時ディレクトリで `ytslide init` →
   `index.html: 1 件のスライドを書いた` と出て、`slides/template.js`・
   `player.html`・`index.html`・`README.md` が出来た。`index.html` の一覧に
   `template` が 1 件、`<title>` と `<h1>` がディレクトリ名
   （例 `tmp.HMmsYLUdur`）になっていた。2 度目の `ytslide init` は
   `すでにある: template.js` 等 4 行を出して上書きしなかった
4. リポジトリ直下で `ytslide index` → `index.html: 5 件のスライドを書いた`。
   `git diff index.html` はマーカーのコメント文 1 行のみの差分
   （`tools/make-index.py` → `ytslide index`）で、一覧の 5 件
   （readme・claude-memo・developer・template・user）はそのまま
5. `ytslide measure --text 'テスト'` →
   `下書き: 原文 3 字 / 読み 3 字 / 実測 0.888s / BASE_SPEED_MULTIPLIER=1.4 倍速 0.63s -> duration: 1`
6. `ytslide web -p 8099` を起動し、別シェルから
   `curl -sS -o /dev/null -w '%{http_code}' http://localhost:8099/index.html`
   → `200`。確認後 `kill` で止めた
7. `git status --porcelain` に `tools/` の残骸は無い（削除分は `D` として
   出ているだけで、ワークツリーに `tools/` ディレクトリ自体は存在しない）

`ytslide video --help` も確認（Playwright は未実行、指示どおり）。

## 判断が要る点

1. **`--only` の受け方を `nargs='+'` から `multiple=True` に変えた。**
   元は `--only 1 2` と 1 つのフラグに複数値。click は可変長の値を 1 つの
   option に取れないため、`--only 1 --only 2` の形（click の一般的な
   やり方）にした。意味（撮るスライド番号を絞る）は同じだが、コマンドラインの
   打ち方が変わる。`tests/test_video.py` で `--only` を複数回渡す形の
   plumbing だけ確認（`uv run python3` で `CliRunner` を使い、実測済み）
2. **`tests/test_video.py` に `test_video_command_root_wiring` を追加した。**
   元の `tools/test_make_video.py` にあった「`--root` の配線」の assert は
   `make-video.py` の argparse `main()` を確かめるものだったが、
   `main()` 相当は `cli.py` の `video` コマンドに移った。元の assert を
   減らさないため、`ytslide.cli.cli` を `click.testing.CliRunner` で呼ぶ
   形に書き直して `tests/test_video.py` に置いた（依頼のファイル一覧には
   無いが、新規ファイルは増やしていない）
3. **`tests/test_measure.py` の「探し方」テストを、後方互換のリポジトリへの
   分岐を無くした新しい仕様（`--root` > カレントディレクトリのみ）向けに
   書き直した。** 元のテストが確かめていた「リポジトリへ落とす」分岐は
   依頼どおり無くしたため、その assert 自体を新しい仕様の assert に置き換えた
   （テスト本数・assert の意図は維持）

## 残る懸念

- `uv run ruff check src tests` は `re.S`/`re.I`/`re.A` を `re.DOTALL` 等に
  置き換える指摘など計 10 件出る。移した `measure.py`・`index.py`・
  `video.py` の中身は元の `tools/*.py` のロジックをそのまま持ってきたもので、
  元のスタイル（`re.S` 等の別名）を保っている。依頼の対象範囲でもロジックは
  変えない指示だったため直していない。ruff を通す指示があれば別項目として
  対応可能
- `uv tool install` した `ytslide` が `~/.local/share/uv/tools/ytslide` に
  残っている（動作確認のため）。要らなければ `uv tool uninstall ytslide`
  で外せる
- コミットはしていない（管理者が行う）
