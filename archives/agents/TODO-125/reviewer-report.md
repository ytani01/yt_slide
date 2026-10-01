# TODO-125 reviewer 報告

対象: `git diff`（player.html・docs/Developer.md・README.md・TODO.md）。
ブラウザでの実測はしていない（verifier の担当）。CSS とコードを読んだ結果と、
数値の計算で書いている。

## 要修正

### 1. 横持ち・PC のフルスクリーンで、字幕の帯が再生失敗の通知に重なる

- `player.html:244-250`（`#audio-error-notice` の `bottom: 0`）と
  `player.html:192-209`（字幕の `bottom: 4%`）
- 横持ちと PC では、通知はフルスクリーン中に枠の下端へ重ねている（TODO-078）。
  今回、字幕も枠の下端（`bottom: 4%`）に重ねたので、両方が枠の下端の同じ所に来る。
  どちらも `z-30` で、DOM では字幕が後（`player.html:458`、通知は `:447`）なので、
  字幕の帯が通知の上に描かれる。通知の高さは `p-3` とボタンで 60px 前後、
  字幕の `bottom: 4%` は枠の高さ 390px で 16px なので、帯は通知の文言と
  ボタンに掛かる
- 字幕は `pointer-events: none` なので、通知のボタンは押せるはず。
  見た目の実害（文言やボタンが読めない程度か）はブラウザで未確認
- 縦持ちは通知が枠の上（`bottom: 100%`）に出るので重ならない

### 2. 「下は字幕が使う」という記述が古くなった

- `player.html:251-252` のコメント「縦持ちは枠の上に余白があるので…下は字幕が使う」
- `docs/Developer.md:228`「縦持ちは枠の上（`bottom: 100%`。下は字幕が使う）」
- フルスクリーン中の字幕は枠の下（暗幕）を使わなくなったので、通知を枠の上へ
  出す理由として成り立たない。1 の扱いを決めるときに合わせて直す必要がある
  （通知を縦持ちで枠の上に出すこと自体は、スライドを隠さないという理由で残る）

## 検討

### 3. 長いナレーションでは、縦持ちのフルスクリーンで字幕がスライドの大半を覆う

- `player.html:207-208`（`clamp(14px, …, 44px)`）と `max-width: 90%`
- ナレーションの長さを数えた（`slides/*.js`）: 最長 176 字（claude-memo）、
  各一式の中央値は 74〜135 字
- 縦持ち 390px 幅の画面では枠の幅が 390px で、2.4% は 9.4px なので下限の 14px が
  効く。90% 幅に 1 行約 25 字、176 字で 7 行、行の高さ 21px で約 150px。
  枠の高さは 219px なので、**枠の 7 割前後を覆う**（計算。ブラウザでは未確認）
- 横持ち 844x390 では枠 693px 幅・文字 16.6px・1 行約 36 字で 5 行、
  約 125px で枠の高さ 390px の 3 割強
- 要件（TODO.md の「本文だけを」帯に載せる）どおりではあるが、縦持ちは
  枠の上下に暗幕の余白があり、従来の枠の下に出す方が隠さない。縦持ちだけ
  従来の位置に残すかは利用者の判断（境界線上なので報告だけ）

### 4. Safari 系では帯のぼかしが消えない（実害は未確認）

- `player.html:205`（`backdrop-filter: none`）
- `#subtitle-banner` のクラス `backdrop-blur` は、Tailwind CDN では
  `-webkit-backdrop-filter` と `backdrop-filter` の両方を出す（cdn.tailwindcss.com の
  スクリプトを取得して確認: `"-webkit-backdrop-filter":ge,"backdrop-filter":ge`）。
  上書きは無接頭辞の方だけなので、`-webkit-` だけを見るブラウザ（Safari 18 より
  前の iOS など）では、帯の裏のスライドがぼける
- 「半透明の黒い帯」とは見た目が少し違うだけで、機能の実害は無い。
  上書きするなら `-webkit-backdrop-filter: none;` を 1 行足す

### 5. dvh 非対応ブラウザ向けの font-size が、枠の幅の計算と食い違う

- `player.html:207` `font-size: clamp(14px, 2.4vw, 44px);`
- ラッパー（`player.html:143-158`）は dvh 非対応のときに `vh` の行
  （`max-width: calc(100vh * (16 / 9))`）で幅を決める。字幕の予備の行は
  `2.4vw` だけで、高さで幅が決まる画面（横長の画面、横持ちのスマホ）では
  枠の幅の 2.4% より大きくなる（844x390 で 20.3px 対 16.6px）
