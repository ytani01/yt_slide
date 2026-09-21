# TODO-098 reviewer への依頼

## 目的

TODO-098 の差分（未コミット）を、規約と設計に照らしてレビューする。
**直さない。** 見つけたことを報告するだけ。

## 経緯

`ytslide init` が置くのは `slides/template.js` だけなので、その場で
`--slides` を省くと既定の `readme` を探して落ちていた。
「既定の名前を実在させる（`init` が `readme.js` も置く）」案は取り下げ、
**あれば使い、無ければ無視する形に寄せる**方針に差し替えた。
詳しくは `TODO.md` の「TODO-098」の節と
`archives/agents/TODO-098/brief-implementer-2.md`。

実装の報告は `archives/agents/TODO-098/implementer-2-report.md`。

## 対象

```bash
git diff    # docs/User.md player.html src/ytslide/cli.py tests/test_cli.py
```

## 見てほしいところ

1. **`_no_slides_error()` が、既にあるものの作り直しになっていないか。**
   `slides/` の `.js` を列挙して `_` 始まりを除く処理は、
   `src/ytslide/index.py` にも似たものがあるはず。**使い回せるなら
   使い回すべきで、2 通りの規則が並ぶと片方だけ古くなる。**
   実際に `index.py` を読んで突き合わせること
2. **`init` から `README.md` を外したことの波及。** `index.html` は
   `README.md` を `fetch` して 404 なら何もしない作りだが、
   **他に `README.md` があることを前提にしている箇所が無いか**を
   `grep` で確かめる
3. **`player.html` の案内リンク。** `slidesName` は URL 由来。
   文字列連結で HTML を組んでいないか。リンクが読めるか
   （色・下線・周りのレイアウトとの兼ね合い）。`throw` との順序
4. **エラー文の組み立て方。** `_no_slides_error()` は改行と空白を
   文字列に埋めている。click の表示のされ方に依存していないか
5. **テストが「壊すと落ちるか」。** `tests/test_cli.py` の変更が、
   実装を壊したときに実際に落ちるか。通ることだけを見ない。
   **1 つ実装を壊してみて、落ちることを確かめてよい**
   （確かめたら必ず元に戻すこと）
6. **規約との突き合わせ。** `CLAUDE.md` と `docs/` の方針
   （文書に TODO 番号を書かない、`docs/` が正本、など）

## 見なくてよいもの

- `player.html` の再生ロジック・レイアウト（今回触っていない）
- `archives/` の中身
- 日本語の文体の好み。**ただし記述が実態と食い違っていれば指摘する**

## 守ること

- **コードも文書も直さない。** 報告だけ
- **原因の切り分けや、境界線上の判断もしない。**「実害は未確認」と
  添えて報告する
- 指摘には、根拠（ファイルと行、実際に走らせた出力）を付ける

## 報告

`archives/agents/TODO-098/reviewer-report.md` に書く。
返事は 5 行以内（終わったか・報告ファイルのパス・判断が要る点）。
