# TODO-099 実装後レビュー

対象: `git diff README.md docs/User.md slides/user.js`

## 指摘

### 1. README.md と docs/User.md の「最小の例」でコードフェンスの言語指定が違う

- **重大度**: 好みの範囲
- **場所**: `README.md:94`（` ```javascript `）/ `docs/User.md:489`（` ```js `）
- **問題**: 中身（`slidesConfig`・`slideData`）は 1 文字も違わず一致しているが、
  コードブロックの言語タグだけ `javascript` と `js` で異なる。
- **根拠**: `diff` で本文一致を確認済み（差分はフェンスの1行のみ）。
  main が引き継ぎ時に「README の最小例を docs/User.md の『最小の例』と同一にした」
  と記録しているが、フェンスのタグまでは揃っていない。

### 2. README のサブコマンド表に「measure・index を単独で使える」旨の明記が無い

- **重大度**: 検討
- **場所**: `README.md:46-56`
- **問題**: TODO-099 のチェック項目は「サブコマンド表には使う場面を添え、
  `measure`・`index` を単独で使えることと `update` との関係を示す」としている。
  表の各行は使う場面を書いており（要件前半は満たす）、`update` が
  `measure --all --write` と `index` を続けて実行することも書いてあるが、
  「`measure`・`index` を単独でも使える」という明記は表にも本文にも無い。
  同じ内容は `docs/User.md:106-108`（「測定だけなら…単独で使える」）には明記されている。
- **根拠**: `TODO.md` の TODO-099 節、該当チェック項目の文言。
- **未確認**: この記述を README のどこに置くべきかの判断（表に足す／本文に足す／
  docs 側で足りるとする）は境界線上のため、判断していない。

### 3. `template.js` の「19 枚」の表現がやや紛らわしい

- **重大度**: 低
- **場所**: `docs/User.md:28`
- **問題**: 「`template.js` は型の見本 19 枚で、最初の一覧にはこの見本が載る。」
  という文は、字面だけ見ると「最初の一覧に 19 件並ぶ」と読める余地がある。
  実際には `index.html` の一覧に載るのは `template`（1 ファイル）が 1 件だけで、
  19 種類はその `template.js` を開いたときにスライドとして並ぶ数である。
- **根拠**: `src/ytslide/index.py` の `slide_names()`／`build_list_html()` は
  `slides/*.js` のファイル単位で `<li>` を 1 つ作る。`init` 直後は
  `slides/template.js` の 1 ファイルのみのため、`index.html` に出るのは
  1 件（`template`）。19 種類は `slides/template.js` 内の `// ── N. 名前 ──`
  区切りの数（実測: `grep -c` で 19）。
- **見直し案**: 「最初の一覧には `template` が 1 件載る（開くと 19 種類が並ぶ）」
  のように、一覧の件数と型の種類数を分けて書く。実害（読み違えて操作に迷う）は未確認。

## 一致した点（問題なし）

- TODO-099 のチェック項目 1〜10・12 は、`TODO.md` の文言どおり差分に反映されている
  （手順の並び、`sample` への統一、`?slides=sample` の具体化、一覧・時間表示・HTTP の
  任意手順化、公開の一般化、clone 分岐の維持、重複節の統合、3 枚目のフォントサイズ
  下限維持など）。
- 3 ファイル間のコマンド・ファイル名・用語（`~/my-slides`、`slides/sample.js`、
  `ytslide init`／`index`／`update --slides sample`／`web`／`video --slides sample`、
  「スライド一式」表記）は食い違いなし。
- `README.md`・`docs/User.md`・`docs/Developer.md` 内のローカル Markdown リンクは、
  `pandoc` で見出しから実際のアンカー ID を生成し全件照合した。リンク切れ・
  アンカー不一致は無い（`#body-で書く標準` のように全角括弧を含む見出しも
  一致することを確認済み）。
- 現行コード（`cli.py`・`index.py`・`measure.py`・`paths.py`・`player.html`）との
  食い違いは見つからなかった。`--root` の対象コマンド、`summary`/`icon` 省略時の
  既定値・警告、`init`/`web` に `--root` が無いこと、`?slides=` 省略時の既定
  （`readme`）とエラーメッセージ文言、`TTS_MAX_CHARS=180`、`slides/<名前>.js` の
  ファイル名検証（`\w` と `-`）は、すべて記述どおりだった。
- `slides/user.js` は `node --check` に成功し、16 枚すべての `narration` が
  180 字以内（実測、最大 118 字）。総枚数の表示（`SLIDE 01 / 16`）と
  実際の枚数（16）も一致。「準備する」「書いて確かめる」「一覧・仕上げ・共有」の
  3 枚は本文 `font-size: clamp(0.9rem, 1.9cqw, 1.4rem)` で、指示の下限どおり
  （それより小さくしていない）。
- 既存の説明が取りこぼしで消えている箇所は見つからなかった。`git diff` の
  削除行はいずれも、統合先（`手順` 節・任意手順の各節）に同等以上の内容で
  書き直されている。
- 初めての利用者が到達できるかの観点: インストール → `mkdir`/`cd` →
  `ytslide init` → `slides/sample.js` を手で作成 → `player.html?slides=sample` を
  開く、という手順で「自分の内容を 1 枚表示し、読み上げを確認する」まで
  補わずに到達できる（各ステップの前提はその前のステップで満たされている）。

## やらなかったこと（依頼どおり）

- ブラウザでの表示確認、レイアウト・フォントサイズの実測、TTS の測定、
  インストールの再現は行っていない（verifier の担当）。
- `README.md` のインストール元を `main` に戻した件（main 側の判断、
  `origin/main` に `pyproject.toml` が無い件）は依頼書に経緯が明記されており、
  新規の指摘としては扱っていない。
- 文章の推敲・言い回しの提案はしていない。
