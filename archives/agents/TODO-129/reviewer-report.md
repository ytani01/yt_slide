# TODO-129 reviewer 報告

対象: 未コミットの `git diff`（`TODO.md`・`docs/UsersGuide.md`・`src/ytslide/browser.py`・
`src/ytslide/cli.py`・`tests/test_cli.py`）。コードは読んだだけで、テストは実行していない。

## 要修正

なし。

## 検討

### 1. `docs/Developer.md:22` / `:26` と `tests/test_cli.py:1-4` の説明が古いまま

- `docs/Developer.md:22` は `browser.py` を「`check`・`video`・`pdf` が使う chromium の起動と
  `player.html` の開き方。…作業場所を HTTP で配り、…同梱のものを返す」と書いている。
  今回 `web` も `browser.PlayerHandler` を使うようになったが、その記述が無い。
  `src/ytslide/browser.py:1-8` の docstring も同じく `check`・`video`・`pdf` だけを挙げる。
- `docs/Developer.md:26` は `tests/test_cli.py` を「`ytslide init`（`--claude` を含む）が置く
  ファイルと、二度目に上書きしないことの自動確認」としていて、追加した `web` のテストに触れていない。
  `tests/test_cli.py` の docstring（「`ytslide init` サブコマンドの確かめ。`CliRunner` で…」）も同じで、
  追加したテストは `CliRunner` ではなく `subprocess` で叩く。
- 根拠: 実際に読んだ記述。依頼の `rg -n "web|--root"` では引っかからない（`web` の語を含まない）。

### 2. テストが落ちるときの出方が分かりにくい（`tests/test_cli.py:150-158`）

- `urllib.error.HTTPError` は `OSError` の派生（`issubclass(HTTPError, OSError)` が `True`、実測）。
  そのため、修正前の挙動（`/player.html` が 404）では 404 を「まだ起動していない」とみなして
  50 回（約 5 秒）待ち直し、最後に `body` が未代入のまま `assert` に進んで `UnboundLocalError` で落ちる。
  サーバーが起動に失敗した場合（`--root` が無い等）も同じで、子プロセスの stderr は
  `finally` で読むが表示されないので原因が見えない。
- テストとしては落ちるので強さの問題ではない。落ちたときに理由が読めない、という点だけ。
  直すなら、待つループで `HTTPError` を先に捕まえて抜ける、または `body = None` で始めて
  `assert body is not None, err` の形にする、など（直し方の判断は管理者に任せる）。

### 3. `web` は起動時に `paths.PLAYER_HTML` を決め打ちする（`src/ytslide/cli.py:288`、`src/ytslide/paths.py:30-41`）

- `paths.set_root()` が起動時に一度だけ「作業場所の `player.html` か同梱か」を決めるので、
  長く動かす `web` では、起動後に作業場所へ `player.html` を置いても（`ytslide init` など）同梱のほうを
  配り続け、逆に起動後に消すと 404 になる。`check`・`video`・`pdf` は短命なので問題にならないが、
  `web` は人が開いたままにするサーバー。
- 実害は未確認（`init` で置くのは同梱と同じ内容で、`player.html` は編集しない決まりのため、
  ずれが出るのは版の違う `ytslide` を混ぜたときくらい）。境界線上なので報告だけ。

## 好みの範囲

- `tests/test_cli.py:134-138`: `socket`・`subprocess` などをテスト関数の中で import している。
  このファイルの他の import は先頭にまとめてある。

## 問題なしの観点

- 継承の分け方: `_Handler` は `PlayerHandler` の `translate_path` を継ぎ、`log_message` だけ上書き。
  `serve_root()` の `functools.partial(_Handler, directory=...)` も変わらず、check/video/pdf の挙動は不変。
  `_Handler` をテストから参照している箇所も無い（`rg` で確認）。
- `web` の既定: `paths.set_root(None)` は `pathlib.Path.cwd()` を返すので、`--root` 無しの配信元は従来と同じ。
  作業場所に `player.html` があれば `translate_path` はそのファイルを返すので、従来どおり。
- `paths.set_root(root)` の呼び方と `--root` の help 文は `measure`・`index`・`pdf`・`video`・`check` と同じ形。
- `cli.py` 先頭での `browser` の import: playwright は `chromium()` の中で遅延 import なので、
  playwright が無い環境でも `ytslide` 全体は起動できる。`cli.py` の `pathlib`・`functools`・`http.server` は他でも使っていて、残しておいてよい。
- `docs/UsersGuide.md:263,269-270`: 実装と合っている。README.md と slides/*.js に `web`・`--root` の記述は無い。
- テストの強さ（読んで判断）: 同梱へ落とさないと 1 つ目の assert に届かず落ちる、`_Handler`（ログ無し）を使うと
  最後の assert で落ちる、`--root` を無視するとリポジトリ直下を配るので `/slides/sample.js` が 404
  （`HTTPError`、ループの外なのでそのまま落ちる）。3 つの壊し方それぞれで落ちる。
- 範囲: 指示に無い変更は無い。`TODO.md` のチェックは実装済みの印として妥当。

## 作り込みすぎ

なし（`PlayerHandler` と `_Handler` の 2 段は、ログの有無を分ける最小の形）。
