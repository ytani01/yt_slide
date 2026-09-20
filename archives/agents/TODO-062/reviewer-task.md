# TODO-062 reviewer 依頼

## 目的

TODO-062 の実装を、規約と設計に照らしてレビューする。**コードは直さない。**
見つけたことは報告だけする。境界線上の判断や原因の切り分けもしない
（「実害は未確認」と添えて報告する）。

## 対象範囲

```bash
git diff player.html docs/User.md
git status --short   # 新規: slides/template.js
```

`player.html`、`docs/User.md`、`slides/template.js`（新規）の 3 ファイル。
`TODO.md` の差分と `archives/` はレビュー対象外。

## 背景

`render()` を書かずに本文だけ（`body`）でスライドを書けるようにした。
`render()` は残し、あればそちらが優先される（置き換えではなく追加）。
決めたことの全文は `TODO.md` の TODO-062 の節にある。**まずそれを読むこと。**
依頼した内容は `archives/agents/TODO-062/implementer-task.md`、
実装側の報告は `archives/agents/TODO-062/implementer-report.md` にある。

## 見るところ

分岐が増えたので、**分岐の意味**を重点的に見る。

1. `render()` の有無の判定が、既存 4 本のスライド（45 枚）すべてで
   これまでと同じ経路を通るか。既存の見た目が変わる余地が無いか
2. `title` / `icon` / `body` が欠けたとき・空のときに何が出るか。
   決めたこと（`title` が空なら見出しを出さない）と合っているか
3. 見出しのクラスと寸法が、TODO.md に書いた実測値と一字一句合っているか
4. `body` に利用者が書いた文字列がそのまま `innerHTML` に入る点。
   既存の `render()` と比べて新しい危険が増えているか（増えていないなら
   1 行でよい）
5. `docs/User.md` の記述が実装と合っているか。**implementer が
   「`render()` の書き方」の冒頭文を言い換えたと報告しているので、
   元の意味が変わっていないか `git diff` で必ず見る**
6. 日本語が `~/.claude/CLAUDE.md` の規約に沿っているか
   （造語を使わない、直訳調でない、`docs/` に TODO 番号を書かない）
7. `slides/template.js` が `docs/User.md` に書いたとおりの書き方になっているか

**やらなくてよいこと:** ブラウザでの表示確認、レイアウトの測り直し、
`duration` の実測（verifier が別に行う）。

## 報告

`archives/agents/TODO-062/reviewer-report.md` に書く。
**問題が無かった観点は 1 行ずつ、見つけた問題だけ詳しく書く。**
各指摘に「どのファイルの何行目か」「規約・設計のどれに反するか」
「実害があるか（未確認ならそう書く）」を添える。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
