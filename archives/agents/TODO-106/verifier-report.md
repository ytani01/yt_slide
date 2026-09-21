# TODO-106 verifier 報告

## 1. 構文

- `node --check slides/readme.js` → exit 0
- `node --check slides/user.js` → exit 0

両方とも通った。

## 2. 描画（Playwright / Chromium headless 1280x800、file:// で player.html を開く）

`renderSlide(index)` を直接呼んで対象の枚へ移動し、スクリーンショットを撮った
（同ディレクトリに png あり）。

- readme 1 枚目: readme_1.png — はみ出し・欠け・重なりなし
- readme 4 枚目「自分のスライドを作る」: readme_4.png — 新設の AI 案内の帯を含め
  はみ出し・重なりなし
- readme 5 枚目「入っているスライド」: readme_5.png — 5 行の表、各行の再生リンクと
  README.md / docs/User.md / docs/Developer.md への本のアイコン付きリンクが
  枠内に収まっている
- readme 6 枚目「まとめ」: readme_6.png — 3 項目のカードとも文字が枠内
- user 5 枚目「AI に作ってもらう」（新規）: user_5.png — 「渡す 3 つ」の帯、
  コードブロック（5 行）、保存・確認の帯とも枠内。コードブロックの行は
  読める。チャプター一覧の番号も 05 以降がひとつずつ後ろへずれている
  （06 一覧・仕上げ・共有 … 17 まで）ことを画面右側で確認した

console error / pageerror / requestfailed は、上記 5 回の読み込みすべてで
**0 件**（CDN 由来のものも含め 0 件）。

デザインの良し悪し・レイアウトの測り直しは行っていない。

## 3. 新しく足したリンク（DOM の href で確認、クリックはしていない）

readme 5 枚目の `#slide-canvas a` を列挙した結果:

```
['readme', 'player.html?slides=readme']
['README.md', 'https://github.com/ytani01/yt_slide/blob/main/README.md']
['user', 'player.html?slides=user']
['docs/User.md', 'https://github.com/ytani01/yt_slide/blob/main/docs/User.md']
['developer', 'player.html?slides=developer']
['docs/Developer.md', 'https://github.com/ytani01/yt_slide/blob/main/docs/Developer.md']
['claude-memo', 'player.html?slides=claude-memo']
['template', 'player.html?slides=template']
```

5 つの名前すべてが `player.html?slides=<名前>` へのリンクになっている。
user / developer / readme の行にだけ、指示どおり GitHub の blob URL への
リンクが付いている（claude-memo / template には文書リンクなし。これは
指示どおりで問題ではない）。

## 4. duration（`--write` なしで実行、値は揺れるので合否は判断していない）

`ytslide measure --slides readme -n 3 1 4 5 6`:

```
スライド 1: 原文 125 字 / 読み 125 字 / 実測 3 回の中央値 22.800s / 1.4 倍速 16.29s -> duration: 16
スライド 4: 原文 133 字 / 読み 138 字 / 実測 3 回の中央値 26.688s / 1.4 倍速 19.06s -> duration: 19
スライド 5: 原文 137 字 / 読み 129 字 / 実測 3 回の中央値 28.104s / 1.4 倍速 20.07s -> duration: 20
スライド 6: 原文 136 字 / 読み 138 字 / 実測 3 回の中央値 25.128s / 1.4 倍速 17.95s -> duration: 18
```

ファイル内の値: 1 枚目 16 / 4 枚目 19 / 5 枚目 20 / 6 枚目 18。**すべて一致**。

`ytslide measure --slides user -n 3 5`:

```
スライド 5: 原文 127 字 / 読み 141 字 / 実測 3 回の中央値 26.496s / 1.4 倍速 18.93s -> duration: 19
```

ファイル内の値: 19。**一致**。

★（TTS_MAX_CHARS 超過）の警告はどちらの実行でも出なかった。

## 5. 依頼文の例と実装の食い違い

`grep -n "slidesConfig\|slideData" slides/*.js player.html` の結果、
`slidesConfig` と `slideData` は全スライドファイル（readme / template /
claude-memo / developer / user）で top-level の `const` として定義され、
`player.html` 側もその 2 つのグローバル変数を読む作りで、実装と一致。

`slides/template.js` の 1 枚目（表紙）を見ると、各要素は `title` /
`duration` / `narration` に加えて `render()` または `body` を持つ。
docs/User.md の依頼文の例・`slides/user.js` 5 枚目の依頼文に出てくる
`slidesConfig` / `slideData` / `title` / `body` / `narration` / `duration` /
`player.html` は、この実装と食い違いなし。

## 6. アンカー

- README.md 内の `docs/User.md#...` 形式のリンク（新規の
  `#2-最初の-1-枚を書いて再生する` を含む）は、すべて docs/User.md の
  見出しと対応する `#` に一致した（見出し一覧を突き合わせ済み）
- docs/User.md 内の `#...` リンクのうち、新しく足した
  `#時間表示を合わせたいとき`・`#ai-に作ってもらう` も、対応する見出し
  （`### 時間表示を合わせたいとき`、`### AI に作ってもらう`）に一致した

## 変更ファイルと指示の範囲

`git status` / `git diff --stat` で確認した変更ファイルは
README.md / docs/User.md / slides/readme.js / slides/user.js の 4 つで、
指示された範囲と一致。TODO-106 の節にある項目（冒頭の謳い文句、AI に
作ってもらう手順、5 枚目のリンク、user.js 5 枚目の新設）の内容とも
diff の中身が対応している。player.html・docs/Developer.md など、
今回変更対象外のファイルは変更されていない。

## 確かめられなかったこと・判断できないこと

- 依頼文どおりに実際に AI へ渡して `.js` が生成できるかは試していない
  （文言と実装の項目名の整合だけを確認した）
- GitHub の blob URL（`https://github.com/ytani01/yt_slide/blob/main/...`）
  は develop ブランチの内容を指しているわけではないが、これは既存の
  仕様（README.md など他のリンクも同様の書き方）であり、この項目固有の
  問題かどうかは判断していない
- duration の実測値は環境やタイミングで揺れるため、上に載せた数値を
  「合っている」と判定はしていない（指示どおり数値だけ並べた）
