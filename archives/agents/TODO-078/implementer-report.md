# TODO-078 implementer 報告

## 変更
- `player.html`: CSS `#viewport-stage.is-fullscreen > #audio-error-notice`（枠の下端に重ねる）、
  HTML `#audio-error-notice`（`#subtitle-banner` の直前、`role="status"`、既定 `hidden`）、
  `hideAudioError()` / `showAudioError()`（`stopSpeech()` の直前）、`stopSpeech()` 冒頭で消す、
  `speakOnlineTTS()` の `onended`・`onplaying`（新設。`stopSpeech()` と冒頭で `null` に戻す）・
  `onerror`・`play().catch`、ボタン 2 つの click（`toggleVoiceEngineBtn.click()` を呼ぶ）。
- `docs/User.md`「音が出ないとき」、`docs/Developer.md`「再生失敗の通知」を追加。
- 確認スクリプト: `archives/agents/TODO-078/implementer-check.mjs`
  （`python3 -m http.server 8792` を立て、`PW_PATH=$(npm root -g)/playwright/index.mjs node ...`）。

## 方針から外れた点
- 擬似フルスクリーンでは、字幕と同じ「枠の下」に置くと画面外（844x390、1280x800 で y が
  viewport の外）になったため、通知だけ枠の下端に重ねた（スライド下端を隠す。一時的なもの）。
- `runId` は `onerror` にも入れた（`stopSpeech()` で `null` に戻るため実質保険）。
- `onplaying` でバッジを「朗読中 (Online Voice)」に戻す（失敗後に再試行が成功したときのため）。

## 測った値（スクリプトは全て OK、終了コード 0）
- TTS を abort: 通知 hidden=false、バッジ「音声エラー」、`slideTransitionTimeout` 有り。
  再試行後も同じスライドで `play` 呼び出し 1 回（二重再生なし）。
- エンジン切替の直後に通知 hidden=true、engine=speech。headless には音声が無く
  Web Speech は失敗して online へ切り替わり、通知が再び出た（方針 6 の経路）。
- `duration=1` にすると通知が出たまま 4.5 秒以内に次のスライドへ自動で進んだ。
- `play()` を `NotAllowedError` で reject: 通知＋タイマー。`AbortError`: 通知なし。
  400ms 遅れて reject する間に一時停止: 通知なし、バッジは「一時停止中」のまま。
- 正常再生（1 秒の WAV を返す）・消音・一時停止: 通知なし。失敗後、再試行が成功で通知が消える。
- 既定で `display:none`。`pageerror` なし。
- 390x844（通常・擬似フルスクリーン）、844x390・1280x800（擬似フルスクリーン）で、
  ボタン 2 つが画面内かつ `elementFromPoint` で最前面。

## 確認できなかった条件
- 実際の音声出力（音が鳴るか）。DOM と変数だけを見ている。
- 実機の Android/iOS。Playwright の isMobile 設定のみ。
- 字幕を表示した状態での重なり（通常表示は縦に積むだけ。フルスクリーンでは
  字幕は枠の下、通知は枠の下端に重なるので、両方出ると位置が別）。

## 気づいたこと
- `onerror` と `play()` の reject が両方来ると `showAudioError()` と `setEndTimeout` が
  2 回呼ばれる。実害なし（既存の挙動と同じ）。
- `CLAUDE.md` の必須コマンドの節は見当たらず、検証は上のスクリプトのみ。
