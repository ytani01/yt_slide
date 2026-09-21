# TODO-098 verifier 報告

対象: 未コミットの `git diff`（`docs/User.md`・`player.html`・
`src/ytslide/cli.py`・`tests/test_cli.py`）。コードも文書も直していない。

## 1. `uv run pytest`

```
$ uv run pytest -q
.........................                                                [100%]
25 passed in 0.52s
```

25 件すべて通過。

## 2. 空のディレクトリで `ytslide init`

スクラッチディレクトリ（`.../scratchpad/t098-init`）で実行。

```
$ uv run --project <repo> ytslide init
index.html: 1 件のスライドを書いた
$ find . -type f | sort
./index.html
./player.html
./slides/template.js
```

`README.md` は置かれない。もう一度実行:

```
$ uv run --project <repo> ytslide init
すでにある: template.js
すでにある: player.html
すでにある: index.html
index.html: 1 件のスライドを書いた
```

3 ファイルとも「すでにある」になり、`slides/template.js` の md5 も
実行前後で変化なし（上書きされていない）。

## 3. 候補の案内

同じディレクトリ（`slides/template.js` のみ）で `measure --all`:

```
Error: <path>/slides/readme.js が無い
       あるのは template。--slides で指定する
exit=2
```

`slides/` に `zebra.js`・`readme.js`・`apple.js` を追加し
（`template.js` も残したまま）、`measure --all --slides missing`:

```
Error: <path>/slides/missing.js が無い
       あるのは readme, apple, template, zebra。--slides で指定する
exit=2
```

同じ `slides/` に対して `ytslide index` を実行し `index.html` を
生成、埋め込まれた `slides=` の並びを確認:

```
slides=readme
slides=apple
slides=template
slides=zebra
```

CLI のヒントの並び（`readme, apple, template, zebra`）と `index.html` の
並びが完全に一致した。

`slides/` を丸ごと削除した状態（`init` 直後に `rm -rf slides`）でも
`measure --all` はクラッシュせず案内を出す:

```
Error: <path>/slides/readme.js が無い
       <path>/slides に .js が無い
exit=2
```

## 4. `uv tool install` で入れた `ytslide` での `init`

作業前に、既存のインストール状態を確認した。

```
$ uv tool list
ytslide v0.7.2.dev3+ga4089388b.d20260921
```

（`.d20260921` はビルド時の作業ツリーが dirty だったことを示す。当時の
コミットは `a4089388b`＝`bfd7755` の一つ前。今回の TODO-098 の diff とは
無関係な dirty 状態だった可能性があり、元の dirty 内容そのものは
控えていない。以下の手順で復元したのは「現在のコミット
（`bfd7755`）からクリーンにビルドした状態」で、完全な原状回復ではない。）

1. `uv tool install --reinstall <repo path>` で、今回の未コミット diff を
   含んだ状態のリポジトリからインストール（`dev6+gbfd7755f9.d20260921`）。
2. インストール先の `cli.py` を確認し、`_no_slides_error` と
   `README.md` を書かない `init` が反映されていることを確認
   （このセッションへのシステム通知でも「ファイルが外部で変わった」旨が
   出て、diff の反映を確認できた）。
3. 別ディレクトリ（`.../scratchpad/t098-tool`）で `ytslide init`（PATH 上の
   コマンド、`uv run --project` を使わず）:

```
$ ytslide init
index.html: 1 件のスライドを書いた
$ find . -type f | sort
./index.html
./player.html
./slides/template.js
```

チェックアウトから実行したときと同じ結果（`README.md` 無し）。
同梱データ（`paths.DATA`）から正しく読めていることを実測で確認した。

4. 復元: `git stash push -u -- docs/User.md player.html src/ytslide/cli.py
   tests/test_cli.py` で diff を退避し、`uv tool install --reinstall
   <repo path>` で **現在のコミット（`bfd7755`、diff 無し）からクリーンに
   再ビルド**（`dev6+gbfd7755f9`、dirty サフィックス無し）。その後
   `git stash pop` で diff を戻した。最終的に:

