# TODO-084 レビュー報告（消音時に自動送りが止まる不具合の修正）

対象: `git diff player.html`（`muteBtn` の click ハンドラ、1395〜1413 行付近）。
`docs/Developer.md` の「再生ロジック」「読み上げ」「副作用のある実装」を読んだ。

## 検討

### 1. 読み終わりの待ち（`pauseStartedAt` が立っている間）に消音すると、待ちが `duration + pauseSeconds` まで伸びる

- `player.html:906-921`（`speakCurrentNarration()`）は先頭で `stopSpeech()` を呼び、
  `pauseStartedAt` を `null` に戻し `slideTransitionTimeout` を消す。ナレーションが
  **既に終わって** 1〜3 秒の待ち中（`onSlideAudioFinished()` 通過後）に消音すると、
  残り時間（最大でも `pauseSeconds` 分）ではなく、`isMuted` 分岐で新たに張る
  `slide.duration / playbackRate` の全長タイマーが動き出し、それが終わってから
  さらに `schedulePauseTransition()` の `pauseSeconds` を待つ（`player.html:877-903`,
  `906-921`）。例えば 12 秒スライドの読了後、待ちの 0.5 秒目で消音すると、
  本来あと 1.5 秒で次へ進むところが、12 秒＋ 2 秒 ≈ 14 秒待つことになる。
- 依頼文にあった「割り切り」（ナレーション**途中**での消音で `duration` を
  丸ごと待ち直す）とは別の場面で、こちらは読了後の**短い**待ちの最中に
  起きる分だけ、体感の伸びが大きい（1〜3 秒のはずが数秒〜十数秒に伸びる）。
  管理者の説明にあった割り切りの範囲に含まれているかどうかは書かれていない
  ため、別項目として挙げる。
- ただし新規の穴ではない。同じ「消音中に `speakCurrentNarration()` を通すと
  `duration` を丸ごと待ち直す」構造は、`pauseSelect`（待ち秒数）を除く
  `speedSelect` の `change` ハンドラ（`player.html:1376-1382`、`isPlaying` なら
  無条件に `speakCurrentNarration()` を呼ぶ）と、消音解除（`else` 分岐、
  `player.html:1409-1412`。この診断対象の diff より前から存在）で、既に
  同じ経路が踏める。今回の修正は「消音」を「消音解除」に合わせて対称に
  しただけとも言える。
- **実害は未確認。** コードの読み合わせのみで、Playwright 等での実測はしていない。

### 2. コメントの言い回し

- `player.html:1401`「ここで直に呼ぶと消音にした枚で自動送りが止まる」の
  「した枚で」は日本語として据わりが悪い（「その枚」「そのスライドで」の
  類いが抜けている可能性）。意味は追えるので実害は無いが、コメントは
  読み手のためのものなので直しておくと良い。**好みの範囲**。

### 3. 自動テストが無い

- リポジトリのテストは `tools/test_measure_duration.py` と
  `tools/test_make_video.py` の 2 本のみで（`CLAUDE.md`）、JS 側の
  自動テスト基盤が無い。今回の確認は `archives/agents/TODO-084/measure-mute.py`
  という単発の Playwright スクリプトで、リポジトリの回帰テストには
  組み込まれていない。将来同じ不具合が再発しても自動では検出されない。
  既存のテスト体制がそもそも無いプロジェクトなので「要修正」にはしていない。

## 確認したが問題を見つけなかった点

- **`speechRunId` の弾き方**: `speakCurrentNarration()` はまず `stopSpeech()` で
  `speechRunId` をインクリメントしてから新しい `runId` を控えるので、古い
  `play()` の reject や `onend` は従来どおり弾かれる。この diff が新しい
  弾き漏れを作っている様子は無い。
- **`#audio-error-notice` の出し消し**: `stopSpeech()` の先頭で `hideAudioError()`
  を呼ぶ（`player.html:855`）。消音を `speakCurrentNarration()` 経由にしても
  `stopSpeech()` は必ず最初に通るので、消音時に通知が消える挙動は変わらない。
- **最後のスライドでの消音**: `isMuted` 分岐のタイマー満了後は
  `onSlideAudioFinished()` → `schedulePauseTransition()` を経由し、最後の
  スライドなら `pausePresentation()` が呼ばれる通常の経路に合流する。
  途中で `isPlaying` が変わっていれば `schedulePauseTransition()` 内の
  `if (!isPlaying) return;` で止まるので、余計な巻き戻しは無い。
- **消音解除の経路**: `else` 分岐（`player.html:1409-1412`）は diff の対象外で
  変更されていない。
- **`docs/Developer.md` との食い違い**: 「再生ロジック」節の「`duration` を
  待ち時間として使うのは消音中と音声が再生できなかったときだけ」、
  「副作用のある実装」節の「消すのは `stopSpeech()`。…消音・エンジン切替・
  再試行はすべてここを通る」は、どちらもこの diff の後でも成り立っている
  （`speakCurrentNarration()` が先頭で `stopSpeech()` を通すため）。文書を
  直す必要は無いと見た。

## 規約

- `CLAUDE.md`（プロジェクト直下）にコーディングの書式規約（行長・インデント等）
  の記載は無い。今回の diff のインデント・書き方は周囲のコードと揃っている。
- diff の範囲は依頼どおり `muteBtn` の click ハンドラのみで、指示に無い変更は
  見当たらなかった。
