# TODO-082 verifier 報告

検証環境: `python3 -m http.server 8791`（リポジトリ直下）＋ Playwright（Chromium、npx で取得。
グローバル npm の `playwright@1.63.0` を `NODE_PATH` 経由で使用）。
スクリプトは `/tmp/.../scratchpad/` に置いた一時ファイルで、確認後に破棄した。

## 1. player.html?slides=template の全 15 枚（console/page エラー、title 順）

デスクトップ 1280×720、モバイル 390×844（`isMobile:true, hasTouch:true`）の両方で、
`renderSlide(i, true)` を 0〜14 で呼び、各回で `console`/`pageerror` を収集した。

- console エラー・page エラー：**両ビューポートとも 0 件**
- `control-title-preview` の実測順（両ビューポートで同一）：
  `1. 表紙 / 2. 箇条書き / 3. 2 カラム比較 / 4. 表 / 5. コードと端末画面 /
  6. 図解 / 7. 数字を大きく見せる / 8. 引用 / 9. 時系列 / 10. カード 3 枚 /
  11. 前後の差分 / 12. 割合バー / 13. Q&A / 14. 本文と脚注 / 15. 章の区切り`
  → 指示どおりの順と一致

## 2. 見た目・はみ出し（scrollHeight / clientHeight 実測）

`#slide-canvas`（16:9 の枠の中身）の `scrollHeight` と `clientHeight` を
15 枚・2 ビューポートすべてで比較。

- デスクトップ：`canvasScrollHeight = canvasClientHeight = 428`（全 15 枚、差分 0px）
- モバイル：`canvasScrollHeight = canvasClientHeight = 456`（全 15 枚、差分 0px）
- → **枠からのはみ出しは無い**

参考として、枠の中の全要素を走査し `scrollHeight - clientHeight` が最大の
要素も拾った（枠自体でなく内部要素の内輪の食い違いを探す目的）。以下の要素で
差分が出たが、いずれも背景のぼかし円や装飾アイコンなど絶対配置の飾りで、
スクリーンショット上は視覚的な破綻が無いことを確認した（実害は未確認、
数値だけでは判断できない範囲）。
  - 「表紙」`div.relative.h-full`：diff 174〜182px（背景のグラデーション円、
    意図的に枠外へはみ出す装飾）
  - 「数字を大きく見せる」の数字の `div`：diff 11px（大きいフォントの行送りの
    丸め差と見られる）
  - 「引用」の吹き出し `div`：diff 19〜20px（背景の大きな引用符アイコン）
  - 「章の区切り」の `h1`：diff 4px（大きいフォントの丸め差と見られる）

新しく足した 6 枚（表紙・カード 3 枚・前後の差分・割合バー・Q&A・本文と脚注）と、
作り込みを増やした既存分について、両ビューポートの 15 枚全てのスクリーンショットを
`~/tmp/playwright-mcp/todo082/template-<ビューポート>-<01〜15>.png` に保存し、
目視でも重なり・欠けが無いことを確認した。

## 3. index.html → player.html?slides=template

- `index.html` の `<a>` の `href` 一覧（実測）：
  `["player.html?slides=readme","player.html?slides=user","player.html?slides=template","player.html?slides=developer","player.html?slides=claude-memo"]`
  → 既存 4 項目が残り、`template` が足されている
- `template` のリンクをクリック → `player.html?slides=template` に遷移し、
  `#total-slides` が `15` であることを確認

## 4. slides=user の 9 枚目、左のカード

- 実測した属性：
  `href="https://github.com/ytani01/yt_slide/blob/main/slides/template.js"`,
  `target="_blank"`, `rel="noopener"`, `onclick="event.stopPropagation()"`
  → 指示どおり
- 右のカード（`docs/User.md`）は `href`/`target`/`rel` とも変わっていないことを確認
- クリック前後で `#slide-num`（"09"）と `#play-icon` の class
  （`"fa-solid fa-play ml-0.5"`＝一時停止のまま）が**変化しないこと**を確認
- クリックで新しいタブが `https://github.com/ytani01/yt_slide/blob/main/slides/template.js`
  として開くことも確認（伝播は止まり、遷移だけ起きている）

## 5. 型を 1 枚削っても他が動くこと

`slides/template.js` を一時コピーし、`// ── 12. 割合バー ──` から
`// ── 13. Q&A ──` の直前までを削った版を `slides/template-14test.js` として
一時的に置き、`player.html?slides=template-14test` を確認した。

