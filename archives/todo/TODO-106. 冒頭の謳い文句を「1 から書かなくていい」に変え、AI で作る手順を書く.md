# TODO-106. 冒頭の謳い文句を「1 から書かなくていい」に変え、AI で作る手順を書く

|        | main                 | 担当     |
|--------|----------------------|----------|
| 見込み | Opus 5 / effort high | verifier |
| 実施   | Opus 5 / effort high | verifier |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 34,919 |         68,452 | 88%        |
| verifier | Sonnet 5 | medium |  9,960 |         62,303 | 12%        |
| 合計     |          |        | 44,879 |        130,755 | 概算 $4.1  |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま。モデルも effort も
  上書きしていない

## きっかけ

「再生にはビルドもインストールも不要」という謳い文句への指摘から。再生する側の
話としては事実だが、冒頭に置くと「作る側も何も書かなくていい」と読める。実際は
`slides/<名前>.js` を書く。隠しているようで不誠実だ、という指摘だった。

売りにすべきなのは逆で、**JavaScript は要るが、一から書かなくてよい**ほう。
型の見本 19 種をコピーできること、ドキュメントと原稿を AI に渡せば書いて
もらえることは、どちらも README の下部に既に書いてあった。

作業中に 2 つ足した。

- AI に作ってもらう手順を、渡すものと依頼文の例まで書く
  （`docs/User.md` には例が 1 つあるだけ、`slides/user.js` には 1 枚も無かった）
- `slides/readme.js`「入っているスライド」の表から、各スライドと文書へリンクを貼る

## やったこと

### 冒頭の謳い文句

`README.md` の冒頭を「スライドは JavaScript ファイル 1 つ。ただし 1 から
書かなくていい」に変え、型のコピーと AI での作成を冒頭に上げた。
`slides/readme.js` も 1 枚目（narration・本文）とまとめの 2 つ目・3 つ目を揃えた。

「ビルド不要」は消していない。README の冒頭には「見る側に要るのはブラウザだけ」
として残し、「すぐ試す」「インストール」の節はそのまま。`docs/User.md`・
`docs/Developer.md`・`CLAUDE.md` の同じ記述は再生側の話として正しいので触っていない。

### AI に作ってもらう手順

`docs/User.md` の「AI に作ってもらう」を 3 段に組み直した。

- **渡すものは 3 つ** — この文書、作業場所の `slides/template.js`、元にしたい原稿
- **依頼文には次を書く** — ファイル全体を出すこと、`slidesConfig` と `slideData`、
  各枚に `title`・`body`・`narration`・`duration`、`duration` はおおよそでよいこと、
  `player.html` は編集しないこと
- **例 2 つ** — 新しく作ってもらう／できたものを直してもらう

`slides/user.js` には「書いて確かめる」の後に「AI に作ってもらう」を 1 枚足した
（5 枚目。以降の番号コメントを 1 つずつずらした）。`README.md` と
`slides/readme.js` 4 枚目にも、渡すもの 3 つを 1 行で書いて `docs/User.md` の
例へ誘導した。

### 入っているスライドからのリンク

`slides/readme.js` 5 枚目の表で、名前を `player.html?slides=<名前>` へのリンクに
した。`readme` / `user` / `developer` の行には、README.md・docs/User.md・
docs/Developer.md（GitHub の blob URL）へのリンクも付けた。

### duration

`ytslide measure -n 3 --write` で、ナレーションを変えた枚と足した枚を測り直した。

| ファイル | 枚 | 前 | 後 |
|----------|----|----|----|
| readme.js | 1 | 13 | 16 |
| readme.js | 4 | 14 | 19 |
| readme.js | 5 | 14 | 20 |
| readme.js | 6 | 13 | 18 |
| user.js   | 5 | （新規） | 19 |

`user.js` 5 枚目は最初の原稿が読み 203 字で、`★TTS_MAX_CHARS=180 字で切れる` と
警告が出た。ナレーションを 141 字まで詰めて測り直した。`readme.js` 4 枚目と
6 枚目も、1 度目が 23 秒・21 秒と長かったので文を削って測り直した。

## 確かめたこと

verifier の報告は [archives/agents/TODO-106/verifier-report.md](../agents/TODO-106/verifier-report.md)。
6 項目すべて食い違いなし。

- `node --check` は両ファイル exit 0
- Playwright の headless Chromium（1280x800、`file://`）で readme の 1・4・5・6
  枚目と user の 5 枚目を撮り、はみ出し・欠け・重なりが無いことを見た。
  console error / pageerror / requestfailed は 5 回の読み込みすべて 0 件
- 5 枚目のリンクは DOM の href で確認。5 つの名前が `player.html?slides=<名前>`、
  3 行に GitHub の blob URL
- `--write` なしの再測定で、出た秒数とファイルの値が全枚一致。★ の警告も無し
- 依頼文の例に出てくる項目名は、`player.html` と既存のスライドの書き方と一致
- README と `docs/User.md` のアンカーは見出しと対応

スクリーンショットを見て 1 点直した。文書へのリンクが説明文に詰まって見えたので
`ml-[0.6cqw]` を足した（表示位置だけ、`duration` に影響なし）。

確かめていないのは、依頼文どおりに実際に AI へ渡して `.js` が生成できるか。
文言と項目名の整合までしか見ていない。

## 分担の振り返り

- **verifier が見つけたもの: 無し。** 6 項目すべて一致した。ただし
  「見つけなかった」ことに意味があった項目でもある。`duration` の再測定と
  リンクの href は、main が自分で測った値をそのまま信じずに済んだ
- **食い違いを最初に捕まえたのは `ytslide measure` の ★ 警告**（読み 203 字で
  TTS が切れる）で、これは main が実装中に踏んだ。文章を書いた直後に測る
  流れになっていたので、verifier まで持ち越さずに済んだ
- **見込みとの差は無かった。** 立てるときに verifier だけと決め、そのとおり
  動いた。作業中に項目が 2 つ増えた（AI の手順、5 枚目のリンク）が、担当の
  構成は変えずに済んだ
- **次に同じ規模（文書とスライドの文言、数枚の `duration`）をやるなら、
  同じく main + verifier で組む。** ただし verifier への依頼で
  「`--write` なしで測り直す」を毎回書くより、`archives/agents/` に
  確認用のスクリプトを 1 本残して使い回させたほうが安い。今回は
  Playwright の起動スクリプトを verifier が書き起こしており、
  同種の項目が続くならここが繰り返し分になる
