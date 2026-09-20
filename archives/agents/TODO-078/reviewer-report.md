# TODO-078 reviewer 報告

対象: 未コミット差分（`player.html` / `docs/User.md` / `docs/Developer.md`）。
方法: コードの通読のみ。**実測はしていない**（下の「実害」欄が「未確認」のものは、すべて読んだだけ）。
コードは直していない。

## 要修正（2 件）

### 1. `docs/User.md:1` 指示に無い見出しの書き換え（範囲）
- 何が起きうるか: 1 行目が `# スライドを作る` から `# ユーザーズ・ガイド` に変わっている。TODO-078 の 5 項目のどれにも含まれない。
  `slides/user.js:2` のコメントは「docs/User.md（スライドを作る人向けの手順）」のまま。
- 根拠: `git diff docs/User.md`。`grep` では見出しへのアンカーリンクは見つからなかった（`archives/` 除く）ので、壊れるリンクは無い。
- 実害: 未確認（リンク切れ以外の影響は見ていない）。意図した変更なら別項目にするか、この項目に含めると明記する。

### 2. `player.html:367-373` 字幕バナーの説明コメントが通知の上に来ている
- 何が起きうるか: 元は `#subtitle-banner` の直前にあった HTML コメント
  （「Bottom Subtitle / Narration Banner。縮小の対象は…画面幅によらず枠の下へ流す（TODO-035）」）の直後に
  `#audio-error-notice` が挿入され、コメントが通知の説明に読める。通知自体にはコメントが無い。
- 根拠: 差分の `@@ -360,6 +370,11 @@` の位置。既存コメントは字幕の位置の理由を書いたもの。
- 実害: 読み違えるだけ（動作には影響しない）。

## 検討（4 件）

### 3. `player.html:1338` / `1340`（「音声エンジンを切り替える」ボタンの行き先）
- 何が起きうるか: ボタンは `toggleVoiceEngineBtn.click()` を呼ぶので、`voiceEngineMode` を反転するだけ。
  `voiceEngineMode === 'speech'` で Web Speech が失敗して Online TTS に落ち、その Online TTS も失敗して通知が出た場合、
  切り替えると `'online'` になり、**失敗した Online TTS を再度使う**。文言は「入れ替える」だが、実際に鳴らすものは変わらない。
  もう一度押すと `'speech'` に戻る。`saveSetting` により、設定も localStorage に保存される（Developer.md には書いてある「切り替えのロジックは複製しない」の帰結）。
- 根拠: `player.html:1337-1344` と `:975-980`（Web Speech の `onerror` → `speakOnlineTTS`）を読んだ。
  実装者の報告にある測定は `online` から `speech` へ切り替える向きだけ。
- 実害: 未確認（`speech` 始まりで Online TTS が失敗する組み合わせは、実測していない）。

### 4. `player.html:870` / `:842`（バッジの上書き）
- 何が起きうるか: 通知が出ている間に、安全タイマーが `handleEnd` → `onSlideAudioFinished()` を呼ぶと
  `updateWaveState(true, "朗読完了")` でバッジが「朗読完了」（緑）に変わる。通知は次のスライドで `stopSpeech()` が呼ばれるまで
  残るため、待ち秒数（1〜3 秒）のあいだ「再生できませんでした」と「朗読完了」が同時に出る。
- 根拠: `onSlideAudioFinished()` は `hideAudioError()` を呼ばない。
- 実害: 未確認。なお、バッジは字幕バナーの中にあり、字幕を出していない既定の状態では見えない。

### 5. `player.html:1056-1059` / `:1073-1078`（読了後の遅れた失敗）
- 何が起きうるか: `showAudioError()` は `finished` を見ない（同じ関数内の `setEndTimeout` は見ている）。
  想定秒数のタイマーで `handleEnd()` 済み（待ち秒数の最中）のあとに `error` が届くと、通知と「音声エラー」バッジが待ちの間に出る。
  `runId` は `stopSpeech()` まで変わらないので弾かれない。
- 根拠: コードの読み合わせのみ。
- 実害: 未確認（再現していない。低頻度の見込み）。

### 6. `player.html:373`（`role="status"`）
- 何が起きうるか: `hidden`（`display: none`）から表示に変わる要素は、支援技術によっては読み上げられないことがある。
  また、ボタンを含む要素に `role="status"` を付けている。`role="alert"` にするか `aria-live` を別に持つ案がある。
- 根拠: 一般的な WAI-ARIA の挙動（このプロジェクトの `CLAUDE.md` に規定は無い）。実機の読み上げは未確認。
- 実害: 未確認。

## 好みの範囲（3 件）

- `player.html:1044-1046` `onended` の `hideAudioError()`: 通知が出ている間に `ended` が来る経路は見つからなかった
  （`error` の後は `ended` しない）。実質は不要。Developer.md にも「読み終わったとき（`onended`）にも消す」と書いてあるので、
  残すなら理由を 1 行足す。害は無い。
- `docs/User.md`（「音が出ないとき」）「状態表示は『音声エラー』」: バッジは字幕の中にあり、既定（字幕オフ）では見えない。
  「スライドの下に」も、擬似フルスクリーンではスライドの下端に重なる（CSS のコメントと実装は一致、User.md は一般論のまま）。
- 音声の取得が止まったまま `error` も `playing` も来ない場合（通信の停滞）は、通知が出ずにタイマーで次へ進む。
  要件の「取得・再生の失敗」の範囲外と読んだ。未確認。

## 問題が無かった項目

- 古い `onerror` / `play()` reject / `onplaying`: `stopSpeech()` と `speakOnlineTTS()` 冒頭でハンドラを `null` に戻し、`runId` で弾く。
  `AbortError` の除外も、`runId` が同じままの `speakOnlineTTS()` 再入（Web Speech の `onerror` から）で有効。問題なし（読んだ範囲）。
- 二重再生: `play()` は 1 回の呼び出しにつき 1 回。再試行は `stopSpeech()` の `pause()` を通る。`fallbackAudioElement` は作り直していない。
- 安全タイマー・無音時の自動送り・`onSlideAudioFinished` の `isPlaying` 判定: 変更なし。`setEndTimeout` の `finished` / `runId` 判定も保たれている。
- 誤通知: 一時停止（`pausePresentation` → `stopSpeech`）、消音（`muteBtn` → `stopSpeech`）、Web Speech の通常再生では `showAudioError()` に到達しない。
- HTML/CSS: `flex` と `hidden` の併用は `#subtitle-banner` と同じ形。id セレクタの規則は `display` を触らないので `hidden` は効く。
  `#viewport-stage.is-fullscreen > #audio-error-notice` は既存の字幕の規則と同じ形式で、`margin-top: 0` が `mt-3` に勝つ。
  通知はタップの `playerViewport` の外にあり、ボタンの `e.target` は `stage` ではないので、フルスクリーンの解除や再生の切り替えを誘発しない。
  キー操作は `closest('button')` で除外されている。
- 新しい数値の直書き・新しい定数の必要: 無し（TODO-024 に反する箇所は見つからなかった）。
- 名前の使われ方（`onplaying` / `hideAudioError` / `showAudioError` / `audio-error-notice`）: `player.html` と `Developer.md` の記述が一致。漏れ無し。
- `docs/Developer.md` の追記: 実装と一致。見出しの階層（`## 読み上げ` の下の `###`）も既存に揃っている。
- `docs/User.md` の追記: 節の位置と書式は既存に揃っている（見出しの書き換えは要修正 1）。
