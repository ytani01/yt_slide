# TODO-098 implementer への依頼（2 回目・方針差し替え）

## 経緯

1 回目の依頼「`ytslide init` が `slides/readme.js` も置く」は**取り下げた**。
その実装は `git checkout` で戻してある（1 回目の報告
`implementer-report.md` はそのまま残す）。利用者と方針を決め直した。

**あれば使い、無ければ無視する形に寄せる。** 詳しくは `TODO.md` の
「TODO-098」の節を読むこと。

## 変えるもの

### 1. `src/ytslide/cli.py` の `init()`

- `slides/readme.js` は**置かない**（1 回目で足した処理は戻してある）
- **空の `README.md` を置く処理をやめる。** `index.html` は `README.md` を
  `fetch` して 404 なら何もしない作りなので、置く必要が無い。むしろ空で
  置くと `res.ok` が通り、中身が空の README セクションが開いて出る
- 置くのは `slides/template.js`・`player.html`・`index.html` の 3 つになる

### 2. CLI の「`<名前>.js` が無い」に候補を添える

`measure` と `video` にある `raise click.UsageError(f'{src} が無い')` の 2 か所。
`slides/` にある `.js`（`_` で始まるものを除く）を挙げて `--slides` を促す。
**2 か所に同じ文字列を書かず、小さな関数 1 つにまとめる。**

想定する出力（文言は任せる）:

```
Error: /home/me/my-slides/slides/readme.js が無い
       あるのは template。--slides で指定する
```

`slides/` 自体が無い・空のときも落ちない文面にすること。

### 3. `player.html` — `?slides=` 省略時の案内

`slideData` が読めなかったときの表示（`player.html` の
「スライドのデータ … を読み込めませんでした。」のところ）に、
`index.html` への案内を足す。

- **`slidesName` は URL 由来なので、文字列連結で HTML を組まない。**
  メッセージは今までどおり `textContent` で入れ、リンクは
  `document.createElement('a')` で別に足す
- `?slides=` を明示したときも案内を出してよい（一覧へ戻る導線になる）。
  分けるかどうかは実装しやすい方で良いが、**分岐を足すなら理由を報告に書く**

### 4. `tests/test_cli.py`

`init` が置くファイルが変わる（`README.md` が無くなる）。それに合わせて直す。
**`README.md` を置かないことを確かめるアサーションを足す。**

### 5. `docs/User.md`

「リポジトリの外に自分のスライドを置く」の節。`ytslide init` が置く
ファイルの一覧と、`README.md` についての記述（いまは「空の `README.md`」と
「要らなければ空のままでよい」と書いてある）を実態に合わせる。
**`README.md` は自分で置けば `index.html` に出る**ことが読み取れるようにする。

リポジトリ直下の `README.md` は 1 回目に確認して変更不要だった。
今回の変更で食い違いが出ないかだけ見ること。

## 保つもの

- **既にあるファイルは上書きしない**（`_skip_if_exists` の挙動）
- `paths.DEFAULT_SLIDES` は `readme` のまま。**既定の名前は変えない**
- `init` は `--root` を持たず、カレントディレクトリだけを見る
- 他のサブコマンドのオプションと挙動
- `pyproject.toml` の `force-include` は 1 回目の状態に戻してある。
  `slides/readme.js` を足さない

## 完了条件

- `uv run pytest` が通る
- 空のディレクトリで `uv run ytslide init` を実行すると、
  `slides/template.js`・`player.html`・`index.html` が置かれ、
  `README.md` は置かれない
- そのディレクトリで `uv run ytslide measure --all` を実行すると、
  `slides/readme.js が無い` に加えて `template` が候補として出る
- もう一度 `init` しても上書きされない（`すでにある: …` が出る）
- `player.html?slides=nosuch` をブラウザで開くと、読み込めなかった旨と
  一覧への案内が出る

## 検証方法

上を実際に走らせる。作業用ディレクトリはスクラッチパッド配下に作る。
`uv run ytslide` で呼ぶ。`player.html` の確認は Playwright で
実際に開いて、出ている文字列とリンクの `href` を取ること
（静的な読み合わせは不可）。`uv tool install` した状態での確認は
verifier が別に行うので不要。

## 報告

`archives/agents/TODO-098/implementer-2-report.md` に、変更点・検証結果・
残る懸念を書く。返事は 5 行以内。
