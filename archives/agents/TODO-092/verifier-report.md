# TODO-092 検証報告

対象: 未コミットの `git diff`（`player.html`, `docs/Developer.md`, `docs/User.md`）

## 検証方法

TODO-091 と同じ環境（ヘッドレス Chromium / Playwright 1.63.0、他プロジェクトの
`node_modules` を `NODE_PATH` で借用）で `player.html`（`file://`）を開いて測った。

計測スクリプト: `archives/agents/TODO-092/check-mute-header.js`
（ケース: `dom-order` / `click-toggle` / `key-toggle` /
`auto-advance-while-muted` / `panel-cleanup`）。実行コマンド:

```
NODE_PATH=/tmp/verify064b/node_modules node check-mute-header.js <case>
```

オンライン TTS（`translate.google.com`）へのリクエストは `page.route(...)
.abort()` でブロックした（実際の音声取得は検証対象外のため）。

## 確認項目ごとの結果

### 1. `#mute-btn` が 1 つだけ、`#voice-select` と同じ親の中でその左にある

`dom-order` ケースの実測値:

```json
{
  "muteBtnCount": 1,
  "sameParent": true,
  "muteBeforeSelect": true
}
```

**OK**。DOM 上の子要素の並び順（`Array.from(parent.children).indexOf(...)`
比較）で `mute-btn` が `voice-select` より前にあることを確認した。

### 2. クリックで `aria-pressed` と `#mute-icon` の class が入れ替わる

`click-toggle` ケースの実測値:

```json
"before":      { "ariaPressed": "false", "iconClass": "fa-solid fa-volume-high" },
"afterClick1": { "ariaPressed": "true",  "iconClass": "fa-solid fa-volume-xmark text-rose-400" },
"afterClick2": { "ariaPressed": "false", "iconClass": "fa-solid fa-volume-high" }
```

**OK**。

### 3. `M` キーでも同じように切り替わる（フォーカスが無い状態）

`key-toggle` ケース（`body` をクリックしてフォーカスを外してから
`keyboard.press('m')` / `'M'`）:

```json
"before": "false", "afterM1": "true", "afterM2": "false",
"finalIconClass": "fa-solid fa-volume-high"
```

**OK**。小文字・大文字どちらの `M` でもトグルした
（`player.html` の `e.key === 'm' || e.key === 'M'` 分岐と一致）。

このケースで `net::ERR_FAILED` が 2 件出ているが、これは押した M キーで
再生中の消音を確認しようとしたわけではなく、単に上記の route ブロックで
オンライン TTS の読み込みを意図的に失敗させたことによるもの。アプリの
コンソールエラーではなくブラウザのネットワーク層のログで、TODO-092 の
変更起因の不具合ではない（後述「4」で改めて確認）。

### 4. 再生中に消音にしても自動送りが止まらない（TODO-084 再発確認）

`auto-advance-while-muted` ケース。`slideData` 全スライドの `duration` を
0.5 秒に短縮したうえで、`#play-btn` をクリックして再生開始 → 即座に
`#mute-btn` をクリックして消音 → 3.5 秒待って `currentIndex` を確認:

```json
{
  "currentIndexBefore": 0,
  "isPlayingAfterPlayClick": true,
  "isMutedAfterMuteClick": true,
  "currentIndexJustAfterMute": 0,
  "currentIndexAfterWait": 1,
  "isPlayingAfterWait": true
}
```

**OK**。消音直後は `currentIndex` が 0 のままだが、`duration`（0.5 秒）＋
既定の待ち（2 秒）が経過した後は `currentIndex` が 1 に進み、
`isPlaying` も `true` のまま（自動送りが止まっていない）。

ここでも `net::ERR_FAILED` が 1 件出ているが、これは再生開始直後（消音前）
に発火したオンライン TTS への `fetch`/`<audio src>` 読み込みを route で
アボートした結果であり、消音後の自動送り自体には影響していない
（`currentIndex` が想定どおり進んだことで確認できる）。

### 5. 操作パネル側に消音ボタンの残骸が無い／他のボタンが壊れていない

