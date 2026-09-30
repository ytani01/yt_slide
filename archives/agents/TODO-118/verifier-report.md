# TODO-118 verifier 報告

実行: `uv run --extra video python archives/agents/TODO-118/verify.py`（file:// 、chromium、1280x800、--mute-audio、終了コード 0）。
スライド番号は `currentIndex`（0 始まり）、再生は `isPlaying`、擬似フルスクリーンは `#player-viewport.pseudo-fullscreen`。各項目の前に index=2・停止・フォーカス解除に戻している。

| # | 期待 | 測った値 | 合否 |
|---|------|----------|------|
| 1 | body で → : 2→3 | i=3 | 合 |
| 2 | a で → : 3、Space : 再生 True、タブ増えない | → 後 i=3、Space 後 p=True、タブ 1→1、URL は player.html#4 のまま | 合 |
| 3 | button で → | i=3 | 合 |
| 3 | button で Home | i=0 | 合 |
| 3 | button で F（二重に動かない） | fs=True、fullscreen-btn の click は 1 回 | 合 |
| 3 | button で M | isMuted=True | 合 |
| 4 | button で Space : 1 回押される、二重に動かない | play-btn の click 1 回、p=True（1 回の切り替え） | 合 |
| 5 | select で → : 進まない | i=2 | 合 |
| 5 | 検索欄で → : 進まない | i=2 | 合 |
| 6 | Ctrl+→ : 進まない | i=2 | 合 |
| 6 | Alt+→ : 進まない | i=2 | 合 |
| 6 | Shift+F : 擬似フルスクリーンに入る | fs=True | 合 |
| 7 | ガイドを開いて → : 進まない | i=2、guide.open=True | 合 |
| 8 | 545 行の文が結果と矛盾しない | 下記 | 矛盾なし |

## 8 について
文: 「矢印・Home・End・F・M は、選択欄やチャプター一覧の検索欄を操作していないときに使えます。Space は、ボタンの上ではそのボタンを押す操作になります。」
1〜7 の結果と矛盾しない。文に書かれていないこと（事実のみ）: Ctrl・Alt・Meta 付きは効かないこと、リンク上の Space は再生切り替えになること。

## 確かめていないこと
- textarea・contenteditable（ページ内に該当する要素が無く、同じ closest 分岐。未実測）
- 実際の `target="_blank"` リンク（ページには `index.html` へのリンクのみ。それで代用）
- Meta 付きキー、http:// での実行

## 変更ファイル
`git status`: `M TODO.md`、`M player.html`、`?? archives/agents/TODO-118/`。本確認ではコードを変更していない。追加は verify.py と本報告のみ。

判断が要る点: 食い違いは無し。実害は未確認（上の未確認項目のみ）。
