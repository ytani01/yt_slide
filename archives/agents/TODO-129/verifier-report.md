# verifier 報告 TODO-129

## 結果
- 1. `uv run pytest -q`: 41 passed, 終了コード 0。
- 2. 実機（`--root <一時ディレクトリ>`、別ディレクトリから起動、ポート 18731）
  - (a) `/player.html?slides=sample` はリポジトリの `player.html` と cmp 一致（100797 バイト）
  - (b) `/slides/sample.js` は置いたものと cmp 一致
  - (c) stderr に `127.0.0.1 - - [...] "GET /slides/sample.js HTTP/1.1" 200 -` 等のログ行が出た
  - (d) 起動したまま `player.html` を置くと次の `/player.html` が置いたものに変わった（cmp 一致）
  - `--root` 無し（一時ディレクトリで起動、ポート 18732）でも (a) 一致
  - サーバーは PID を確かめて kill 済み（残りなし）
- 3. check: 一時ディレクトリ（player.html 無し、`slides/template.js` はコピー）で
  `ytslide check --root <そこ> --slides template` は終了コード 1。出力全文:
  `スライド 17: images/spheres.jpg が見つからない (404)` /
  `スライド 18: images/nebula.jpg が見つからない (404)`
  （stdout）。stderr は空。stdout に `GET ` のログは混ざらない（0 件）。
  失敗の理由は、依頼どおり `slides/template.js` だけをコピーし `images/` を
  置かなかったため、と推定（推定。実害は未確認）。chromium は起動して
  `player.html`（同梱）まで読めている。
- 4. 壊し方
  - (i) `translate_path` の同梱への分岐を削除: 2 failed（`test_cli.py::test_web_serves_bundled_player_with_log`、`test_browser.py::test_serve_root_falls_back_to_bundled_player`、いずれも 404）
  - (ii) `PlayerHandler` に空の `log_message`: 1 failed（`test_web_serves_bundled_player_with_log`、ログの assert）
  - (iii) `web` の `set_root(root)` を `set_root(None)`: 1 failed（`test_web_serves_bundled_player_with_log`、`/slides/sample.js` が 404）
  - 各回のあと手で戻し、保存した元ファイルと cmp 一致を確認。`git status` は開始時と同じ。

## 食い違い・注意
- 4(iii) で最初に `sed` で `set_root(root)` を全置換して 5 か所（check/video/pdf も）を壊したが、
  テストは走らせず、直後に元へ戻した（cmp 一致）。結果には使っていない。
- 4(iii) で落ちたのは 1 件のみ。`test_web_serves_bundled_player_with_log` 以外は `--root` を見ていない（実害は未確認）。
- 判断が要る点: なし。
