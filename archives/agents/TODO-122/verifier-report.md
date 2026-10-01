# TODO-122 verifier 報告

作業ディレクトリ: /tmp/claude-649/-home-ytani-work-yt-slide/c6bf6b69-f796-4c8d-9cb5-b1d43a003f4f/scratchpad/verify。リポジトリのファイルは変えていない。食い違い・失敗は無し。

## 通ったもの
1. wheel: `uv build --wheel` 成功。`unzip -l` に `43272 ytslide/data/docs/UsersGuide.md` あり。
2. `uvx --from <wheel>`（video extra 無し、空ディレクトリ）:
   - `ytslide init` → `docs/UsersGuide.md`・`index.html`・`player.html`・`slides/template.js` ができ、`CLAUDE.md` は無い。
   - `init --claude` → `CLAUDE.md` ができ、`CLAUDE_MD`（`from ytslide.cli import CLAUDE_MD` を書き出したもの）と `diff` 一致（SAME）。
   - 2 回目: `CLAUDE.md`・`docs/UsersGuide.md`・`player.html` を書き換えてから `init --claude` → 「すでにある: …」と出て、3 つとも書き換えた内容のまま（上書きされない）。終了コード 0。
   - `ytslide check --slides template` → rc=1。出力:
     ```
     Error: playwright が入っていない。
     入れ方:
       uv tool install 'git+https://github.com/ytani01/yt_slide[video]'
       （リポジトリのチェックアウトからなら uv tool install '.[video]'）
       /home/ytani/.cache/uv/archive-v0/l5DfZPWeGJ9oPUIG/bin/python -m playwright install chromium
     ```
3. chromium 無し（`PLAYWRIGHT_BROWSERS_PATH=<scratch>/nobrowsers uv run ytslide check --slides users-guide`）→ rc=1。出力:
   ```
   Error: chromium を起動できない: BrowserType.launch: Executable doesn't exist at /tmp/.../verify/nobrowsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
   入れ方:
     uv tool install 'git+https://github.com/ytani01/yt_slide[video]'
     （リポジトリのチェックアウトからなら uv tool install '.[video]'）
     /home/ytani/work/yt_slide/.venv/bin/python -m playwright install chromium
   ```
   1 行目のみ（`.splitlines()[0]`）で、呼び出しログは出ていない。
4. `uv tool dir` = `/home/ytani/.local/share/uv/tools`。`"$(uv tool dir)/ytslide/bin/python" -m playwright install --dry-run chromium` は rc=0、「Chrome for Testing 153.0.8010.12 (playwright chromium v1243)」ほかを表示（ダウンロード無し）。
5. `uv run ytslide check --slides users-guide` → 「slides/users-guide.js: 問題なし」rc=0。`uv run pytest -q` → 35 passed。
6. テストの強さ（コピーで 1 つずつ壊した。元のコピーは 35 passed。コピーでは `uv run` がビルドで失敗したため、`PYTHONPATH=<copy>/src` でリポジトリの .venv の python から pytest を実行した）:
   - `.splitlines()[0]` を外す → 落ちた（`tests/test_browser.py::test_no_chromium_shows_install_hint`）
   - `browser.close()` を `pass` に置換 → 落ちた（`test_browser_closed_on_exit`: `assert [] == [True]`）。注: 行ごと消す形は構文エラーで収集段階の 4 errors になり、狙った検証にならないため `pass` で行った。
   - `if claude:` → `if True:` → 落ちた（`test_init_creates_files_and_index`）
   - `docs/UsersGuide.md` のコピー行を消す → 3 件落ちた（`test_init_creates_files_and_index`・`test_init_claude_writes_claude_md`・`test_init_second_run_does_not_overwrite`）
   - pyproject の force-include 行を消す → 落ちた（`test_init_data_is_packaged`）
7. リンク: `### Claude Code で作る`（UsersGuide.md:145）、`### 測定と動画に要るパッケージ`（UsersGuide.md:294）あり。README.md:104・136 と UsersGuide.md 内のリンクはすべてこの 2 見出し宛て。`](../` と `](Developer.md` は UsersGuide.md に残っていない（rg 該当なし）。

## 8. スライド 6（1280×720、`player.html?slides=users-guide#6`）
- スクリーンショット: `~/tmp/playwright-mcp/todo122-verify-slide6.png`。画像を見て、題名「Claude Code で作る」と 4 つの箱（`ytslide init --claude`、CLAUDE.md の説明、構成案→check の流れ、読み上げ・update の注意）が欠けずに映っている。
- 本文領域 `#slide-canvas`: scrollHeight 428 / clientHeight 428 で溢れなし。
- 参考（判断は管理者へ。実害は未確認）: ページ全体の scrollHeight 755 / innerHeight 720（35px 縦スクロールが出る。画面下の操作部が一部切れて見える）。`.video-viewport` が 610/514、チャプター一覧の `overflow-y-auto` の枠が 820/517（一覧はスクロール想定）。いずれもスライド本文の溢れではない。この 755 が変更前からか、今回の変更で出たかは測っていない。

## 確かめられなかったこと
- 上記 8 のページ全体の縦スクロールが TODO-122 以前からのものか（変更前の比較をしていない）。
