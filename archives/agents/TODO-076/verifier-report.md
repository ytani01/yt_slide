# TODO-076 verifier 報告

## 結論

問題なし。Chromium 153.0.8010.47 と Playwright で、1280×800 とタッチ設定の
390×844 を実測した。画面別の 58 項目、mutation test 1 項目、追加確認 2 項目の
計 61 項目がすべて通った。

実行コマンド:

```text
python3 archives/agents/TODO-076/verify_playwright.py http://127.0.0.1:8765
```

先の 59 項目の結果 JSON は `/tmp/todo076-verifier.json`。追加 2 項目は
同じスクリプトへ加え、`--additional-only` で単独実行して確認した。現在の
`archives/agents/TODO-076/verify_playwright.py` は通常実行で全 61 項目を行う。
各 `goto` は 20 秒、通常の操作は 7 秒を上限とし、区間ごとの進捗を stderr に出す。

## 開閉、フォーカス、キー操作

- 両画面とも、実際に Tab を押すと
  `toggle-voice-engine-btn` → `prev-btn` → `play-btn` → `next-btn` →
  `guide-btn` の順に移った。`focus()` で代用していない。
- Enter と Space で開き、初期フォーカスは `guide-close-btn` になった。
  Escape、閉じるボタンの click、閉じるボタン上の Space で閉じ、いずれも
  `guide-btn` へフォーカスが戻った。
- モーダル中の Tab / Shift+Tab は、閉じるボタン、dialog、BODY の間だけを移り、
  背景の操作要素へ移らなかった。BODY は headless Chromium がブラウザ UI 側へ
  フォーカスを移す境界として現れた。
- モーダル中の左右矢印、F、M で、スライド番号、再生、消音、フルスクリーンの
  状態は変わらなかった。dialog 自体をキーイベントの対象にした場合も M は
  漏れなかった。
- 通常時は操作ボタンを blur した後に、Space の再生・一時停止、左右矢印の
  前後移動、M の消音切り替え、F のフルスクリーン開始、Escape の終了を確認した。

## 再生中の開閉とタッチ操作

- desktop の進行率は、開く前 0.194% → ガイド表示中 0.555% → 閉じた後
  0.778%。touch は 0.181% → 0.556% → 0.792%。両方とも再生状態と
  スライド番号を保ったまま進行した。
- 390×844 では Playwright の touch input によるタップで再生・一時停止が
  切り替わった。
- CDP `Input.dispatchTouchEvent` で y=165.7、x=295.2→94.8 の左スワイプを
  送り、次のスライドへ進んだ。x=94.8→295.2 の右スワイプで元へ戻った。
  mouse drag は使っていない。headless Chromium 自身の履歴ジェスチャーが
  ページより先に処理しないよう、検証起動時だけ
  `OverscrollHistoryNavigation` を無効にした。
- 再生中にガイドを開き、ガイド本文への touch tap と CDP の左右スワイプ
  （y=520.0、x=293.0↔97.0）を送った。ガイドは開いたまま、再生状態は `true`、
  スライド番号は 0 のままで、背景の再生切り替えや前後送りへ漏れなかった。

## アイコンボタンのアクセシビリティ

- Playwright の `get_by_role("button", name=..., exact=True)` で、
  「前のスライド」「再生」「次のスライド」「字幕」「消音」「フルスクリーン」が
  それぞれ 1 個のボタンに一致した。
- 字幕、消音、フルスクリーンの `aria-pressed` は初期値がすべて `false`。
  各操作後に `true`、解除後に `false` へ戻ることを実測した。

## 画面内の収まりと画像確認

- desktop は document 幅 1280px、操作部の左右端は 41.0〜925.0px。
  touch は document 幅 390px、左右端は 33.0〜383.5px。横スクロールはなく、
  すべての操作が画面内に収まった。
- desktop のガイドは x=352〜928、y=16〜784px。scrollHeight 819px、
  clientHeight 766px で、末尾まで 53px スクロールできた。
- touch のガイドは x=19〜371、y=16〜828px。scrollHeight 931px、
  clientHeight 810px で、末尾まで 121px スクロールできた。
- 両画面で末尾の段落が全体表示され、スクロール後もヘッダー上端は 17px、
  閉じるボタンは y=33〜75px のままだった。
- `/tmp/todo076-{desktop-1280x800,touch-390x844}-{controls,guide-open,guide-scrolled}.png`
  の 6 枚を目視した。操作ボタンの欠け・重なり、ガイドの横あふれはなく、
  先頭と末尾の文章、閉じるボタンを読めた。

## mutation test

ブラウザへ返す `player.html` だけから `guide.open` のガードを 1 か所削除し、
dialog をキーイベントの対象にして M を押した。通常実装では消音状態が変わらず、
mutation では `aria-pressed` が `false` から `true` へ変わったため、検査が
ガードの欠落を検出することを確認した。リポジトリの `player.html` は変更していない。

## 対象外

音声の実出力とスライド内容は、分担どおり確認対象外とした。
