# TODO-125 verifier 報告

スクリプト: `archives/agents/TODO-125/measure.py`（`uv run python` で再実行可）。画像: `shot-A.png` `shot-B.png` `shot-C.png` `shot-D.png` `shot-A-notice.png`（通知の画像は未生成。重なり点の判定は数値のみ）。
実害は未確認。以下は測定値の報告のみ。

## 結果
- 8. `uv run pytest`: 35 passed、終了コード 0。
- 1. 通常表示の字幕 ON、帯の上端 >= 枠の下端: 一致。A 617.4>=605.4 / B 617.4>=605.4 / C 122.0>=110.0 / D 282.4>=270.4。
- 2. フルスクリーン + 字幕 ON（stage / banner の rect、#caption-text の font-size・text-align、wave / heading の display）:
  - A: stage t0 b1080、banner t759.6 b1036.8 l96 r1824。44px / center。wave・heading とも none。中央 960 = stage 中央 960。banner 下端は stage 下端より 43.2 上。画面内。
  - B: stage t152 b872、banner t649.7 b843.2 l64 r1216。30.72px / center。none / none。中央 640 = 640。banner 下端は stage 下端より 28.8 上。画面内。
  - C: stage t0 b390 l75.3 r768.7、banner t269.5 b374.4 l110 r734。16.65px / center。none / none。中央 422.0 = 422.0。下端は 15.6 上。画面内。
  - D: stage t312.3 b531.7、banner t543.7 b673.9（画面高さ 844）。14px / center。none / none。上端は stage 下端より 12.0 下、画面内。中央 195 = 195。
  - 参考: A と B では `#viewport-frame` の rect が高さ 0（A t0 b0、B t152 b152）。C と D は枠が stage と一致。stage の rect は期待どおりで、この点が既存の挙動かは未確認。
- 3. スクリーンショット（A〜D）: 字幕は読める、欠けなし。波形・見出し・バッジ・枠線は映っていない。A と C は帯が枠の内側下端で、スライド本文の最下行に重なる（C は本文が一部読みにくい。半透明の帯なので仕様どおりと見えるが、デザイン評価はしない）。D は枠の下の余白に収まり、スライドに重ならない。
  - 気づいた点（要件外・既存か未確認）: B の画像で、暗幕（上下の黒帯）の上側にヘッダーとチャプター一覧が透けて見え、左上の × と「字幕」ボタンがヘッダーの文字に重なっている。D でも暗幕越しに背後のコントロールが薄く見える。暗幕が半透明なのが既存の仕様かは確認していない。
- 4. `#fullscreen-caption-btn`（A）: 通常表示は display none。フルスクリーン中は display flex、文字は「字幕」、rect は x 60〜122、y 12〜52。exit ボタンは x 12〜52 で、右隣に 8px の間隔があり重ならない。aria-pressed と localStorage の一致は次のとおり。
  - 押す前: btn true / toggle true / ls 'true' / banner 表示。
  - 1 回押す: false / false / 'false' / banner hidden。
  - もう 1 回押す: true / true / 'true' / banner 表示。
- 5. C キー（A）: フルスクリーンで true->false、大文字 C で false->true。通常表示でも true->false。検索欄にフォーカス中は true のままで、検索欄に "c" が入った。Ctrl+C では true のまま。すべて期待どおり。
- 6. タップ:
  - C: 帯の中心の elementFromPoint は枠内の要素（クラス `flex flex-col items-start justify-center h-full ...`、`#viewport-frame` 内、帯の外）。touchscreen.tap 後は is-fullscreen が True のまま、`#tap-feedback-icon` に is-shown が付いた。
  - D: elementFromPoint は `caption-text`（帯の内側）。タップ後も is-fullscreen は True のまま。tap-icon は is-shown なし（帯は pointer-events auto なので再生切り替えは起きない。要件どおり）。
- 7. 再生失敗の通知（A）: 通知 t1020 b1080 l0 r1920、帯 t759.6 b1036.8。重なり点 (960, 1028.4) の elementFromPoint は `audio-error-notice`（通知側。帯の中ではない）。

## 変更ファイル
`git status`: M README.md, M TODO.md, M docs/Developer.md, M player.html、?? archives/agents/TODO-125/（reviewer-report.md と今回の成果物）。README.md、docs/Developer.md、TODO.md の中身は今回確認していない（依頼は player.html の実測のみ）。

## 確かめなかったこと
- 実ブラウザのフルスクリーン API（headless では擬似フルスクリーン側の CSS のみ。requestFullscreen の成否は見ていない）。
- 音声再生中の字幕テキストの更新。
