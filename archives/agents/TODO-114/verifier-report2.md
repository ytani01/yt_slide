# TODO-114 項目4 確認（verifier、2回目）

作業は読み取りのみ。`git status`/`git diff`/`git show` 以外の git コマンド、
リポジトリ配下ファイルの書き換えは一切行っていない。

## 1. `slides/readme.js` — 7枚、番号・順序・構文とも問題なし

- `grep -n "^    // Slide" slides/readme.js` で `Slide 1`〜`Slide 7` が
  この順で 1つずつ出現（行 22, 44, 81, 118, 141, 175, 204）。欠番・重複無し。
- `node --check slides/readme.js` → `exit=0`（構文エラー無し）。

## 2. `player.html` に読み込ませての表示確認 — 問題なし（実測）

`python3 -m http.server 8917`（リポジトリ直下、読み取り専用の配信）を立て、
Playwright（`chromium.launch()`, viewport 1280×800）で
`http://127.0.0.1:8917/player.html?slides=readme#N` を開いてスクリーンショットを撮影。
撮影後、サーバープロセスは停止済み（`ps aux` で残存プロセス無しを確認）。

- **スライド 1**（`~/tmp/playwright-mcp/todo114-readme-slide1.png`）: 見出しに
  「AI に書かせて、そのまま再生できるナレーション付きスライド」、本文に
  README 冒頭と対応する説明文が表示されている。欠け・はみ出し無し。
- **スライド 2**（`~/tmp/playwright-mcp/todo114-readme-slide2.png`）: 「他に無い点」の
  5項目（AI に書かせられる／依存関係が無い／読み上げ・字幕・自動送り／
  MP4（＋.srt）に書き出せる／スライドがテキストファイル）が**すべて画面内に収まり**、
  各行の文字が枠からはみ出していないことを確認。
- **スライド 7**（`~/tmp/playwright-mcp/todo114-readme-slide7.png`）: 「まとめ」に
  差し替え後の 3項目＋「ぜひ試してみてください」の帯が表示され、欠け・はみ出し無し。

デザインの良し悪しは評価していない（映っている内容が正しいか、欠けが無いかのみ確認）。

## 3. 各スライドの `duration` — 欠けなし

```
Slide1: duration: 19
Slide2: duration: 21
Slide3: duration: 12
Slide4: duration: 16
Slide5: duration: 19
Slide6: duration: 20
Slide7: duration: 18
```
7枚すべてに数値が入っている（`grep -n "duration:" slides/readme.js` で実測）。

## 検証で使ったファイル・後片付け

- スクリーンショット 3枚: `~/tmp/playwright-mcp/todo114-readme-slide1.png`,
  `todo114-readme-slide2.png`, `todo114-readme-slide7.png`
- `/tmp/claude-649/shot.py`（Playwright 撮影スクリプト、プロジェクト外）
- 配信に使った `python3 -m http.server 8917` は確認後に停止済み
- リポジトリ配下は git status の読み取りのみで、ファイルの書き換えは無し

## 最終 `git status --short`

```
 M README.md
 M docs/User.md
 M player.html
 M slides/readme.js
?? archives/agents/TODO-114/
```
想定どおり（4ファイルすべて M、`archives/agents/TODO-114/` は新規のまま）。

## 判断が要る点

無し。項目4は問題無く確認できた。
