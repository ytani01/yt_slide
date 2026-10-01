# TODO

**残っている項目: TODO-128。** これまでに 127 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-129` から。**

---

## TODO-128. 作業場所に player.html が無くても、作業場所のスライドを書き出す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] 作業場所に `player.html` が無くても、`video`・`pdf`・`check` が同梱の
      `player.html` で作業場所の `slides/<名前>.js` と画像を読む
- [ ] 3 つのコマンドの開き方を 1 か所にまとめる

`paths.set_root()` は作業場所に `player.html` が無いと同梱データ側へ落とすが、
`video`・`pdf` は `file://` でその `player.html` を開くので、ページは同梱側の
`slides/<名前>.js` を読む。同梱側に同じ名前があると、エラーにならずに違う
スライドで書き出す（無ければ Playwright のトレースバック）。`check` は作業場所を
HTTP で配って `/player.html` を開くので、こちらは 404 になる。`ytslide init`
した作業場所では起きない（TODO-112 の reviewer が実測）。

**決めたこと** — エラーで止めるのではなく、同梱の `player.html` で作業場所を
読ませる（2026-10-02 に利用者が決めた）。

`check` が既に作業場所を HTTP で配っているので、`/player.html` だけ同梱側へ
落とすハンドラにして `video`・`pdf` も同じ開き方にする案がある。着手時に
`file://` から HTTP に変えて `video`・`pdf` の見た目（フォント、画像）が
変わらないかを 1 枚で確かめてから組む。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
