# TODO-098 verifier への依頼

## 目的

TODO-098 の差分（未コミット）が指示どおりに動くかを**実測で**確かめる。
読み合わせだけの報告は受け付けない。

## 経緯

`ytslide init` した先で `--slides` を省くと、既定の `readme` を探して
落ちていた。**あれば使い、無ければ無視する形に寄せた。**
`TODO.md` の「TODO-098」の節と
`archives/agents/TODO-098/implementer-2-report.md`・`reviewer-report.md`
を先に読むこと。

## 対象

```bash
git diff    # docs/User.md player.html src/ytslide/cli.py tests/test_cli.py
```

## 確かめること

1. **`uv run pytest`** を実行し、件数と結果を報告する

2. **空のディレクトリで `uv run ytslide init`**（スクラッチパッド配下に作る）
   - 置かれるのが `slides/template.js`・`player.html`・`index.html` の 3 つで、
     **`README.md` が置かれない**こと
   - もう一度 `init` しても上書きされないこと（`すでにある: …`）

3. **候補の案内。** 2 のディレクトリで `uv run ytslide measure --all` を
   実行し、`slides/readme.js が無い` と候補（`template`）が出ること。
   さらに `slides/` に `zebra.js`・`readme.js`・`apple.js` を足して
   `--slides missing` で叩き、**候補が `readme` を先頭にした並び**で
   出ること（`index.html` の一覧と同じ並び）

4. **`uv tool install` で入れた `ytslide` でも `init` が通るか。**
   リポジトリのチェックアウトからではなく、**インストールした状態**で
   確かめる（同梱データから読めるかの確認）。
   `uv tool install '<リポジトリのパス>'` で入れ、別のディレクトリで
   `ytslide init` を実行する。**終わったら入れたものを消す**
   （`uv tool uninstall ytslide`）。既に `ytslide` が入っていたら、
   先に控えておいて元に戻すこと

5. **`player.html` の案内。** `ytslide web` で配り、Playwright で
   `player.html?slides=nosuch` を開く。出ている文言と、リンクの
   テキスト・`href` を取る。`?slides=` を**省いた**場合（`slides/readme.js`
   が無いディレクトリ）も同じ案内が出ることを確かめる

6. **`index.html` が `README.md` を拾うか。** 2 のディレクトリに
   `README.md` を自分で置くと `index.html` に出て、置かなければ
   何も出ないこと（`docs/User.md` の「`README.md` は置かないが、自分で
   同じディレクトリに置けば `index.html` が読んで表示する」の裏取り）

7. **`docs/User.md` の記述と実際の一致。** 直した 2 か所
   （読み込み失敗時の案内、`ytslide init` が置くファイル）

## 見なくてよいもの

- 日本語の言い回し・文体
- `player.html` の再生ロジック・レイアウトの測り直し
- `archives/` の中身

## 守ること

- **コードも文書も直さない。** 見つけたことは報告だけ
- **原因の切り分けや、境界線上の判断もしない。**「実害は未確認」と
  添えて報告する
- 一致したものは 1 行。**食い違いだけ詳しく**
- 実行したコマンドとその出力を載せる（載っていなければ測っていないものとして扱う）

## 報告

`archives/agents/TODO-098/verifier-report.md` に書く。返事は 5 行以内。
