# TODO-088 verifier 報告（実測）

計測スクリプト: `archives/agents/TODO-088/check-standalone-and-audio.js.txt`
（`node check-standalone-and-audio.js` として実行。playwright は
`NODE_PATH=/home/ytani/work/ytBackgammon/node_modules`、chromium headless、
viewport 1280x800、playwright 1.63.0 / node v26.9.0）。
生の実行ログとイベント全文は `run.log` として同ディレクトリに合わせて確認できる
（このスクリプトを再実行すれば再現する）。

指示どおり、コード・文書は一切変更していない。原因の切り分けや
境界線上の判断はしていない。

## 実測1: ファイル2つだけで動くか

`player.html` と `slides/readme.js` の2つだけをコピーした空ディレクトリ
（`slides/` の構造は保持、`images/` などは含めず）を、
`file://.../player.html?slides=readme` と
`http://localhost:8123/player.html?slides=readme` の両方で開いた。

両方とも結果は同一だった。

- console error: 0 件、pageerror: 0 件、requestfailed: 0 件
  （`file://` でも `http://` でも、失敗したリクエストは無かった）
- スライド本文（`document.body.innerText` の抜粋）の文字数: 88 文字
  （初期表示時点、1枚目のタイトル画面相当）
- 「読み込めませんでした」の文言: 出ていない（`false`）
- スライド総数（`slideData.length`）: 10
- 2枚目へ送って本文が描画されるか: された。`#next-btn` クリック後、
  「できること」の見出しと本文（読み上げと字幕表示 / 自動再生で次へ /
  再生速度 0.75〜2.0倍 / フルスクリーン・前後送り / スマホ対応 の5項目）
  が正しく表示された。file/http で内容は同一
- スクリーンショット: `~/tmp/playwright-mcp/TODO-088-standalone-file.png`、
  `-http.png` に保存。両方とも 1280x800 の PNG で、不透明・欠けなし・
  余計なものの映り込みなし。2枚は見た目上ピクセル単位で同一に見える
  （目視。ピクセル差分ツールでの比較まではしていない）

**結論（値のみ、評価は含めない）**: 「ファイル2つを置くだけで動く」に
反する事象は、file:// と http:// のどちらでも観測されなかった。

## 実測2: `file://` で音声が鳴るか

リポジトリ本体（コピーではない）を `file://` と
`http://localhost:8124/` の両方で `player.html?slides=readme` を開いて測定。

### (a) Web Speech API

- `speechSynthesis.getVoices().length`: **0**（file/http とも同じ）
- 日本語音声の有無: 無し（`jaVoicesCount: 0`）
- `SpeechSynthesisUtterance('テスト')` を speak() した結果:
  file: `onerror:synthesis-failed`（1ms後）
  http: `onerror:synthesis-failed`（1ms後、`jaVoicesCount`等も同じ）
  → **file と http で差は無かった**（どちらも失敗）。これはヘッドレス
  Chromium に音声合成エンジンが無いことによるものと見られる
  （推定であり確認していない）。file:// 固有の事象ではない

### (b) Online Voice（translate_tts）

- `new Audio(...)` を作って `play()` した結果、file/http とも
  イベント順は `canplay`（file:196ms / http:94ms）→
  `playing`（同時刻）→ `ended`（file:1109ms / http:1012ms）
  `error` イベントは出なかった
- `timeupdate`: 4回（file/http とも）
- `currentTime` / `duration`: file `0.888 / 0.888`、http `0.888 / 0.888`
  （同一）
- translate_tts への実リクエスト: `request` イベントで file/http とも
  2件（page内の直接テスト用 `テスト` と、player.html が自動再生した
  ナレーション本文）を観測。`response` はいずれも **status 200**
  （file/http とも同一。`file://` でも translate_tts へのリクエストは
  ブロックされなかった）
- `requestfailed`: 0件（file/http とも）
- player.html の再生ボタン（`#play-btn`）をクリックし10秒待った結果:
  - `#audio-error-notice` の表示（`hidden` クラス無し）: **file/http とも
    false**（＝表示されていない。要素自体は存在し、非表示の状態で
    テキストは持っている）
  - `#audio-status-badge` の文言: **file/http とも「朗読中 (Online Voice)」**
    （エラー表示ではなく、再生中の表示だった）

**結論（値のみ）**: 実測した範囲では、Online Voice（translate_tts）も
Web Speech API も、`file://` と `http://` で挙動に差は無かった。
Web Speech API はどちらでも失敗し（ヘッドレスに音声合成エンジンが
無いためと見られるが未確認）、Online Voice はどちらでも成功していた
（200応答・再生完了・エラー表示なし）。

## 確かめられなかったこと・判断できないこと

- Web Speech API の失敗がヘッドレス Chromium 固有の制約によるものか、
  `file://` オリジンの制約によるものかは、この実測だけでは切り分けて
  いない（両方の環境で同じ失敗が出た、という事実のみ報告する）。
  実機のブラウザ（GUI・音声デバイスあり）での `file://` と `http://`
  の差は、この検証の対象外で確かめていない
- スクリーンショット2枚の完全な同一性は目視のみで確認した。
  ピクセル差分ツール（`compare` 等）での機械的な比較はしていない
- README.md / slides/readme.js の文言と実測結果の整合性（「合っているか」
  の評価）は、指示どおり判断していない。値のみ報告した
- `player.html?slides=readme` 以外のスライド（例: `developer.js` など）
  や、画像を使うスライドでの `file://` 動作（`images/` を含む場合の
  リソース読み込み）は対象外のため確認していない
