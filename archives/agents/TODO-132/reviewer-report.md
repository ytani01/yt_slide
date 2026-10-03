# TODO-132 reviewer の報告

対象: 未コミットの差分（`git diff` と新しいファイル。`vendor/` の中身は見ていない）。

## 要修正

### 1. `manifest.webmanifest:4` — `start_url: index.html` だと、ホーム画面から開いたときにオフラインで開けないことがある

- `sw.js:21-29` は、完全一致か、navigate なら `?` を無視した一致しか探さない。
  `/` と `/index.html` は別のキーなので、`/` しか開いていないと `index.html` は見つからない
- README の「動いているところを見る」（`README.md:42`）は `https://ytani01.github.io/yt_slide/`（`/` で終わる）を指す。
  このリンクから入った利用者がホーム画面に置くと、manifest の `start_url` では `/yt_slide/index.html` を開く
- **実測**（`ytslide web -p 8797`、Playwright の Chromium、SW が入ってから 3 秒待ってオフラインにした）:
  - `/` を開いたあとキャッシュにあったのは `/` だけ（vendor を除く）。そのあと `/index.html` を開くと `net::ERR_FAILED`
  - `player.html?slides=readme` だけを開いたあとも、`/index.html` は `net::ERR_FAILED`
- ホーム画面のアイコンから開く操作そのものは、実機では試していない。
  ただ `UsersGuide.md:635-636`（「ホーム画面に置いておけば電波の無いところでも再生できる」）と
  `README.md:49-50`・`Developer.md:73`（ホーム画面にも置ける）は、この経路で成り立たない

### 2. `player.html:16`（manifest の link）と `manifest.webmanifest:4` — ホーム画面に置いたページの `?slides=` が失われるおそれがある（実害は未確認。実機が要る）

- 既存の文書は「ホーム画面に追加したページ（`?slides=` を含む URL）は、ブラウザの UI 無しで開く」
  （`Developer.md:433`）としていて、iPhone で全画面にする手段として README でも案内している（`README.md:34-35`）
- 今回 `player.html` から `start_url: index.html` の manifest を読むようになった。
  Android Chrome がインストールとして扱うときは `start_url` を開くので、`player.html?slides=x` から
  置いても一覧（`index.html`）が開くはず。iOS Safari が manifest の `start_url` と今の URL の
  どちらを使うかは確かめていない
- 1 と同じ `start_url` の問題で、「どの URL を開くか」の決めごとが要る。判断は main へ

## 検討

### 3. `sw.js:13` と `src/ytslide/cli.py:296`（`web` の既定ポート 8000） — `localhost:8000` に scope `/` の SW が残り、後で同じポートを使う別のアプリの GET まで受け持つ（実害は未確認）

- `ytslide web` は作業場所をルートで配るので、SW の scope は `http://localhost:8000/` 全体になる。8000 は `python -m http.server` の既定と同じ
- 別のアプリにも `/sw.js` が無ければ、登録は消えずに残る（仕様上、更新の取得が 404 になっても登録はそのまま。ここは実測していない）。
  その間、同じオリジンの 200 の GET（API の JSON なども）をすべてキャッシュに入れ、つながらないときはそれを返す
- `docs/Developer.md:290` の「副作用のある実装」に、この SW の残り方は書かれていない

### 4. `player.html:1140-1153` — 2つ目以降の分割でオフラインの失敗が起きると、読んだ分に加えて `duration` 全体を待つ（実害は未確認）

- `onerror` が `speakChunk(i)`（i ≥ 1）で来たときも、その時点から `slide.duration / playbackRate` を丸ごと待つ。
  そのスライドの合計が `duration` より長くなる。オンラインで Online TTS へ落とす既存の経路も、全文を頭から読み直す点は同じ

### 5. テスト — SW と、オフラインの読み上げの分岐に、`tests/` のリグレッションテストが無い

- 確かめた手段は `archives/agents/TODO-132/offline_check.py`・`offline_speech_check.py` だけで、`uv run pytest` では走らない。
  `archives/` は現行仕様ではないので、壊れても誰も気付けない。
  `tests/test_browser.py` は既に Chromium を動かしているので、そこへ入れる余地はある（入れるかどうかは main の判断）
- `tests/` の追加分（`test_cli.py:38-44`・`65-66`、`test_browser.py:100-102`）は、`init`・`web`・force-include の漏れを捕まえられる。
  中身を壊して落ちるかどうかは試していない

### 6. 構成の説明が新しいファイルに追いついていない

- `CLAUDE.md:10` の「プレイヤー側（`player.html` と `slides/*.js`）」と構成の 1 段落目に、
  `vendor/`・`sw.js`・manifest・アイコンが無い。プレイヤー側に置くファイルが増えたので、ここも変える範囲に入る
- `src/ytslide/paths.py:9` のコメント「同梱データ（player.html・index.html・slides/template.js・docs/UsersGuide.md）」は、
  今回足した `OFFLINE_FILES` と `vendor/` を含んでいない

## 好みの範囲

### 7. 範囲外の古い記述（今回の差分とは関係ないので参考まで）

- `docs/Developer.md:39`「テストは `tests/` の 4本」は、今は 6本（`CLAUDE.md` は 6本）
- `docs/Developer.md:58`「TODO-088 で実測」は、docs に TODO 番号を書かない決まりに合わない。
  前からある記述で、今回の差分では docs に TODO 番号は増えていない

## 作り込みすぎ

- `sw.js:L22-29`: shrink: 2 回の `caches.match` と if が 8 行ある。
  `return (await caches.match(req)) || (req.mode === 'navigate' && await caches.match(req, { ignoreSearch: true })) || Response.error();` にすれば 1 文で済む（好みの範囲）
- `icon.svg`: delete: favicon は `icon-512.png` で間に合い、manifest も PNG 1枚で足りる。
  消せば、写すファイル・`OFFLINE_FILES`・force-include・`UsersGuide.md:611` から 1 つずつ減る（好みの範囲）
- net: -10 lines possible.

## 問題の無かった観点

- sw.js: 同じオリジンの GET だけを扱う（POST と外部オリジンは素通し）。キャッシュに入れるのは 200 だけ。`ignoreSearch` は navigate だけで、完全一致を先に引く。network-first なので、つながっていれば古いキャッシュは返らない。`skipWaiting` と `clients.claim` で、SW の更新も次に開いたときに届く
- 初回読み込みをページ側でキャッシュに入れる処理: controller が無いときだけ動き、同じオリジンに絞り、失敗は握りつぶす。`file://` では登録しない
- 読み上げ: `onerror` のオフラインの分岐は安全タイマーを消して張り直し、`runId === speechRunId` を確かめている。一時停止・スライド移動・消音の切り替えは `stopSpeech()` で `speechRunId++` とタイマーの解除を通るので、古い待ちが次のスライドを進めることは無い。オンラインのとき（`navigator.onLine !== false`）の分岐と、Online TTS へ落とす経路は前と同じ（`console.warn` が重複や古い呼び出しのぶん出なくなっただけ）
- `init`・`web`（`PlayerHandler`）・force-include: `OFFLINE_FILES` の 4つと `vendor/` 以下をすべて扱う。`relpath` は親クラスが正規化したパスから出すので `..` は通らない。`_copy_data` をバイト単位に変えても、テキストのファイルは前と同じ中身になる
- 文書（README・docs・readme.js・developer.js）: 「CDN から読む」「表示にもネット接続が要る」は残っていない。オフライン時の読み上げの説明（Developer.md・UsersGuide.md）は実装と合っている。ホーム画面の主張だけは 1・2 と食い違う