DOM 全体（`<script>` を除く）を `id`/`class` に `mute` を含む要素で検索:

```json
[
  { "tag": "BUTTON", "id": "mute-btn", "cls": "... text-lime-400 ..." },
  { "tag": "I", "id": "mute-icon", "cls": "fa-solid fa-volume-high" }
]
```

移設先の 1 組だけで、操作パネル側に別の `mute-btn`/`mute-icon` は無い。

（補足: `check-mute-header.js` の `panel-cleanup` ケースは
`document.body.innerHTML` に対する正規表現でも測ったが、`<script>` 内の
JS 変数名（`isMuted`、`muteBtn` などの参照）まで拾ってしまい
`strayMuteRefs: 11` という誤解を招く値になったため、上記の
`querySelectorAll('body *:not(script)')` によるやり直しの実測を採用した。
このスクリプトはファイルに残していない単発の `node -e` で実行した）

`fullscreen-btn` は健在で、クリックで `aria-pressed` が `"true"` に
変わることを確認した（`panel-cleanup` ケース: `fullscreenBtnExists: 1`,
`fullscreenAriaPressedAfterClick: "true"`）。**OK**。

### 6. コンソールエラーが出ていないこと

ネットワークのブロックを一切せず、素の状態でページを読み込み、
消音ボタンをクリックしただけの単発確認:

```
idle load errors: []
after mute click (no play) errors: []
```

**OK**。上記「3」「4」で見えた `net::ERR_FAILED` は、検証スクリプト側の
`page.route().abort()` によるものであり、素の読み込み・消音操作単体では
コンソールエラーは出ない。

### 7. `docs/User.md`・`docs/Developer.md` の記述が実装と合っている

- `docs/User.md` の追記「消音は、そのプルダウンの左にあるスピーカーマークで
  切り替える（`M` キーでも同じ）。消音中はマークが赤い『消音』の形になる」
  は、上記 1〜3 の実測と一致（左にある／`M` キーも効く／消音中は
  `fa-volume-xmark text-rose-400` になる）。
- `docs/Developer.md` の追記「消音の `#mute-btn` はそのプルダウンの左に
  置き」「アイコンの色はボタン側（`text-lime-400`）に持たせる」は、
  `player.html` の実装（`<button id="mute-btn" ... class="... text-lime-400
  ...">` の中に `<i id="mute-icon" class="fa-solid fa-volume-high">`）と
  一致。
- 操作ガイド（`player.html` 内のショートカット一覧ダイアログ）の
  `<dt>M</dt><dd>消音の切り替え</dd>` は今回変更されていないが、`M` キーの
  挙動自体は変わっていないので記述と実装は食い違っていない。

## 変更ファイルの範囲

`git status --short`:

```
 M docs/Developer.md
 M docs/User.md
 M player.html
?? archives/agents/TODO-092/
```

TODO-092 の指示どおり `player.html` / `docs/Developer.md` /
`docs/User.md` の 3 ファイルのみが変更されており、指示に無いファイルは
無い（`archives/agents/TODO-092/` は今回の検証の作業産物）。

## 確かめられなかったこと・判断できないこと

- 実際のブラウザでの見た目（アイコンの視認性、色のコントラストなど）は
  指示どおり対象外とし、確かめていない
- `panel-cleanup` ケースの `strayMuteRefs`（正規表現ベース）は誤検出を
  含む値だったため、`querySelectorAll` ベースの結果に差し替えて報告した。
  スクリプトファイル自体は誤検出のロジックのまま残っている
  （`check-mute-header.js` の `panel-cleanup` ケース）。作り直すかどうかは
  管理者の判断に委ねる
- オンライン TTS を実際に発話させた状態での消音切り替え（本物の音声取得が
  進行中の状態からの切り替え）は、ネットワークをブロックしているため
  未確認。`speakCurrentNarration()` のコード上は `pauseStartedAt === null`
  の間は同じ分岐を通るため、`online` でも `speech` でも挙動は変わらない
  はずだが、実測はしていない
