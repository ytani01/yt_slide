# TODO-063 verifier report

## やったこと

- リポジトリのルートで `python3 -m http.server 8791` を立て、HTTP で配信した
  （終了時に停止済み）。
- Playwright（chromium）で `player.html?slides=template` を 1920x1080 で開き、
  `renderSlide(i, true)` で 9 枚を順に表示して測定・撮影した。
  `archives/agents/TODO-062/shot.py` の FIT（キャンバスだけを切り出す撮り方）
  は使わず、プレイヤー全体を映すシンプルな方式で撮り直した。理由は、
  9 枚を連続測定するのに `page.evaluate` で `renderSlide` を直接呼ぶ方が
  速く、かつプレイヤー全体の見た目（見出し・目次との整合）も一度に
  確認できるため。スクリプトは `archives/agents/TODO-063/measure.py` に
  残した。生の測定値は `archives/agents/TODO-063/results.json`。
  撮った PNG は `archives/agents/TODO-063/shots/slide-1.png` 〜
  `slide-9.png`。

## 測定結果（JS で実測）

`#slide-canvas` の `scrollHeight`/`clientHeight`、`scrollWidth`/`clientWidth`
は全 9 枚で一致（差分 0）。本文要素の `getBoundingClientRect()` の外接矩形
（`contentBounds`）は、全 9 枚で canvas の矩形（`canvasRect`）の内側に収まっていた
（右端・下端とも `canvasRect` を超えない）。

| # | title | overflowV (scrollH-clientH) | overflowH (scrollW-clientW) | 本文が canvas 内か | h2 | icon |
|---|---|---|---|---|---|---|
| 1 | 箇条書き | 0 | 0 | 内側 | あり | あり |
| 2 | 2 カラム比較 | 0 | 0 | 内側 | あり | あり |
| 3 | 表 | 0 | 0 | 内側 | あり | あり |
| 4 | コードと端末画面 | 0 | 0 | 内側 | あり | あり |
| 5 | 図解 | 0 | 0 | 内側 | あり | あり |
| 6 | 数字を大きく見せる | 0 | 0 | 内側 | あり | あり |
| 7 | 引用 | 0 | 0 | 内側 | あり | あり |
| 8 | 時系列 | 0 | 0 | 内側 | あり | あり |
| 9 | 章の区切り | 0 | 0 | 内側 | **無し（正しい）** | 無し |

- ブラウザのコンソールエラー: **0 件**（`console` の `error` イベントも
  `pageerror` も発生しなかった）。
- 9 枚目「章の区切り」だけ `h2` が無いのは指示どおりの想定と一致。
- 生の数値は `archives/agents/TODO-063/results.json` を参照。

PNG も目視で確認した（slide-1, slide-3, slide-5, slide-9 を中心に）。
見出しのアイコン・文字が欠けたり重なったりしていない。表（3枚目）は
行数どおりに収まり、図解（5枚目）は矢印と 3 つの箱が横並びで表示されて
いる。章の区切り（9枚目）は見出し枠が無く、大きな文字だけが中央に
表示されている。

**問題なし: 1〜8 枚目、9 枚目。食い違いは無かった。**

## 付随の検証

- `tools/test_measure_duration.py` → `OK`（終了コード 0）
- `tools/test_make_video.py` → `OK`（終了コード 0）

## 変更ファイルの確認

`git status` / `git diff` で見た変更:

- `slides/template.js`（新規スライド 9 枚の追加。指示の対象と一致）
- `docs/User.md`（「`body` だけで書く」節の末尾に 5 行追加。指示の対象と一致）
- `archives/agents/TODO-063/`（この確認作業で生成。指示の対象外だが
  作業指示どおりの成果物）

`player.html` に差分は無いことを確認した（指示どおり今回変更していない）。
指示に無いファイルの変更は見当たらなかった。

## 確かめられなかったこと・判断できないこと

- 既存 4 本（readme / user / developer / claude-memo）の見た目は指示により
  確認対象外としたため見ていない。
- 撮影は 1920x1080 の 1 サイズのみ。それ以外の画面サイズ（縮小時など）での
  崩れは確認していない（指示に無いため）。
- 文言・ナレーションの日本語としての自然さは見ていない（指示の確認範囲外
  と判断した。判断が要るならその旨管理者に確認されたい）。