- `#total-slides` = `14`
- `slideData.map(s => s.title)` の実測順：
  `["表紙","箇条書き","2 カラム比較","表","コードと端末画面","図解","数字を大きく見せる","引用","時系列","カード 3 枚","前後の差分","Q&A","本文と脚注","章の区切り"]`
  → 割合バーが抜け、Q&A が繰り上がって 12 番目
- console/page エラー：0 件
- 確認後、`slides/template-14test.js` は削除済み（`ls slides/` で残っていないことを確認）

## 6. docs の記述と実物の一致

- `docs/User.md` の型の説明：「表紙、箇条書き、2 カラム比較、表、コードと端末画面、
  図解、数字を大きく見せる、引用、時系列、カード 3 枚、前後の差分、割合バー、
  Q&A、本文と脚注、章の区切りの 15 種類」→ 実測順と完全一致
- 「render() で書いてある」のは「表紙」と「章の区切り」の 2 つと明記 →
  `grep -n "render: function" slides/template.js` で実際に一致するのはこの 2 か所
  （21 行目付近と 412 行目付近）だけであることを確認。他に `render: function()`
  という**文字列**が出る 305 行目は「前後の差分」スライドの本文中の説明テキストで、
  実際の `render` 定義ではない（誤検出の混同は無い）
- README.md・Developer.md の表もそれぞれ `template` の 1 行・`slides/<名前>.js` の
  一覧に `template` が足されており、内容と齟齬は無い

## 7. tools/test_measure_duration.py

```
$ python3 tools/test_measure_duration.py
OK
```
終了コード: 0

## 8. git status / diff の範囲

```
$ git status --porcelain
 M README.md
 M TODO.md
 M docs/Developer.md
 M docs/User.md
 M index.html
 M slides/template.js
 M slides/user.js
```
指示にある 7 ファイルとちょうど一致。それ以外のファイルは変更されていない。

## 確かめられなかったこと・判断できないこと

- `duration` の実測値そのもの（`tools/measure-duration.py --slides template --all --write`
  で書き戻された秒数が実際のナレーション音声の長さと合っているか）は、
  実際に読み上げ音声を再生して計測していない。この項目のテスト
  （`test_measure_duration.py`）は通っているが、**個々の `duration` の妥当性は
  未確認**
- 2. の内部要素の diff（174px・19px・11px・4px）について、装飾要素の意図的な
  はみ出しと判断したが、これはスクリーンショットの目視に基づく判断であり、
  「意図どおりのデザインかどうか」自体の良し悪しは評価対象外とされているため
  評価していない

## 補足: 検証中の再修正への追認

検証の後半、`slides/template.js` が検証中に更新された（mtime 19:55:43、
`時系列` スライドの中身に軽微な追記）。`git status`/`git diff` の対象範囲は
7 ファイルのまま変わらず。念のため更新後の内容で 1・2・7・8 を再実行した。

- 全 15 枚の `title` 順、console/page エラー 0 件、`#slide-canvas` の
  `scrollHeight = clientHeight`（デスクトップ・モバイルとも）を再確認 →
  結果は変わらず（全て一致）
- `時系列` スライド（変更のあった箇所）のスクリーンショットを両ビューポートで
  撮り直し、崩れが無いことを確認
- `python3 tools/test_measure_duration.py` → `OK`（終了コード 0）
- `git status --porcelain` → 変更ファイルは 7 つのまま（README.md / TODO.md /
  docs/Developer.md / docs/User.md / index.html / slides/template.js /
  slides/user.js）。他に増えていたのは自分が書いたこの報告用の
  `archives/agents/TODO-082/`（未追跡）のみ

## 追加確認: 引用スライド（8 枚目）の出典リンク化

検証中に入った変更（出典の行を `<a>` にしたもの）を、1280×720 と 390×844 の
両方で Playwright 実測した。

- `href` / `target` / `rel` / `onclick`（実測、両ビューポートで同一）：
  `href="https://github.com/ytani01/yt_slide/blob/main/docs/User.md"`,
  `target="_blank"`, `rel="noopener"`, `onclick="event.stopPropagation()"`
  → 指示どおり
- リンクをクリックした前後の `#slide-num` と `#play-icon` の class
  （両ビューポートとも `"08"` と `"fa-solid fa-play ml-0.5"` のまま）：
  **変化なし**。クリックで別タブが開くことも確認済み
