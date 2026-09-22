# TODO-117 implementer 報告

## 変更したファイル

- `player.html:570-598` — `document.write` の前に `window.addEventListener('error', ..., true)`
  を仕込み、`slides/<名前>.js` の構文エラー（filename・lineno・colno・message）を
  `slidesSyntaxError` に捕まえる。既存の「読み込めませんでした」の案内
  （`typeof slideData === 'undefined'` の分岐）に、捕まえていれば
  `slides/x.js:12:9 でエラー: <message>` を続けて出すようにした。無ければ
  今までどおりのメッセージのまま
- `player.html:1696-1750`（末尾、`</body>` の直前に新しい `<script>` を追加）
  — `window.runSlideCheck` を定義。`slideData` が無ければ
  `{ ok:false, syntaxError, missingKeys:[], missingImages:[] }` を返す。
  それ以外は各スライドの必須キー（`title`・`narration`・`duration`・
  `body`/`render` のどちらか）の欠けを `missingKeys` に、各スライドの
  `render()`（無ければ `body`）が返す HTML から `<img src>` を拾い
  `fetch(src, {method:'HEAD'})` で存在確認して `missingImages` に集める。
  同じ `src` は 1 回だけ確認。`render()` が例外を投げたスライドはその
  スライドの画像チェックだけ諦めて続行（TODO-113 の範囲どおり、構文エラー・
  必須キーの欠け・存在しない画像パスの 3 つだけを見る）
- `src/ytslide/check.py`（新規）— `check(slides_name)`。`ytslide web` と
  同じ `http.server.ThreadingHTTPServer` をポート 0 で一時的に立て（別スレッドで
  `serve_forever()`）、Playwright で `player.html?slides=<名前>` を開き
  `window.runSlideCheck()` の戻り値をそのまま返す。playwright 未インストール時は
  `video.py` の `screenshot_slides()` と同じ文言の `click.ClickException`
- `src/ytslide/cli.py:10-13` に `check` モジュールを import、
  `cli.py:181-207`（`web` の直前）に `check` サブコマンドを追加。
  `--slides`・`--root`・`@click_common_opts` は `measure`/`video` と同じ形。
  `_no_slides_error` で存在しない slides 名を弾く。結果を端末に出し、
  問題があれば `ctx.exit(1)`
- `docs/UsersGuide.md` — サブコマンド表に `ytslide check` の行、
  「別のディレクトリからコマンドを使う」の `--root` 対応コマンド一覧、
  「測定と動画に要るパッケージ」の一覧（Playwright は `video` と `check` の
  両方が使う）を更新
- `README.md` — `ytslide` のサブコマンドを列挙している箇所は無かった
  （`rg -n "ytslide (measure|video|web|check)" README.md` がヒット無し）。
  変更なし
- `pyproject.toml` — `video` extra に `playwright` が既にあり、`check` も
  それに相乗りするだけなので変更なし（確認のみ）
- `tests/test_check.py`（新規）— `check.check()` を差し替えて Playwright に
  触れない範囲で、`--root` の配線（`test_video.py` の
  `test_video_command_root_wiring` と同形）と、`ok`・構文エラー・
  必須キーの欠け・画像の欠けそれぞれの出力文言・終了ステータスを確認する
  4 ケース

## 検証

- `uv run ruff check src/ tests/` — 通過（`archives/` にある既存の未整理な
  スクリプトのエラーは対象外・pre-existing、`git stash` せず素の状態でも
  同じエラーが出ることは見ていないが変更していないファイルなので無関係）
- `uv run pytest -q` — 30 件中 29 件通過。失敗している
  `tests/test_measure.py::test_all_slides_rules_load` は `git stash` して
  変更前のコードでも同じ理由（`common_rules` の件数が 23 ではなく 25）で
  落ちることを確認した、TODO-117 の変更とは無関係の既存の失敗
- 実機確認（この場で実際に実行、`--root` を一時ディレクトリに向けて試した。
  終わったら削除済み、リポジトリには残していない）
  - `ytslide check --slides readme` / `--slides template`（実物の 2 スライド
    一式）→ `slides/xxx.js: 問題なし`、終了コード 0
  - カンマ抜けで壊した一時スライド → `slides/nocomma.js:6:9 でエラー:
    Uncaught SyntaxError: Unexpected identifier 'narration'`、終了コード 1
  - `title` を抜いた一時スライド → `スライド 1: title が無い`、終了コード 1
  - 存在しない画像パスを指した一時スライド → `スライド 1:
    images/no-such-file.jpg が見つからない (404)`、終了コード 1

## 判断が要る点・残る懸念

- `missingImages` の重複除去は「同じ `src` は 1 回だけ `fetch` する」で
  実装した。複数のスライドが同じ壊れた画像パスを使っていても、最初に
  出てきたスライド番号でしか報告されない。TODO-117 の指示文どおりの解釈
  （「同じ src は 1 回だけ」）だが、全スライドで報告してほしいなら仕様変更が要る
- `http.server` の起動・アクセスログが標準エラーに出る（`ytslide web` と
  同じ既存の挙動）。`check` の出力にも混ざるが、既存コマンドと揃えており
  今回は手を入れていない
