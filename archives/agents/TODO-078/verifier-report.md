# TODO-078 verifier 報告

スクリプト: `archives/agents/TODO-078/verify.mjs`（http.server 8793、`PW_PATH=$(npm root -g)/playwright/index.mjs node verify.mjs`、終了 0）。
`setTimeout`/`clearTimeout`/`Audio`/`HTMLMediaElement.prototype.play` を包んで数えた。コードは変更していない。
`git status`: 変更は `player.html` `docs/Developer.md` `docs/User.md`（指示の範囲）と未追跡 `archives/agents/TODO-078/` のみ。

## 前提（既存の挙動）
再生ボタンを押すと `play()` が 2 回呼ばれる（`unlockFallbackAudio()` の無音 play ＋ 本体）。以下の `plays` はこれを含む。

## 1 失敗の再現
- (a) route abort: hidden=false、バッジ「音声エラー」、console.warn 3 件（Tailwind の警告を含む）、pageerror なし。404 も同じ。
- (b) play を NotAllowedError で reject（TTS は 200）: hidden=false、バッジ「音声エラー」、warn「Audio play blocked by browser interaction policy: NotAllowedError」、pageerror なし。一致。

## 2 もう一度再生
- クリック直後（同期）に hidden=true、`stopSpeech` 呼び出し 1 回。失敗が続く条件では 1.2 秒後に再び hidden=false、`play` 呼び出し +1。
- `Audio` 生成数は全ケースで 1（`fallbackAudioElement` は 1 個のまま）。
- 成功条件に切り替えて 3 回連続で押した: `play` +3（1 回につき 1）、有効な再生（`!paused`）は 1 個、通知 hidden=true、バッジ「朗読中 (Online Voice)」。一致。

## 3 エンジン切替
クリック直後 engine=speech、localStorage（`ytSlidePlayer.voiceEngineMode`）=speech、通知 hidden=true、既存ボタンの表示「Web Speech API」。既存ボタンをもう一度押すと online / online / 「Online Voice」。一致。
（headless は Web Speech が使えず、1.5 秒後に online 経路へ落ちて通知が再び出る。engine 表示は speech のまま。実害は未確認。）

## 4 次のスライドへ
- タイマー（duration=1, pause=1, 失敗のまま待つ）: 1695ms で idx 0→1、通知 hidden=true。
- 次へボタン・チャプター選択: クリックと同じ同期の時点で hidden=true（前の失敗は残らない）。300ms 後は abort が続く条件なので新しいスライド自身の失敗で再び出る（想定どおり）。

## 5 誤通知
- 正常再生（200 WAV）: 0.7 秒・3.2 秒後とも hidden=true、バッジ「朗読中」→「朗読完了」、idx 0→1。
- 消音（再生前）: hidden=true、「消音中」、タイマー 1（消音の待ち）。消音を戻すと abort により通知（想定）。失敗後に消音すると hidden=true、タイマー 0。
- 一時停止: hidden=true、「一時停止中」、タイマー 0。再生前（停止中）も hidden=true。
- Web Speech モード: headless では 200ms 以内に online へ落ち、abort 条件のため通知が出る（`plays`=2, engine 表示は speech のまま）。Web Speech が成功する環境での誤通知は測れていない（実機なし）。
一致（上記の注記を除く）。

## 6 古い呼び出しの残留
`play` の呼び出し 0・1 回目を 600ms 遅れて reject、以降は pending にして、100ms 後に操作:
- 次へ: reject 後 hidden=true、タイマー 1（新スライド分のみ）、idx 1。
- 一時停止: hidden=true、タイマー 0、バッジ「一時停止中」のまま。
- 消音: hidden=true、タイマー 0、「消音中」のまま。
- 対照（操作なし、最後の呼び出しの reject）: hidden=false、「音声エラー」。stale 判定だけが効いている。
一致。

