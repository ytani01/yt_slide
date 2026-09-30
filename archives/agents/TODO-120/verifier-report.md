# verifier 報告（TODO-120）

スクリプト: `archives/agents/TODO-120/verify.py`（Playwright chromium ヘッドレス 1280x720、readme は slideData.length = 7）。
表示番号は `#slide-num` の textContent。

| 項目 | 実測（足した行あり） | 結果 |
|---|---|---|
| 1 `#4` で開く → `location.hash='#7'` | 04 → 07、hash `#7` | 一致 |
| 2 `#abc` / `#999` | どちらも 01、hash `#1` | 一致 |
| 3 移動後 500ms の hashchange 回数 | 1 回（表示 01、hash `#1`） | 一致（replaceState で繰り返さない） |
| 4 goto `#4` → goto `#7` | 04 → 07 | 一致 |
| 5 `uv run pytest` | 29 passed, 1 failed（exit 非 0） | 食い違い（下記） |
| 6 足した行を消す | 1: 04 のまま（hash `#7`）、2: 04 のまま、4: 04 のまま → 1・2・4 が失敗 | 一致（壊すと落ちる） |

元に戻した後の `git diff player.html` は足した 3 行（コメント 2 行＋リスナー 1 行）のみ。

## 食い違い: pytest
```
FAILED tests/test_measure.py::test_all_slides_rules_load - AssertionError: [(...
E       assert 25 == 23   (tests/test_measure.py:108 len(common_rules) == 23)
```
`git stash` で変更を全部退避した状態（HEAD）でも同じ 1 件が落ちた。TODO-120 の差分が原因ではない（実測）。
原因は未調査（推定: slides の共通 rules が 25 件に増えたがテストの 23 が古い）。実害は未確認。

## 変更ファイル
M TODO.md, docs/Developer.md, docs/UsersGuide.md, player.html、未追跡 archives/agents/TODO-120/。
指示との照合（docs の変更が範囲内か）は今回の確認項目外で、見ていない。