- `min()` は dvh より古くから使えるので、予備の行も
  `clamp(14px, min(2.4vw, 4.27vh), 44px)` にすればラッパーと揃う。
  dvh の行の値 `4.27dvh`（= 2.4 × 16/9 = 4.267）は正しい
- 影響を受けるのは dvh 非対応で `min()` 対応の範囲（Safari 15.3 以前など）だけ

### 6. 字幕に関する古いコメント

- `player.html:455-457` の HTML コメント「画面幅によらず枠の下へ流す（TODO-035）」は、
  フルスクリーン中は重ねるようになったので「通常表示では」が要る
- `player.html:1659-1662`（暗幕のハンドラのコメント）と `docs/Developer.md:386` の
  「枠や字幕のタップ」は、フルスクリーン中の字幕が `pointer-events: none` になり
  タップを受けなくなったので、字幕の部分は意味が無い。誤りではない（字幕の上の
  タップは枠に通り、暗幕の終了には化けない）ので、直すかは好みに近い

## 好みの範囲

- `TODO.md:43` 項目の文言に「「字幕」と書いた」を足している。実装で決めたことを
  書き戻したもので問題は無いが、チェック以外の変更なので記しておく

## 見てほしい点への回答（問題なし）

- **Tailwind との衝突**: フルスクリーンの規則は `display` を書いていないので、
  字幕 OFF の `hidden`（`display: none`）は効き続ける。`p-3`・`mt-3`・`rounded-xl`・
  `border`・`shadow-2xl` は id セレクタの `padding`・`margin: 0`・`border-radius`・
  `border: 0`・`box-shadow: none` が詳細度で勝つ。本文の `text-sm md:text-base`・
  `leading-relaxed` も `#caption-text` の `font-size: 1em`・`line-height` が勝つ。
  ボタンの `hidden` と `display: flex` は終了ボタンと同じ形（例外は 4 の `-webkit-`）
- **縮小経路の重なり順**: ラッパーが `z-index: 9999` の fixed で重なりの基準になり、
  枠（`.video-viewport.pseudo-fullscreen`）は `z-index: 1`、字幕は `z-30`、
  ボタンは 40、暗幕は -1。字幕は枠の上、ボタンはその上に出る。字幕は枠
  （`#viewport-frame` の `overflow: hidden`）の外の兄弟なので切られない
- **タップ**: `pointer-events` は継承され、子で戻していないので、帯の上のタップ・
  ダブルタップ・スワイプは `#player-viewport` に届き、従来どおり再生／一時停止・
  フルスクリーン切り替え・送りになる。暗幕のハンドラは `e.target === stage`
  なので、字幕ボタンの click では抜けない。`toggleCaptionBtn.click()` の合成 click は
  `detail` が 0 で、`tapToggles` を数え直さない
- **C キー**: 修飾キー・`guide.open`・`isComposing`・入力欄の除外は前段で済んでいて、
  F・M と同じ扱い。`!e.repeat` は F と揃っている。ボタンの上でも効くのは F・M と同じ
- **applyCaptions()**: 状態は `showCaptions` 1 つで、変えるのは
  `toggleCaptionBtn` の click だけ（`player.html:1453-1457`）。字幕ボタン・C キーとも
  そこを通るので、2 つのボタンの `aria-pressed` と色は食い違わない。起動時も
  `applyCaptions()`（`:1803`）が両方を揃える
- **文書**: Developer.md の新しい記述（2.4%、`min(2.4vw, 4.27dvh)`、14〜44px、
  container を使わない理由、`pointer-events: none`、ボタンの仕組み）は実装と一致。
  container-type はレイアウト封じ込めを伴い fixed の基準になる、という理由も正しい。
  README・操作ガイドの記述も実装と一致（2 と 6 を除く）
- **テスト**: プレイヤーの UI には自動テストが無く（`tests/test_browser.py` は
  起動まわりだけ）、verifier の実測で確かめる運用なので、足すべきテストは無い
- **範囲**: 指示に無い変更は無い

## 作り込みすぎ

作り込みすぎ: なし（追加した CSS はどれもクラスの上書きに要るもの。字幕ボタンは
既存の `toggleCaptionBtn.click()` を呼ぶだけで、状態と保存を重複させていない）
