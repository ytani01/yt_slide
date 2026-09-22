# TODO-115. `index.html` の `README.md` 埋め込みをやめる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort low | main + verifier |
| 実施 | Opus 5 / effort low | main + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | low | 3,155 | 16,018 | 74% |
| verifier | Sonnet 5 | medium | 5,315 | 30,776 | 26% |
| 合計 |  |  | 8,470 | 46,794 | 概算 $0.8 |

- verifier は定義（`~/.claude/agents/verifier.md`）のモデルが sonnet、
  effort が medium。どちらも上書きしていない

## きっかけ

TODO-093 で `index.html` に `README.md` を fetch して marked.js で
表示するようにしていた。しかし `README.md` の中の `docs/User.md` などへの
相対リンクが `index.html` から見た位置では解決されず、リンクを踏んでも
飛べない。埋め込みをやめ、スライド一覧だけのページに戻した。

## やったこと

- `index.html` から README 表示を削った（39 行）
  - marked.js の `<script>`
  - `#readme-body` のスタイル 20 行
  - `<details id="readme">` のブロック
  - `fetch('README.md')` のスクリプト
- `docs/User.md` の「`README.md` は置かないが、自分で同じ場所に置けば
  一覧ページに表示される」を削った

`src/ytslide/index.py` が書き換えるのは `BEGIN/END GENERATED SLIDES` の
中だけなので、生成側には手を入れていない。

## 確かめたこと

verifier（Sonnet 5）が実測で確認した。報告は
`archives/agents/TODO-115/verifier-report.md`。

- `rg -i 'readme|marked' index.html` のヒットは一覧項目の
  `player.html?slides=readme` の 2 行だけ
- `python3 -m http.server` で配信し、Playwright（chromium, headless）で
  `index.html` を開いて、見出し `yt_slide`・`<li>` 5 件・
  `player.html?slides=user` を踏んでプレイヤーが開くことを確認。
  console error と pageerror は無し（Tailwind CDN の warning 2 件のみ）
- `pytest tests/test_index.py` は 6 passed

## 残ること

`pytest` 全体では `tests/test_measure.py::test_all_slides_rules_load` が
落ちる（`common_rules` が 23 でなく 25）。`git stash` でこの変更を外しても
同じ失敗が再現するため、この項目とは無関係の既存の失敗。原因は未調査。

## 分担の振り返り

- verifier は、依頼した 4 点をすべて実測で確かめ、`pytest` 全体の既存の
  失敗を `git stash` で切り分けて「この変更とは無関係」まで示した。
  main が見落としていた既存の失敗を拾ったのはこの担当の成果
- 見込みと食い違いは無し。削除だけの項目なので main が実装し、
  表示の確認だけ分けた形がそのまま通った
- 次に同じ規模（既存機能の削除、ファイル 2 つ）なら同じ組み方でよい。
  ただし verifier の料金が全体の 26% で、うち大半は Playwright を
  立ち上げる分。依頼文で「`python3 -m http.server` + Playwright」と
  手段を名指ししたので計測の組み立てで迷いは出ていない。この指定は続ける
