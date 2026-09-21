# TODO-099 検証報告

対象: `README.md`・`docs/User.md`・`slides/user.js`。すべて実際に
コマンドを実行し、Playwright でブラウザを開いて測った。静的な読み合わせでは終えていない。

環境: `<repo>/.venv/bin` を `PATH` の先頭に置き、`.venv/bin/ytslide`
（`0.7.2.dev6+gbfd7755f9.d20260921`）を使用。作業ファイルはすべて `/tmp/todo-099-verify/` 以下。
検証スクリプトは `archives/agents/TODO-099/verify-script.py` にまとめた。

## 1. 最初の 1 枚に到達できるか

- `ytslide init` → `index.html` に「index.html: 1 件のスライドを書いた」と出力、
  終了コード 0。置かれたファイルは `player.html`・`index.html`・`slides/template.js` の 3 つ。
  `docs/User.md:26-27` の記述と**一致**。
- `docs/User.md` の「## 最小の例」をそのままヒアドキュメントで `slides/sample.js` に保存し、
  `file:///…/player.html?slides=sample` を開いた。body のテキストに
  `はじめに` と `本文はここに書く` が出ており、**本文とナレーションを読める状態**だった。
- 再生ボタン（`#play-btn`）を押すと `#audio-status-badge` が
  `朗読中 (Online Voice)` → `朗読完了` と推移した。
  **DOM には `<audio>` 要素が無い**（`new Audio()` で JS 側にだけ生成され、
  DOM ツリーに追加されない実装だった。`document.querySelectorAll('audio')` は常に 0 件）。
  依頼書は `<audio>` の `currentTime` を見る指示だったが、これは実測できない。
  代わりに `#audio-status-badge` の推移で音声が進行し完了することを確認した
  （記録した値は下記「5. slides/user.js」の t=15.7s 完了の実測を参照。
  この 1 枚だけの再生でも同様に数秒で `朗読中`→`朗読完了` に変わった）。
- `sample.js` の `title`・`narration`・`body` を書き換えて保存し、再度開くと
  `はじめに（改）`・`本文を書き換えました` に**表示が変わった**。
- `?slides=` を省いて開くと
  `スライドのデータ slides/readme.js を読み込めませんでした。` と表示された。
  `docs/User.md:54` の文言と**一致**。

## 2. 一覧（`ytslide index`）

- `index` 前は `index.html` に `sample` へのリンクは**無い**。`ytslide index` 実行後、
  `<a href="player.html?slides=sample">` が生成され、アイコンは `fa-file`、
  説明欄は空（`summary`・`icon` 未指定のため）。
  実行時に `警告: sample: slidesConfig.summary が無い` `警告: sample: slidesConfig.icon が無い`
  が出力された。`docs/User.md:89-91` の記述と**一致**。
- Playwright で `index.html` の `sample` リンクをクリックすると
  `player.html?slides=sample#1` へ遷移し、`title` が `サンプル` になった。リンクは開けた。
- `docs/User.md` の `slidesConfig` の例（`summary: '自分で作った最初のスライド'`,
  `icon: 'fa-file-lines'`）に書き換えて再実行すると、警告は出ず、
  アイコンは `fa-file-lines`、説明欄に `自分で作った最初のスライド` が反映された。**一致**。

## 3. `ytslide update --slides sample`

```
スライド 1: 原文 16 字 / 読み 16 字 / 実測 3.000s / BASE_SPEED_MULTIPLIER=1.4 倍速 2.14s -> duration: 2
スライド 1: duration 5 -> 2
sample.js: 1 枚を書き換えた
index.html: 2 件のスライドを書いた
```

`sample.js` の `duration` は `5` → `2` に書き戻され、続けて `index.html` も再生成された。終了コード 0。

## 4. HTTP と公開用のファイル

- `ytslide web -p 38011` をバックグラウンド起動し、ログは
  `http://localhost:38011/ で配信中（Ctrl-C で止める）` のみ。
  `ps aux` にブラウザプロセスの新規起動は無く、**ブラウザは自動で開かなかった**。
- `http://localhost:38011/player.html?slides=sample` と `http://localhost:38011/` を
  Playwright で開き、どちらも `file://` と同じ内容が表示された
  （前者はスライド本文、後者は `sample` へのリンクを含む一覧）。`docs/User.md:113-117` と**一致**。
