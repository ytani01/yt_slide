# TODO-128 verifier 報告

作業場所: scratchpad の `w/`（player.html なし、`slides/readme.js` = template.js の写し、1枚目の title と h1 を `TODO128-MINE` に変更、`images/` を写す）。実害は未確認。境界線上の判断はしていない。

- pdf: 終了コード 0、「19 ページ」。pypdf で 19 ページ（template は 19 枚）。1ページ目のテキスト `' YT_ S LID E\nTODO128-MINE\nコピーして 中 身 を ...'` に `TODO128-MINE` あり。
- pdf の画像: 17 ページ目（spheres.jpg）を pdftoppm で PNG にして目で確認。球の画像が欠けずに映っている。
- check: 終了コード 0、`slides/readme.js: 問題なし`。
- check（spheres.jpg を退避）: 終了コード 1、`スライド 17: images/spheres.jpg が見つからない (404)`。退避は元に戻した。
- video --only 1: 終了コード 0（TTS 成功、`スライド 1: 10.37s`）。ffmpeg で 3 秒目のフレームを抜いて目で確認。題 `TODO128-MINE` が映っている。余計なものなし。左と上の端に暗い帯（約 24px）が見えるが、ぼかした背景の円の端に見える（テンプレートの表紙の見た目か本変更によるものかは判断しない）。
- pytest -q: 40 passed。
- ruff check src tests: All checks passed。
- テストの強さ: `_Handler.translate_path` の条件を `if False:` に書き換えて `tests/test_browser.py` を実行 → 1 failed, 4 passed。落ちたのは `test_serve_root_falls_back_to_bundled_player`（`HTTPError: HTTP Error 404: File not found`）。browser.py は元のファイルと cmp 一致で復元済み。

## 管理者が見るとよい点
- `translate_path` は作業場所に player.html があっても常に同梱のものを返す（条件は `/player.html` かどうかだけで、ファイルの有無を見ない）。docstring は「`/player.html` だけ同梱を返す」で、モジュールの docstring は「作業場所に player.html が無ければ、それだけ同梱のものを返す」。両者の食い違いの有無は未検証（作業場所に player.html を置いた場合は試していない）。指示外のため実測していない。
- 変更ファイル: TODO.md、docs/Developer.md、src/ytslide/{browser,check,pdf,video}.py、tests/test_browser.py、archives/agents/TODO-128/（未追跡）。リポジトリ内に私のファイルは残していない（この報告を除く）。指示の範囲との合否は TODO-128 節を突き合わせていないため判断しない。
