# TODO

**残っている項目: TODO-132。** これまでに 131 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-133` から。**

---

## TODO-132. スマホでネットにつながっていなくても動くようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5 / medium） |

- [ ] 外部から読み込んでいるものをリポジトリに入れ、CDN から読まないようにする
- [ ] Service Worker と manifest を足し、一度開いたらオフラインでも開けるようにする
- [ ] オフラインのときは Online の読み上げから Web Speech に切り替える
- [ ] 各スライドのリポジトリへ写すときの手順を文書に書く

slide_backgammon のセッションからの依頼（利用者の指示）。`player.html` は
slide_backgammon のものと同じで、直すのはこちら。slide_backgammon はできたものを写す。

**ネットから読んでいるもの**（`player.html` と、`ytslide index` が作る `index.html`）:

- Tailwind（cdn.tailwindcss.com）: 無いとレイアウトが崩れる
- Font Awesome（cdnjs.cloudflare.com）: アイコンが出ない
- Google Fonts（Noto Sans JP・JetBrains Mono）: 無くても端末のフォントで表示される
- Online の読み上げ（translate.google.com）: オフラインでは使えない

**slide_backgammon 側の案**（決定ではない）:

1. Tailwind は使っているクラスだけを CSS に書き出し、Font Awesome とフォントも
   リポジトリに入れる
2. Service Worker と manifest を足す。開いたファイルをその都度キャッシュする作りに
   して、プロジェクトごとの設定を要らなくする。GitHub Pages（HTTPS）で一度開けば、
   その後はオフラインでも開け、ホーム画面にも置ける
3. オフラインのときは Online の読み上げから Web Speech に自動で切り替える

**写すときの注意:** 各スライドのリポジトリへは `player.html` だけでなく、新しく
できるファイル（Service Worker の js、取り込んだ CSS・フォント）も一緒に写す
必要がある。`ytslide web` が同梱の `player.html` を配る経路（TODO-129）も同じ。

**着手時に決めること:**

- 取り込む範囲（Noto Sans JP は大きい。フォントは入れず端末のものに任せる案もある）
- Tailwind を書き出す手段（ビルド不要という今の前提を崩さないか）
- `file://` で開いたとき（Service Worker は動かない）をどこまで面倒を見るか

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