- 起動したプロセスの PID (`2670538`) に `kill` を送って停止できた
  （`pkill` は使わず、`$!` で取った PID を直接指定）。
- `docs/User.md` の「### 他のサーバーへ持っていくとき」の指示どおり、
  まず `slides/template.js` を削除してから `ytslide index` を実行し直し（一覧を
  持っていくときの前提として文書内に明記されている手順）、その後
  `player.html`・`index.html`・`slides/sample.js` の 3 つだけを別ディレクトリへコピーした。
  `file://` で開くと、再生（`?slides=sample`）・一覧（`sample` のみ表示）とも動いた。
- **別端末からの LAN 接続は未確認。** 実機が 1 台しか無く測定手段が無かったため、
  同一端末での HTTP 確認をもって代用していない。

## 5. `slides/user.js` の画面（改稿した枚）

`player.html?slides=user` を Playwright で開いた。全 16 枚
（`// Slide 1` 〜 `// Slide 16` を確認）を 1280×720 と 390×844 の両方で巡回し、
改稿した 3・4・5・11・12 枚目を `/tmp/todo-099-verify/<枚番号>-<幅>.png` に保存した
（`archives/agents/TODO-099/` には残していない。ファイルサイズの都合で `/tmp` のみ）。

- **画像を実際に見た。** 10 枚（5 枚 × 2 幅）とも欠け・はみ出し・重なり・空白・文字化けは無かった。
- 枠はみ出しは JS でも機械測定した（`#slide-canvas` の矩形とスライド内 `div`/`span` の
  `getBoundingClientRect()` を比較）。3 枚目・11 枚目のコマンド行は
  両ビューポートとも**はみ出し無し**（`overflowRight`/`overflowLeft` とも 0）。
- **3・4・5 枚目の本文（`clamp(0.9rem, 1.9cqw, 1.4rem)` を使う要素）の計算後 `font-size`**
  （`getComputedStyle().fontSize`、ルートの `font-size` は 16px なので下限 0.9rem = 14.4px）:

  | 枚 | 1280×720 | 390×844 | 下限 (14.4px) を下回るか |
  |----|----------|---------|---------------------------|
  | 3  | 16.492px | 17.29px | 下回らない |
  | 4  | 16.492px | 17.29px | 下回らない |
  | 5  | 16.492px | 17.29px | 下回らない |

  （11・12 枚目は `clamp(0.9rem, ...)` を使う要素が無く（`0.8rem`・`0.95rem` 系のみ）、
  依頼書もこの 2 枚の font-size 測定は求めていないため対象外）
- 読み上げを再生し、3 枚目で `#audio-status-badge` を 1 秒間隔で記録した。
  `t=15.7s` で `朗読中` → `朗読完了` に変わり、`t=17.8s` で 4 枚目へ自動送りされた。
  `sample.js` ではなく `slides/user.js` の 3 枚目 `duration: 15` と**近い値**
  （実測 15.7s、宣言値 15）。字幕（CC ボタン ON）に表示された文言は
  `narration` フィールドの文字列と完全一致した。

## 6. 3 ファイルの手順が同じ結果になるか

`README.md` の「## 自分のスライドを作る」に載っているコード例は、
`docs/User.md` の「## 最小の例」と**文字列として同一**（diff で確認済み、差分無し）。
`README.md` の見出しどおり `mkdir`→`cd`→`ytslide init`→ヒアドキュメントで
`sample.js` を作成 → `?slides=sample` で開く、の手順を独立したディレクトリで再現し、
`docs/User.md` の 1. と同じ「1 枚が表示される」結果に到達した。食い違いは見つからなかった。

## 未確認・判断が要ること

- **別端末からの LAN 接続**: 実機が 1 台のため未確認（依頼書の指示どおり明記）。
- **`<audio>` の `currentTime`**: DOM に `<audio>` 要素が存在しない実装のため測定できなかった。
  `#audio-status-badge` の推移で代替したが、依頼書が要求した指標そのものではない。
  実装がそうなっていることの是非は判断していない。
- `ytslide video` による MP4 書き出しの再現はしていない（依頼書で対象外と明記）。
- `uv tool install` によるインストール再現はしていない（依頼書で対象外と明記）。
