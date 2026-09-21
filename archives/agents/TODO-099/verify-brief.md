# TODO-099 の検証

対象: TODO-099 に沿って改稿した `README.md`、`docs/User.md`、`slides/user.js`。
**書いてあるとおりのコマンドと URL を実際に実行し、そのとおりになるかを測る。**
静的な読み合わせでは終わらせない。

## 環境（これを使う）

- リポジトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
- **`ytslide` は `<repo>/.venv/bin/ytslide` を使う。**
  `~/.local/bin/ytslide` は `0.7.2.dev6+gbfd7755f9` で TODO-098 より古いので使わない。
  `PATH` の先頭に `<repo>/.venv/bin` を置く
- **`curl` はラッパーを `PATH` の先頭に置く。** 素の `curl` は時間の上限が無く、
  止まると固まる。次の内容で作って `chmod +x` する:
  ```sh
  #!/bin/sh
  exec /usr/bin/curl --max-time 30 --connect-timeout 10 "$@"
  ```
- ブラウザ: `<repo>/.venv/bin/python` の Playwright（chromium 導入済み）
- `ffprobe`・`ffmpeg` は `/usr/bin` にある
- 作業用のディレクトリは `/tmp` に作る。リポジトリにファイルを増やさない

## 実行しないこと（名指しで外す）

- **`uv tool install` によるインストールの再現はしない。**
  `README.md` のインストール元は `main` を指しているが、`origin/main` は現在
  c498d9e で `pyproject.toml` が無く、書いたとおりに実行しても CLI は入らない。
  **これは利用者が承知のうえで決めた記述で、指摘の対象ではない。**
  上記の `.venv` の `ytslide` を使って以降を検証する
- デザインの良し悪し、配色、言い回しの評価。**ただし「映っているものが
  正しいか」は見る**（欠け・はみ出し・重なり・空白・文字化け）
- `ytslide video` による MP4 の書き出し（別項目で確認済み）
- `archives/` 以下の点検

## 測ること

### 1. 最初の 1 枚に到達できるか

`/tmp` に空のディレクトリを作り、`docs/User.md` の「### 1」「### 2」の
**操作だけ**で進む。

- `ytslide init` が置いたファイルを列挙する（`docs/User.md:26` の記述と一致するか）
- エディターの代わりにヒアドキュメントで `slides/sample.js` を作る。
  貼り付ける内容は `docs/User.md` の「## 最小の例」から**そのまま**取る
- Playwright で `file:///…/player.html?slides=sample` を開き、
  **本文とナレーションが読めること**を確認する。測定は先に行わない
- 再生ボタンを押し、`<audio>` の `currentTime` が進むことを確認して**値を記録**する
- `sample.js` の本文とナレーションを書き換え、reload 後に**表示が変わること**を確認する
- `?slides=` を省いたときのエラー表示が `docs/User.md:33-34` の文言と一致するか

### 2. 一覧（`ytslide index`）

- `index` の前後で `index.html` に `sample` のリンクが出るか。リンクから開けるか
- `docs/User.md` の `slidesConfig` の例（`summary`・`icon` 付き）に直して
  再実行し、説明とアイコンが反映されるか
- `summary`・`icon` を省いた別の最小例を置いて `index` し、
  **警告が出たうえで一覧に載るか**。説明が空欄、アイコンが `fa-file` になるか

### 3. 任意の測定（`ytslide update --slides sample`）

- `duration` が書き戻され、続けて一覧が生成されるか。**変わった値を記録**する

### 4. HTTP と公開用のファイル

- `ytslide web -p <空きポート>` を起動し、`docs/User.md:113-117` の URL
  （`http://localhost:<port>/player.html?slides=sample` と `http://localhost:<port>/`）で
  開けるか。**ブラウザが自動で開かないこと**も確認する
- 停止は起動した PID にシグナルを送る（`pkill` はパターンで自分を巻き込むので使わない）
- `docs/User.md` の「### 他のサーバーへ持っていくとき」に挙がっているファイルだけを
  `/tmp` の別ディレクトリへコピーし、そこでも再生と一覧が動くか
- 別端末からの LAN 接続は実測できなければ**未確認と明記する**。
  同一端末での HTTP 確認を別端末の実測として扱わない

### 5. `slides/user.js` の画面（改稿した枚）

リポジトリの `player.html?slides=user` を Playwright で開く。
**ビューポートは 1280×720 と 390×844 の 2 つ**で、それぞれ全 16 枚を巡る。

- 欠け・はみ出し・重なり・空白・文字化けが無いか。
  **スクリーンショットを実際に画像として見て判断する**（数値だけで判断しない）
- 改稿した 3・4・5・11・12 枚目のスクリーンショットを
  `/tmp/todo-099-verify/` に `<枚番号>-<幅>.png` の名前で保存する
- **3・4・5 枚目の本文の計算後 `font-size` を両ビューポートで実測**し、
  `clamp(0.9rem, 1.9cqw, 1.4rem)` を下回っていないか比べる。
  `getComputedStyle` の値を **px で報告に載せる**
- 3 枚目のコマンド行（`uv tool install 'git+…'` の長い行）が
  枠からはみ出していないか
- 11 枚目の `ytslide measure --slides sample --text '文章'` が
  枠からはみ出していないか
- 読み上げを再生し、字幕とナレーションが対応するか。
  **3 枚目の `duration` は 15 に測り直してある**。表示される秒数と一致するか

### 6. 3 ファイルの手順が同じ結果になるか

`README.md` の「## 自分のスライドを作る」の手順だけでも、
1 と同じ状態（`?slides=sample` で 1 枚が表示される）に到達できるか。
`docs/User.md` と違う結果になる箇所があれば挙げる。

## 制約

- **ファイルを直さない。** 見つけたことは報告するだけ。
  原因の切り分けや、境界線上の判断もしない。迷うものは「実害は未確認」と
  添えて報告する。直すかどうかは main が判断する
- リポジトリのファイルを書き換えない。書いてよいのは
  `archives/agents/TODO-099/verify-report.md` と `/tmp` 以下だけ
- 検証に使ったスクリプトは `archives/agents/TODO-099/` に残す（1 本にまとめる）

## 報告

`archives/agents/TODO-099/verify-report.md` に書く。
**実行したコマンド・URL・測定値をそのまま載せる。**
一致したものは 1 行でまとめ、食い違いだけ詳しく書く。
測っていないものは「未確認」と明記する。

返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