## 7 見た目（保存先 `~/tmp/playwright-mcp/`）
`todo078-notice-pc-fs.png` / `todo078-notice-phone-portrait-fs.png` / `todo078-notice-phone-landscape-fs.png` / `todo078-notice-phone-portrait-normal.png`
- 全て通知は画面内、テキスト欠けなし。2 ボタンは `elementFromPoint` で最前面、実際に `click` も成功（3 サイズとも）。
  - PC fs 1280x800: 通知 y=700 h=60、ボタン 98x34 と 170x34。
  - 縦 fs 390x844: 通知 y=430 h=102（ボタンが 2 行に折り返し）。
  - 横 fs 844x390: 通知 y=330 h=60。
  - 縦 通常: 通知 y=278 h=102、スライドと重ならない。
- **食い違い（見た目）**: 擬似フルスクリーンでは通知がスライド下端に重なる（PC で約 35px、縦で約 92px）。縦 fs の画像ではスライド見出し 2 行目「プレゼンが動き出す」の下半分と、その下の文が通知で隠れている。設計（枠の下端に重ねる）どおりだが、隠れる量は縦が大きい。字幕表示との同時出現は測っていない。
- 擬似フルスクリーン中、再生・次へボタンは `elementFromPoint` で最前面ではなく（暗幕の下）、横向きでは画面外（y=-192）。通知が原因かは未確認（既存の擬似フルスクリーンの仕様と思われる。実害は未確認）。

## 8 既存の挙動
- abort 条件（duration=1, pause=1）: 4.5 秒で idx 2（1 枚 約 2.2 秒）。失敗しても進む。
- play を reject（TTS は 200 WAV）: idx 0→1→2 は 約 5 秒ごと（9.97 秒で idx 2）。
  食い違い: 失敗時の想定秒数（duration=1 秒）ではなく、`onloadedmetadata` が WAV の実長 1 秒 + `TTS_END_MARGIN_MS` 3 秒で待ちを張り直すため（推定）。この経路は変更前から同じと思われるが、変更前との比較はしていない。実害は未確認。進むこと自体は確認。

## reviewer の「検討」3〜6 について
個別には再現していない。見つけたもの: 上の 8 の待ち時間と、`play` が 2 回呼ばれる件（既存）。

## 確認できなかったこと
- 実際の音声出力、実機（Android/iOS）、Web Speech が成功する環境での Web Speech モードの誤通知、字幕と通知が同時に出る表示、変更前との比較（`git stash` は変更操作になるため使っていない）。
- 実行後、サーバー（8793）は PID を `pgrep` で確認して停止済み。

## 再測定（縦持ちの CSS 変更後）
スクリプト: `verify-v2.mjs`（縦の再測定）、`verify.mjs` は全項目を回し直して終了コード 0（FAIL 0 件）。サーバーは PID を指定して停止済み。
- (1)(2) 縦 390x844 擬似フルスクリーン: 通知 x=0 y=198 w=390 h=102 bottom=300（枠 312〜532、スライド 336〜522）。画面内、スライドと重ならない（overlapCanvas=false）。ボタン retry (279,211,98x34)・switch (13,253,170x34) は `elementFromPoint` で最前面、`click` も成功。
- 字幕 ON との同時表示: 通知 y=198〜300、字幕 y=544〜687。互いに重ならず、スライドの見出し・本文・字幕とも重ならない。画像でも欠けなし。字幕は下、通知は上。ボタンは同様に押せる。
- 縦 通常表示: 通知 x=16 y=278 h=102（以前と同じ値）、スライドと重ならず、scrollW=390。
- PC 1280x800 fs: 通知 x=0 y=700 w=1280 h=60（以前と同じ）。
- 横 844x390 fs: 通知 x=75 y=330 w=693 h=60（以前と同じ）。
- 上の画面の通知の上には、操作パネルが暗幕越しに見えているだけで、通知はそれより手前に出ている（画像で確認）。
- スクリーンショット: `~/tmp/playwright-mcp/todo078-notice-phone-portrait-fs-v2.png` `todo078-notice-phone-portrait-fs-caption-v2.png`（ほかに通常表示の `todo078-notice-phone-portrait-normal-v2.png`）。
