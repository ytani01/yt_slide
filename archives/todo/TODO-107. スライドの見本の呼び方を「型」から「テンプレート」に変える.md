# TODO-107. スライドの見本の呼び方を「型」から「テンプレート」に変える

|        | main                 | 担当     |
|--------|----------------------|----------|
| 見込み | Opus 5 / effort high | verifier |
| 実施   | Opus 5 / effort high | verifier |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 14,086 | 85,241         | 65%       |
| verifier | Sonnet 5 | medium | 17,296 | 120,666        | 35%       |
| 合計     |          |        | 31,382 | 205,907        | 概算 $3.3 |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま Sonnet 5 /
  effort medium。決まった手順の確認なので上書きしなかった

## きっかけ

「型」が伝わりにくい。ファイル名が `slides/template.js`、URL も
`?slides=template` なので、呼び方だけ「型」なのは一段ずれていた。
「テンプレート」なら PowerPoint などで誰もが触っている語で説明が要らず、
プログラミングの type とも紛れない。

「ひな形」「見本」「作例」も挙げたが、`template.js` との対応の近さで
「テンプレート」にした。

## やったこと

見本を指している「型」を「テンプレート」に置き換えた。

| ファイル | 置き換え |
|----------|----------|
| `README.md` | 7 箇所 |
| `docs/User.md` | 15 箇所 |
| `slides/template.js` | 27 箇所 |
| `slides/readme.js` | 7 箇所 |
| `slides/user.js` | 4 箇所 |
| `index.html` | 1 箇所（`ytslide index` で再生成） |

置き換えなかったもの:

- `slides/template.js` の「同じ定型が並ぶ」（2 カラム比較の本文）
- `slides/claude-memo.js` の 3 箇所（Python の型・型検証）

「型の見本」は、そのまま置き換えると「テンプレートの見本」と重複するので
「テンプレート」だけにした。`slides/template.js` の 9 枚目（時系列）も
「この見本から型をコピーして」→「テンプレートをコピーして」と削った。
`summary` は `README.md` の一覧に合わせて「スライドのテンプレート 19 種。
コピーして使う」にした。

ナレーションが伸びた分、`ytslide measure --all --write` で `duration` を
測り直した。`template.js` が 5 枚（8→11、9→10、12→13、17→12、18→11）、
`readme.js` が 2 枚（1 枚目 16→17、3 枚目 15→16）。`user.js` は変化なし。
最後に `ytslide index` で `index.html` を作り直した。

## 確かめたこと

verifier（報告は
[archives/agents/TODO-107/verifier-report.md](../agents/TODO-107/verifier-report.md)）。

- `grep -rn "型" README.md docs/*.md slides/*.js index.html` の残りが、
  意図して残した 4 件だけであること
- `git diff` の全行を読み、見本以外の意味の「型」を置き換えていないこと、
  「テンプレートの見本」のような重複が残っていないこと
- `ytslide measure --all`（`--write` なし）の `-> duration: N` と、
  各 `.js` の `duration` が全 42 枚で完全一致すること
- `python3 -m http.server` + Playwright（Chromium、1920x1080）で 26 枚を
  撮り、文字の欠け・枠からのはみ出し・行のあふれが無いこと
  （`archives/agents/TODO-107/shot/`）

## 分担の振り返り

- **verifier が見つけたのは、依頼文側の誤り 2 つ。** 置き換えと `duration`
  には問題が無かった。依頼に書いた
  `player.html?slides=template&n=<番号>` の `n=` は `player.html` に
  実装されていない（読むのは `slides`/`deck` だけ）。verifier は最初に
  撮った 19 枚が全部同じ画像だったことに md5 で気づき、ページ内の
  `renderSlide(index)` を `page.evaluate` で直接呼ぶ方式に切り替えて
  撮り直した。もう 1 つは `user.js` の「10 枚目」で、実際に文言が変わった
  のは 5・11 枚目だった（verifier はその 2 枚も追加で撮った）。
  **確認の手段を依頼側が名指しするときは、そのパラメータが実装に
  あるかを先に確かめる。**
- **見込みと食い違ったところは無い。** 文言だけで分岐が変わらないので
  reviewer は立てず、verifier だけにした見込みどおり。料金も main 65% /
  verifier 35% で、verifier が Playwright の環境を組む分を含めても $3.3。
- **次に同じ規模（文言の一括置換＋ナレーションの測り直し）なら、同じ
  組み方でよい。** ただし依頼文に URL を書くときは、確かめる手段を
  「各スライドを個別に描画する」とだけ書き、方法は verifier に任せる。
  `n=` のような実装の当て推量を依頼に書くと、その分の撮り直しが要る。
