# TODO-098 reviewer 報告

対象: 未コミットの `git diff`（`docs/User.md`・`player.html`・
`src/ytslide/cli.py`・`tests/test_cli.py`）。コードは直していない。

## 要修正

### 1. `docs/User.md:67-69` が `player.html` の変更に追随していない

今回 `player.html` に、読み込み失敗時の表示へ `index.html` への案内リンク
（「一覧へ戻る」）を追加した（`player.html:581-585`）。実際に
`ytslide web` + Playwright で `player.html?slides=nosuch` を開いて、
本文の後ろにリンクが出ることを確認した（`href="index.html"`,
テキスト「一覧へ戻る」）。

一方 `docs/User.md:67-69` は次のままで、diff で触られていない。

```
`?slides=` を省くと `slides/readme.js` を読む。読み込みに失敗した場合、
白画面ではなく「スライドのデータ slides/<名前>.js を読み込めませんでした。」
と表示して停止する。
```

「一覧へ戻る」の案内が出ることに触れておらず、実態と食い違っている。
依頼書（`brief-implementer-2.md`）は「4. `player.html` — `?slides=` 省略時の
案内」を挙げているが、`docs/User.md` 側の該当節は更新対象に入っていなかった
様子。`docs/` が正本という `CLAUDE.md` の方針（「触る前に読むもの」の節）
からは、ここも直す対象のはず。

### 2. `_no_slides_error()`（`src/ytslide/cli.py:37-46`）が `index.py` の
`slide_names()` と同じ規則を作り直しており、実際に結果がずれる

`src/ytslide/index.py` の `slide_names()`:

```python
names = sorted(
    p.stem for p in paths.SLIDES.glob('*.js') if not p.stem.startswith('_'))
if 'readme' in names:
    names.remove('readme')
    names.insert(0, 'readme')
return names
```

今回追加した `_no_slides_error()`:

```python
if src.parent.is_dir():
    names = sorted(p.stem for p in src.parent.glob('*.js')
                    if not p.stem.startswith('_'))
else:
    names = []
```

`_` 始まりを除いて `.js` を列挙する規則は同じだが、`slide_names()` に
ある「`readme` を先頭に並べ替える」処理が無く、単純なアルファベット順の
まま。`cli.py` は `index_mod`（`index.py`）を既に import 済み
（`cli.py:11`、`index` コマンドで `index_mod.build_index()` を呼んでいる）
なので、素の `index_mod.slide_names()` を使い回せる状態にある。

実測で実際にずれることを確認した（スクラッチディレクトリに
`readme.js`・`apple.js`・`template.js`・`zebra.js` を置いて比較）。

```
cli hint order   : apple, readme, template, zebra
index.slide_names: ['readme', 'apple', 'template', 'zebra']
```

`index.html` の一覧（`readme` が先頭）と、CLI のヒント（アルファベット順）
の並びが名前次第でずれる。ブリーフが挙げていた「2 通りの規則が並ぶと
片方だけ古くなる」を実際に踏んでいる状態。

なお `src.parent.is_dir()` の分岐も実質不要（`pathlib.Path.glob()` は
存在しないディレクトリに対して例外を出さず空を返すことを実測済み。
`index.slide_names()` は元々この分岐を持たずに動いている）。

### 3. `_no_slides_error()` の候補提示（測る候補を挙げる）が、テストで
一切踏まれていない

`tests/` を `_no_slides_error|あるのは|UsageError` で grep しても
`test_video.py:83` の 1 件のみで、これは「`slides/` は存在するが候補 0 件」
の分岐（`else: names = []` 側）だけを通している（既存テスト、今回の
diff の対象外）。「候補を挙げる」（`names` が 1 件以上あるときの
`あるのは …。--slides で指定する` の文面）を通るテストは `tests/test_cli.py`
にも `tests/test_measure.py` にも `tests/test_video.py` にも無い。

依頼書の完了条件 2 番目「`measure --all` を実行すると… `template` が
候補として出る」はこの diff で満たされている（実測済み、下記参照）が、
それを固定するテストが無いため、この関数を壊しても `uv run pytest` は
通ったままになる。

実際に壊してみて落ちることを確かめる作業は、このセッションの Bash
サンドボックス（"Irreversible Local Destruction" の自動拒否）に阻まれて
実行できなかった。**上記のテスト不在（grep での確認）と、既存テストが
通る分岐が限定的であることまでは確認済みだが、「壊したら本当に無言で
通るか」は実測していない（未確認）。**

## 検討

特になし（上の 3 件に集約されると判断した）。

## 好みの範囲

- `player.html` の案内リンク（`class="underline ml-2"`）は、色が周囲の
  テキストと同じ（`rgb(226, 232, 240)`、実測）で、下線だけで区別している。
  実際に開いて確認した限り読みにくくはない（スクリーンショット:
  `player-nosuch.png`、チャットに添付済み）。`player.html` の他の
  インタラクティブ要素は `text-lime-400` のアクセントを使う慣習があり
  （`player.html:331` の消音ボタンなど）、それに揃えるかは好み。

## 確認して問題なかった点

- `player.html:581-585` はリンクを `document.createElement('a')` で
  組んでおり、`slidesName`（URL 由来）を文字列連結で HTML に埋めていない。
  `canvas.textContent = …` の後に `appendChild` しているので、
  `textContent` 代入で子要素が消えるタイミングの問題も無い。`throw` は
  リンク追加の後なので、リンクは実際に表示される（実測済み）。
- `docs/User.md:383-387` の `ytslide init` の説明は、`README.md` を
  置かなくなったこと・自分で置けば `index.html` が拾うことを正しく
  反映している。
- `index.html` が `README.md` を `fetch` して 404 なら無視する作りである
  ことは変わっておらず、`README.md` の存在を前提にしている箇所は
  `index.html` 以外に無いことを grep で確認した（`docs/User.md` の
  「他のサーバーへ公開するとき」の節にある `README.md` への言及は、
  `ytslide init` とは別の文脈で、今回の変更と矛盾しない）。
- `tests/test_cli.py` の変更（`README.md` が無いことを確かめる
  アサーション 2 か所）は、実装を戻せば実際に落ちる作り。
- `uv run pytest -q` は 24 件通過。`uv run ruff check src/ytslide/cli.py`
  も違反なし。
- `pyproject.toml` の `force-include` は `slides/readme.js` を含まない
  （1 回目の実装から戻した状態が保たれている）。
- 依頼書の完了条件を一通り実機で確認した: 空ディレクトリでの `init` が
  `README.md` を置かないこと、`measure --all` で
  `slides/readme.js が無い` + `あるのは template。--slides で指定する`
  が出て終了コード 2 になること、`slides/` が無くても `{パス} に .js が無い`
  で落ちずに出ること、2 回目の `init` が上書きしないこと、
  `player.html?slides=nosuch` で案内リンクが出ること。

## 判断が要る点

- 指摘 1・2 は、実装（または docs）に戻って直すかどうかの判断が要る。
- 指摘 3 は、テストを足すかどうかの判断が要る。「壊すと落ちるか」の
  実地確認はサンドボックス制限で行えなかった（未確認と明記した）。