```
$ uv tool list
ytslide v0.7.2.dev6+gbfd7755f9
$ git status --short
 M docs/User.md
 M player.html
 M src/ytslide/cli.py
 M tests/test_cli.py
?? archives/agents/TODO-098/
```

**判断が要る点**: 元の dirty 状態（`.d20260921` 付きの
`dev3+ga4089388b`）を正確に再現したわけではなく、「現在のコミットからの
クリーンな再ビルド」に置き換えている。作業前の dirty 内容を記録していな
かったため、これ以上の厳密な原状回復はできなかった。

## 5. `player.html` の案内（Playwright）

`ytslide web -p 8321`（README.md を置かない、`t098-web` ディレクトリ。
`slides/` は `template.js` のみで `readme.js` は無い）を立ち上げ、
Playwright（chromium）で 2 通りの URL を開いた。

```
URL: http://localhost:8321/player.html?slides=nosuch
LINK text='一覧へ戻る' href='index.html'
本文中: 'スライドのデータ slides/nosuch.js を読み込めませんでした。'

URL: http://localhost:8321/player.html   (?slides= 省略)
LINK text='一覧へ戻る' href='index.html'
本文中: 'スライドのデータ slides/readme.js を読み込めませんでした。'
```

両方とも同じ案内（本文メッセージ＋「一覧へ戻る」リンク、`href="index.html"`）
が出た。

## 6. `index.html` が `README.md` を拾うか

同じ `t098-web` ディレクトリ（`README.md` 無し）で `index.html` を開き、
`#readme` 要素を確認:

```
README.md 無し -> #readme class: "hidden mb-8 rounded-xl bg-slate-900 border border-slate-700 p-4"
                  visible: False, body: ''
```

`README.md`（`# テスト README`）を自分で置いて再確認:

```
README.md 有り -> #readme class: "mb-8 rounded-xl bg-slate-900 border border-slate-700 p-4"
                  （hidden が外れた）
                  visible: True, body: 'テスト README'
```

`docs/User.md` の「`README.md` は置かないが、自分で同じディレクトリに
置けば `index.html` が読んで表示する」という記述どおりの挙動。

## 7. `docs/User.md` の記述と実際の一致

- `docs/User.md:67-69`（読み込み失敗時の案内）: 「`index.html` へ戻る
  『一覧へ戻る』リンクを表示して停止する」と記述。5 の実測（リンクの
  テキスト・`href` とも一致）と合致。
- `docs/User.md:383-387`（`ytslide init` が置くもの）: `template.js`・
  `player.html`・`index.html` の 3 つ、`README.md` は置かない旨。
  2 の実測と合致。

食い違いは見つからなかった。

## 変更されたファイルと依頼の対象範囲

`git diff --stat` は `docs/User.md`・`player.html`・`src/ytslide/cli.py`・
`tests/test_cli.py` の 4 ファイルのみで、依頼書の対象と一致する。
`archives/agents/TODO-098/` は今回のセッションのやり取り用で untracked、
差分の対象外。

## 確かめられなかったこと・判断が要ること

- **4 の `uv tool install` の原状回復**は、記録していなかった元の dirty
  状態そのものではなく、現在のコミットからのクリーンな再ビルドに
  置き換えている（上記参照）。実害は無いと思うが、厳密な原状回復とは
  言えない。判断は管理者に委ねる。
- reviewer 報告にあった「候補提示（`names` が 1 件以上のとき）を通す
  テストが無い」という指摘は、現在の diff の
  `test_measure_no_slides_lists_candidates` で解消済みに見える
  （3 で実測した候補提示の挙動とテストの内容が一致）。ただし
  「実際に壊して落ちるか」は implementer の報告にのみ記載があり、
  このセッションでは独自に壊して確かめ直してはいない（依頼書の
  確認項目に無かったため）。
