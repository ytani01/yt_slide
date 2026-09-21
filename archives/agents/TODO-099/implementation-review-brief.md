# 改稿後のレビュー（Claude 側で引き継ぎ）

TODO-099 本体の実施は利用者が承認済み。実装は codex 側で行われ、その差分を
cmd worktree へ移したうえで main が 5 件の食い違いを直した。その状態を
TODO-099 の要件と現行コードに照合する。

## 対象

```bash
git diff README.md docs/User.md slides/user.js
```

## これまでの経緯

- 見直しレビュー（`review-report.md`）の指摘 3 件は反映済み。
- main が引き継ぎ時に直した 5 件:
  1. `README.md` のインストール元から `@cmd` を外し、`main` を指す形に戻した
     （利用者の判断。`origin/main` は現在 c498d9e で `pyproject.toml` が無く、
     書いたとおりに実行しても CLI は入らない。これは別項目として立てる）
  2. `README.md` の最小例を `docs/User.md` の「最小の例」と同一にした
  3. `docs/User.md` の「`--text` に文章を渡すと、どのスライド一式でも
     測定できる」を、`--slides` が要る旨に書き換えた
  4. `slides/user.js` の `ytslide measure --text '文章'` に `--slides sample` を足した
  5. `slides/user.js` の 3 枚目のナレーションに `index.html` を足した

- **実測済み**: `ytslide measure --text '文章'` は `ytslide init` した先で
  `FileNotFoundError` の traceback で落ちる（`slides/readme.js` を読もうとする）。
  `--slides <名前>` を付けても、そのファイルが無ければ同じく落ちる。
  コード側の修正は別項目にすると利用者が決めた。文書側は `--slides` を添えて回避する。

## 確認すること

- TODO-099 のチェック項目（`TODO.md` の TODO-099 の節）を差分が満たしているか。
  満たしていない項目があれば番号で指摘する
- 3 ファイルの間で、コマンド・ファイル名・置かれるファイル・用語が食い違わないか
- 現行コード（`src/ytslide/cli.py`、`index.py`、`measure.py`、`paths.py`）と
  違う説明が無いか
- Markdown のリンク先ファイルとアンカーが実在するか
- 初めての利用者が、書いてある操作だけで「自分の内容を 1 枚表示して読み上げを
  確認する」ところまで到達できるか。補わないと進めない箇所があれば指摘する
- 既存の説明が、置き換えではなく取りこぼしで消えていないか
  （`git diff` の削除行を見る）

## やらなくてよいこと

- ブラウザでの表示確認、レイアウトやフォントサイズの実測、TTS の測定、
  インストールの再現。すべて後の verifier が実測する
- 文章の推敲・言い回しの提案。事実の食い違いだけを見る
- `archives/` 以下の内容の点検（現行仕様ではない）

## 制約

- **コードも文書も直さない。** 見つけたことは報告するだけ。
  原因の切り分けや、境界線上の判断もしない。迷うものは「実害は未確認」と
  添えて報告する。直すかどうかは main が判断する
- 書いてよいのは `archives/agents/TODO-099/implementation-review-report.md` だけ

## 報告

`archives/agents/TODO-099/implementation-review-report.md` に書く。
一致したものは 1 行でまとめ、食い違いだけ詳しく書く。
指摘には重大度（高・中・低）、場所（`ファイル:行`）、根拠を付ける。
問題が無ければその旨を明記する。

返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
