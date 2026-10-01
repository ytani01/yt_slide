# TODO-128 reviewer 報告

対象: `git diff`（未コミット。`src/ytslide/{browser,check,pdf,video}.py`・
`tests/test_browser.py`・`docs/Developer.md`・`TODO.md`）。
テストの実行と実測はしていない（依頼どおり。verifier の担当）。

## 要修正

なし。

## 検討

### 1. `src/ytslide/cli.py:283-289` — `ytslide web` は同じ穴が残る（範囲外、報告のみ）

`web` は `SimpleHTTPRequestHandler` でカレントを配るだけなので、作業場所に
`player.html` が無いと `/player.html` は 404 のまま。今回 `browser._Handler`
ができたので、`web` もそれを使えば揃う。ただし TODO-128 の対象は
`video`・`pdf`・`check` の 3 つで、`web` は `--root` を取らず `paths.ROOT` も
使わない（`pathlib.Path.cwd()` を直接配る）ので、寄せるなら別項目で
判断が要る。`ytslide init` した作業場所では起きないので、実害は未確認。

## 好みの範囲

### 1. `src/ytslide/browser.py:61-62` — ログを `--debug` 時だけ出す手もある

`log_message` を空にしたことで、`check`・`video`・`pdf` 実行中のアクセス行
（`"GET /slides/x.js HTTP/1.0" 404 -` など）が stderr に出なくなった。
失うものは小さい:

- 画像の 404 は `runSlideCheck` が `fetch(src, {method: 'HEAD'})` で拾って
  `missingImages` に載せる（`player.html:1876`）
- `slides/<名前>.js` が無い場合は `cli.py` の `pdf`・`video`・`check` が
  開く前に `src.exists()` で止める（`cli.py:223`・`243`・`261`）
- 以前のログは `check` でだけ出ていた（`video`・`pdf` は `file://` だった）

残るのは「作業場所の外の資源（`player.html` が相対で読む別ファイルなど）が
404 になったとき原因が見えない」程度。今の `player.html` が相対で読むのは
`slides/${slidesName}.js` だけ（`href="index.html"` はリンクで読み込まない）
なので、現状は失うものが無い。`--debug` で `_log.debug` に流すかは好み。

## 観点ごと（問題なし）

- `/player.html?query`: `urlsplit(path).path` で比較しており、クエリ付きでも
  一致する。`tests/test_browser.py` の 1 本目が `?slides=sample` 付きで取るので、
  生の `path` と比べる書き方に戻すと落ちる。
- パスの判定: 置き換えるのは `/player.html` ちょうどだけ。`//player.html`・
  `/%70layer.html` などは親の `translate_path` へ行き作業場所側を探すが、
  chromium が実際に送るのは `/player.html` だけなので実害なし。
- `paths.PLAYER_HTML` が作業場所にあるとき: `set_root()` が
  `ROOT/player.html` を入れるので、置き換え先も親が返すパスと同じファイル。
  挙動は以前の `check` と同じ。2 本目のテストが押さえている。
- `PLAYER_HTML` はリクエストのたびにモジュール変数から読むので、`set_root()`
  の後に `serve_root()` を呼べば正しい値になる（`open_player` の docstring の
  前提どおり）。
- 後始末の順序: `with serve_root() as base, chromium() as b:` は chromium を
  先に閉じ、その後にサーバーを止める。`chromium()` の入口で
  `ClickException`（Playwright／chromium 無し）が出ても `serve_root` の
  `finally` で `shutdown()`・`join()` が走る。`yield page` 中の例外も両方の
  出口を通る。
- pdf の pypdf チェック: `make_pdf` の先頭（`open_player` より前）のまま。
- `file://` から HTTP への変更で分岐が変わる箇所: `player.html` に
  `location.protocol` で分ける処理は無い。`localStorage` は `new_page()` が
  毎回新しいコンテキストを作るので、オリジンが変わっても空から始まる点は以前と同じ。
- docs と docstring: `docs/Developer.md` の 2 行、`browser.py` のモジュール
  docstring、`check.py` の docstring（`ytslide web` への言及を外した）、
  `pdf.py` の「`video.py` と同じ開き方」は、いずれも実装と合っている。
  `docs/` に TODO 番号は入っていない。`file://` で開くと書いた箇所は
  `src/`・`docs/` に残っていない。
- 範囲: 指示に無い変更は無い。`video.py` は `make_video` で `paths` を使うので
  import は残っていて正しい。
- 書式: 新しい行は最長 95 桁で、既存（最長 102 桁）の範囲内。
- テスト: `serve_root()` の 2 分岐（作業場所に無い／ある）を Playwright 無しで
  押さえていて、置き換えを外すと 1 本目、常に同梱を返すと 2 本目が落ちる
  （読んで確かめた。実行はしていない）。`open_player` 自体は verifier の実測で見る。
- コメント: 「なぜ」が要るのは同梱へ落とす理由で、docstring とテストの
  コメントに TODO-128 の番号付きで書いてある。

## 作り込みすぎ

- `src/ytslide/browser.py:76`: shrink: `httpd.shutdown()` は `serve_forever`
  のループが抜けるまで待つので、続く `thread.join()` はほぼ何もしない。
  消してもよいが、元の `check.py` から移しただけで害も無い（好みの範囲）。

それ以外は `serve_root` と `open_player` の 2 段も、テストから Playwright 無しで
`serve_root` を叩くのに使っているので不要な層ではない。net: -1 lines possible.
