# TODO-070 verifier への依頼

## 目的

`docs/User.md` の「付録 アイコン名の例」で、30 件のアイコン名を
FontAwesome のページへのリンクにした。**リンク先が本当にそのアイコンの
ページか**を確かめる。

## 落とし穴（先に読むこと）

**FontAwesome のサイトは、存在しないアイコンでも HTTP 200 を返す。**
`https://fontawesome.com/icons/nonexistent-xyz?s=solid` も 200 で、
中身が `<title>Icon Not Found | Font Awesome</title>` のページになる
（main が実測済み）。**状態コードだけの確認は無意味。** 本文の `<title>` を
見ること。存在する場合は
`<title>List Check Filled Icon (Classic Solid) — Free SVG Download | Font Awesome</title>`
のようにアイコン名が入る。

## 確かめること

1. **30 件すべてのリンク先の `<title>`。** `curl -s -L` で取り、
   `Icon Not Found` を含むものを報告する。
   **30 行の一覧（クラス名 → 取れた `<title>`）を報告に載せる。**
   連続して叩くので、1 件ごとに 1 秒ほど間を空ける。
2. **リンクの URL の組み立てが正しいか。** クラス名 `fa-xxx` に対して
   `https://fontawesome.com/icons/xxx?s=solid` になっているか（`fa-` が
   残っていないか、名前が食い違っていないか）を機械的に照合する。
3. **表の中身が変わっていないか。** 書き換えは正規表現で当てたので、
   取りこぼしや壊れがあり得る。`slides/user.js` の `ICON_GROUPS` と
   `docs/User.md` の付録の表を突き合わせ、**用途名・クラス名・並び順・
   件数**が一致するか見る。リンクになっていない名前が残っていないかも見る。
4. Markdown として壊れていないか（表の列数、`|` の数、コードスパンの
   入れ子）。

## やらないこと

- **コードや文書を直さない。** 見つけたことは報告だけ。直すのは main が決める。
- 原因の切り分けや、境界線上の判断もしない。「実害は未確認」と添えて報告する。
- `slides/user.js` は今回変えていない。スライドの表示やレイアウトの
  測り直しは**不要**。
- 文面や言い回しの善し悪しは見なくてよい。

## 報告

`archives/agents/TODO-070/verifier-report.md` に書く。
**実測した値（取れた `<title>`）を必ず載せる。**
一致したものは 1 行ずつの一覧でよく、食い違いだけ詳しく書く。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