- 枠（`#slide-canvas`）の `scrollHeight` / `clientHeight`：
  デスクトップ 428/428、モバイル 456/456 → 差分 0px、はみ出し無し
- console / page エラー：両ビューポートとも **0 件**
- スクリーンショット（`~/tmp/playwright-mcp/todo082-slide8/slide8-desktop-1280x720.png`,
  `slide8-mobile-390x844.png`）を目視。出典の行は枠内に収まり、下線付きの
  リンクとして表示され、背景の薄い引用符（右下）と重ならず読めることを確認

他の 14 枚の測り直しは行っていない（指示どおり）。

## 追加確認: 「画像」型の追加（15 → 17 種）

`slides/template.js` に 15 枚目「画像」・16 枚目「画像（全面）」を足し、
元の 15 枚目「章の区切り」が 17 枚目に繰り下がった件を Playwright で実測した
（1280×720・390×844 の両方）。

- 全 17 枚の `title` 順（実測、両ビューポートで同一）：
  `表紙 / 箇条書き / 2 カラム比較 / 表 / コードと端末画面 / 図解 /
  数字を大きく見せる / 引用 / 時系列 / カード 3 枚 / 前後の差分 / 割合バー /
  Q&A / 本文と脚注 / 画像 / 画像（全面） / 章の区切り` → 指示どおり一致
- console / page エラー：両ビューポートとも **0 件**
- 404（ステータス 400 以上のレスポンス）：両ビューポートとも **0 件**
- 15・16 枚目の `<img>` の実測（両ビューポートで同一）：
  - `images/spheres.jpg`：`naturalWidth=1280`, `naturalHeight=720`, `complete=true`
  - `images/nebula.jpg`：`naturalWidth=1280`, `naturalHeight=720`, `complete=true`
  → どちらも 0 でなく、読み込み完了。404 も無いので正しく表示されている
- 枠（`#slide-canvas`）の `scrollHeight` / `clientHeight`：**17 枚全て差分 0px**
  （はみ出し無し、他の 15 枚の測り直しはしていない）
- スクリーンショット（目視）：
  `~/tmp/playwright-mcp/todo082-images/template17-<ビューポート>-15.png`,
  `template17-<ビューポート>-16.png`
  - 15 枚目「画像」：`spheres.jpg` が枠内に収まって表示され、抜けや真っ黒は無い
  - 16 枚目「画像（全面）」：`nebula.jpg` が枠いっぱいに敷かれ、下側の暗い膜の
    上に「全面に敷く」の文字が画像に埋もれずくっきり読める
- 枚数の記述：`slidesConfig.heading`＝`'スライドの型 17 種'`、表紙の見出し
  `スライドの型 17 種`、7 枚目（数字を大きく見せる）の値が `17`、13 枚目
  （Q&A）の本文が `用意された 17 種で足りないときは？` と、すべて `17` に
  なっていることをソースで確認。`grep -n "15 種\|15枚\|15 枚"` は 0 件で、
  `15` の記述は残っていない
- `render()` を使っているのは実際に「表紙」「画像（全面）」「章の区切り」の
  3 つだけであることをソースで確認
  （`grep -n "render: function" slides/template.js` の実測が 24・442・466 行目
  の 3 か所。308 行目は「前後の差分」スライドの本文中の説明テキストで実際の
  定義ではない）。`docs/User.md` の「3 つは…render() で書いてある」の記述と一致
- `docs/User.md` の「画像を入れる」節の記述（`images/` に置き、
  `player.html` から見た相対パスで書く）は、実際に
  `<img src="images/spheres.jpg">` / `<img src="images/nebula.jpg">` が
  そのパスのまま表示されていることで再現・確認できた
- README.md・docs/Developer.md の該当箇所（`images/` の行、`template` の
  行・17 種の記述）も実物と一致

```
$ python3 tools/test_measure_duration.py
OK
```
終了コード: 0

```
$ git status --porcelain
 M README.md
 M TODO.md
 M docs/Developer.md
 M docs/User.md
 M index.html
 M slides/template.js
 M slides/user.js
?? archives/agents/TODO-082/
?? images/
```
増えたのは `images/`（`spheres.jpg`・`nebula.jpg` の 2 ファイル）と、自分が
書いたこの報告用の `archives/agents/TODO-082/` のみ。指示どおり。

他の 15 枚の測り直しは行っていない（指示どおり）。
