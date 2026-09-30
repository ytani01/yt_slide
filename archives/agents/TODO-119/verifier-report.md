# TODO-119 verifier report

スクリプト: `archives/agents/TODO-119/verify.py`（実行 2 回目が最終。終了コード 0、コンソール／pageerror は 0 件）。
表記は `{fs: fullscreenElement の有無, ps: #viewport-stage.is-fullscreen の有無}`。

## 結果（(a) 844x390 mobile / (b) 1280x800 PC とも同じ値）

1. ボタンで入る {fs:true, ps:true}、もう一度で {false,false}: 一致
2. F で入る {true,true}、F で抜ける {false,false}: 一致
3. 本物が入っている状態 {true,true} で `document.exitFullscreen()` → {false,false}: 一致
4. ボタンを待ち無しで 2 回（1 回目は実クリック、2 回目は直後に `.click()`）、500ms 後 {false,false}: 一致
5. `repeat:true` の keydown（body へ dispatch）。OFF のとき {false,false}、ON のとき {true,true} のまま: 変化なし、一致
6. `Element.prototype.requestFullscreen = undefined` 後、ボタンで {fs:false, ps:true}（擬似のみ）、もう一度で {false,false}。コンソールエラー 0 件: 一致
7. (a) フルスクリーン中の `#viewport-stage` rect: left 75.33, top 0, right 768.66, bottom 390, w 693.33, h 390（innerWidth 844, innerHeight 390）。はみ出し無し（16:9、左右に約 75px の余白）: 一致
8. `apple-mobile-web-app-capable=yes`、`apple-mobile-web-app-status-bar-style=black` が head にある: 一致

## スクリーンショット `fs-mobile.png`（844x390）
スライド 1 枚目が高さいっぱいに映り、左右 75px の余白の外側にプレイヤー UI（ロゴ、チャプター一覧、音量）が暗く透けて見える。スライド内は欠けていない（タイトル・本文・SLIDE 01 / 7 が表示）。余白の透けが意図どおりかは判断できない（既存の CSS の仕様かもしれない。実害は未確認）。字幕バナーは映っていない（この時点で字幕が無いだけかは未確認）。

## 測定方法についての注記
- フルスクリーン中は `#viewport-stage` がボタンを覆い、Playwright の `click()` が「intercepts pointer events」で 30 秒タイムアウトする（1 回目の実行で発生）。そのため「抜ける」側のボタン操作は `element.click()` を evaluate で呼んだ。実ユーザーが画面上でボタンを押せるかは別問題で、今回は見ていない（実害は未確認）。
- 5 で最初に document へ dispatch したところ `e.target.closest is not a function` の pageerror が出た。target が document のため（テスト側の送り方の問題）。body へ dispatch し直すと出なかった。

## 変更ファイル（`git status`）
M README.md, TODO.md, docs/Developer.md, player.html、?? archives/agents/TODO-119/。指示にないファイルの変更は確認していない（指示に変更範囲の記載が無かったため、範囲との照合はしていない）。

## 未確認
- 実機の iPhone（ホーム画面から起動したときの UI 非表示）
- 実際のブラウザでの Esc・戻るジェスチャーで抜ける操作（3 は `exitFullscreen()` で代用）
