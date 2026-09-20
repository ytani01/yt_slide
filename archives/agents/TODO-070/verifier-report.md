# TODO-070 verifier 報告

## 1. リンク先 30 件の `<title>`（実測）

`curl` の代わりに Python の `urllib` で、1 件ごとに 1 秒間隔を空けて取得した
（`curl` を `while read` ループの中で使う方式は、バックグラウンドで実行したところ
プロセスが応答なく固着し、10 分以上 `results.tsv` に 1 行も書き込まれなかった。
原因は切り分けていない。プロセスを強制終了し、`urllib.request` を使う
フォアグラウンドのスクリプトに切り替えて取り直した）。

`Icon Not Found` を含むものは **0 件**。30 件すべてでアイコン名が
`<title>` に入っている。

| クラス名 | 取れた `<title>` |
|---|---|
| fa-list-check | List Check Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-list-ol | List Ol Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-table-list | Table List Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-triangle-exclamation | Triangle Exclamation Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-circle-exclamation | Circle Exclamation Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-ban | Ban Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-circle-info | Circle Info Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-flag-checkered | Flag Checkered Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-arrow-right | Arrow Right Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-circle-check | Circle Check Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-code | Code Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-terminal | Terminal Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-file-code | File Code Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-folder-open | Folder Open Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-file-lines | File Lines Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-book | Book Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-clock | Clock Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-stopwatch | Stopwatch Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-gauge-high | Gauge High Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-chart-simple | Chart Simple Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-users | Users Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-comments | Comments Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-robot | Robot Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-diagram-project | Diagram Project Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-table | Table Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-gear | Gear Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-sliders | Sliders Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-lightbulb | Lightbulb Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-star | Star Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |
| fa-wand-magic-sparkles | Wand Magic Sparkles Filled Icon (Classic Solid) — Free SVG Download \| Font Awesome |

## 2. URL の組み立て

`docs/User.md` の 278〜286 行（付録の表）から `[`fa-xxx`](url)` の
30 組をすべて機械的に抽出し、`https://fontawesome.com/icons/` + `xxx`
（`fa-` を除いた部分）+ `?s=solid` と一致するかを Python で照合した。

**30 件すべて一致**（`fa-` の付け外し忘れ、名前の食い違いは無し）。

## 3. `slides/user.js` の `ICON_GROUPS` との突き合わせ

`slides/user.js` 17〜26 行の `ICON_GROUPS`（9 グループ・30 件）と
`docs/User.md` 278〜286 行の表を突き合わせた。

- **用途名（グループ名）**: 9 件とも完全一致（順序も一致）。
  箇条書き・一覧 / 注意・禁止 / 手順・進行 / コード・端末 /
  ファイル・文書 / 時間・計測 / 人・対話 / 図解・設定 / 強調・ひらめき
- **クラス名**: 各グループ内の並び順・件数も完全一致（30 件）。
- リンクになっていないクラス名（正規表現の取りこぼし）は無い。

## 4. Markdown としての壊れ

- 表の各行（278〜286 行、ヘッダ行含む計 10 行）はすべて `|` が 3 個
  （先頭・区切り・末尾）で、2 列構成が崩れていない。
- 各行のバッククォート数は偶数（1 項目につき 2 個、3 項目なら 6 個、
  4 項目なら 8 個）で、実測もその通り。開き・閉じの対応が崩れている行は無い。
- `[`fa-xxx`](url)` の形（コードスパンをリンクテキストに入れる書き方）は
  Markdown として正しい入れ子で、9 行 30 件とも同じ形で統一されている。

## 確かめられなかったこと・判断できないこと

- `curl` の while ループがバックグラウンドで固着した原因は切り分けていない
  （ネットワークかシェルのクォート展開かは不明）。今回は別の手段
  （`urllib.request` によるフォアグラウンド実行）で目的は達成できたが、
  この現象自体の原因究明はしていない。実害は本タスクには無かったと考えるが、
  他の場面で同じ固着が起きるかどうかは判断できない。
- FontAwesome 側のページ内容が将来変わる可能性（アイコンの改名・削除）は
  今回の実測時点のものであり、恒久的な保証ではない。
