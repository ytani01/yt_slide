# TODO-124 reviewer の報告

対象: `git diff`（player.html・docs/Developer.md・README.md・TODO.md）。
計測に使ったスクリプトは scratchpad に置いたもので、リポジトリには残していない
（Playwright chromium。firefox・webkit は未インストールで測れていない）。

## 要修正

### 1. ダブルクリック・ダブルタップでフルスクリーンにならない（player.html:1548-1549）

`document` の capture の `if (e.detail <= 1) tapToggles = 0;` が、枠の
click ハンドラの中で呼ぶ `playBtn.click()` の合成 click（`detail` 0）にも
当たる。順序は「枠の click で `tapToggles++` → `playBtn.click()` →
document の capture で 0 に戻る」となり、`dblclick` の時点で
`tapToggles` は必ず 0。`tapToggles !== 2` で弾かれ、機能が働かない。

実測（chromium、`page.mouse.dblclick` と `touchscreen.tap` 2 回）:

- document の capture で見た click の順: `SPAN:1`, `play-btn:0`, `SPAN:2`, `play-btn:0`, `dbl`
- 今の差分: マウス `fs=False`、タッチ `fs=False`
- 比較のため条件だけ `e.detail === 1` に替えたもの: マウス `fs=True`、タッチ `fs=True`
  （どちらも再生状態は元に戻った）

コメント（「e.detail が 1 から数える」）と docs/Developer.md:349
（「`e.detail` が 1 の `click`」）は 1 だけを数え直しとして書いており、
コードの `<= 1` と食い違っている。直すときは、コード・コメント・Developer.md
を揃えること。

なお `detail` 0 を数え直しに含めない場合、キーボードの Enter・Space で
押したボタンの click（`detail` 0）では数え直さなくなる。キーボードだけで
枠の `dblclick` は起きないので、問題にはならないと見ている（実害は未確認）。

## 検討

### 2. 3 連打で再生状態がずれる（player.html:1607-1610）

上の 1 を `=== 1` に替えた版で、`page.mouse.click(click_count=3)` を測った:
`c1, c2, dbl, c3` の順に届き、フルスクリーンに入ったうえで再生が始まった
（`朗読中`）。4 連打では `dblclick` は 2 回目のあとの 1 回だけで、
`一時停止中`（元どおり）。chromium は `detail` 2 のときだけ `dblclick` を送る。
3 回目の click は `tapToggles` が 3 になるが、枠の click ハンドラは回数を
見ないので切り替わる。「1 回目は待たせない」という決めごとから来る挙動で、
要件（ダブルタップなら元に戻る）には反しない。スマホでは 3 回目が
フルスクリーンの暗幕に当たって抜ける可能性もある（未確認）。
境界線上の判断なので報告だけ。実害は未確認。

### 3. `touch-action: manipulation` を付けた理由が実際と合っていない可能性（player.html:57-58、docs/Developer.md:347-348、player.html:1605-1606 のコメント）

`player.html:5` は `width=device-width` の viewport meta を持っており、
Android の Chrome はこの指定でダブルタップのズームを既に止めている
（と理解しているが、実機では未確認）。だとすると `manipulation` が効くのは
主に iOS の Safari で、「Android の Chrome でズームに取られないように」と
いう理由づけはずれている。付けることの副作用は見当たらない（下の
「問題なし」）。理由の書き方だけの問題。未確認。

### 4. iPhone・iPad の Safari で `dblclick` が届くか未確認（README.md:35-36、player.html:580）

README と操作ガイドは「ダブルタップでフルスクリーン」を全体の機能として
書いている。事前の実測は chromium のエミュレーションだけ。iOS の Safari が
タッチのダブルタップで `dblclick` を送るかは測られていない。届かない場合、
README の「スマホ対応」の記述が iPhone・iPad では成り立たない。未確認。

## 任意

### 5. 操作ガイドのフルスクリーンの抜け方に、ダブルタップが無い（player.html:584）

「フルスクリーン中は、画面の左上の × で……暗幕のタップや、Android の
［戻る］操作でも戻れます」の段落に、スライドのダブルタップで戻れることが
入っていない。上の表（580 行）に「切り替え」とあるので読めば分かる。

## 問題なしの観点

- スワイプ（`swiped`）: スワイプ後の click は `++` しないので 1 回扱いになり、`dblclick` を弾く。`swiped` は次の `touchstart` で落ちる。問題なし（1 を直した前提）
- 暗幕のタップ・終了ボタン: 1 回目が枠の外なら document で 0 に戻り、2 回目が枠に当たっても 1 回で弾く。Developer.md の説明どおり（1 を直した前提）
- `touch-action: manipulation` の影響: pan と pinch-zoom は許すので縦スクロール・ピンチは変わらない。スワイプは touchend で判定しており影響しない。暗幕（`::before`）は枠の祖先ではないので、`touch-action: none` との合成は起きない
- ナレーションが頭から読み直しになるという Developer.md の記述: `playPresentation` → `speakCurrentNarration` がスライドのナレーションを最初から読むので合っている
- Developer.md の 2 つの mermaid 図: 文章と食い違いなし
- テスト: `tests/` はプレイヤーの操作を扱っておらず、既存のやり方どおり Playwright での確認は verifier に任せる形。足りないとは見ない
- 範囲: 指示に無い変更は無い。TODO.md はチェックを入れただけ

## 作り込みすぎ

作り込みすぎ: なし（`tapToggles` と document の capture は、スワイプと
暗幕の場合を区別するのに要る最小限。枠の click の中で数え直す形では、
1 回目が暗幕に当たったときに前の回の数が残る）
