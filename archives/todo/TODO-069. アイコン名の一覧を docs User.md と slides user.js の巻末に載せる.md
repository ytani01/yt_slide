# TODO-069. アイコン名の一覧を `docs/User.md` と `slides/user.js` の巻末に載せる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 15,933 | 34,668 | 72% |
| verifier | Sonnet 5 | medium | 20,287 | 58,587 | 28% |
| 合計 |  |  | 36,220 | 93,255 | 概算 $2.2 |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま `sonnet` /
  `effort: medium`。Agent ツールにも同じ `sonnet` を渡したので差は無い
- main は既定の Opus 5 / effort high

## きっかけ

`icon` に何を書けるかの手がかりが、`docs/User.md` のキーの表にある
`fa-list-check` の 1 例しか無かった。アイコンを選ぶたびに FontAwesome の
サイトを見に行くことになる。よく使う型ごとに名前を挙げておけば、その場で
選べる。

置き場所は、はじめ `docs/User.md` の付録だけの予定だったが、
**スライド `slides/user.js` の巻末にも同じ一覧を載せる**ことにした
（利用者の指定）。

## やったこと

対象は `player.html` が CDN から読む **FontAwesome 6.5.1 の無料の solid**。
用途 9 分類・30 件を選んだ。

- `slides/user.js`
  - `ICON_GROUPS`（分類名とクラス名の配列）と `iconTable()`（1 枚ぶん
    3 グループを 3 カラムに並べる）を `slideData` の手前に置いた
  - 巻末に 3 枚（スライド 12〜14）を足した。`render()` は書かず
    `title` / `icon` / `body` で書いてあるので、見出しの枠は
    `player.html` 側が作る
  - `duration` は `tools/measure-duration.py --slides user 12 13 14 --write -n 3`
    の実測値（8 / 8 / 12）
- `docs/User.md`
  - 「最小の例」の後に「付録 アイコン名の例」を足した。用途別の表と、
    `icon` には `fa-solid` を付けない旨、無料の solid に限る旨、
    名前を間違えても何も言われずアイコンが消えるだけである旨

### 選んだ 30 件

| 用途 | クラス名 |
|------|----------|
| 箇条書き・一覧 | `fa-list-check` / `fa-list-ol` / `fa-table-list` |
| 注意・禁止 | `fa-triangle-exclamation` / `fa-circle-exclamation` / `fa-ban` / `fa-circle-info` |
| 手順・進行 | `fa-flag-checkered` / `fa-arrow-right` / `fa-circle-check` |
| コード・端末 | `fa-code` / `fa-terminal` / `fa-file-code` |
| ファイル・文書 | `fa-folder-open` / `fa-file-lines` / `fa-book` |
| 時間・計測 | `fa-clock` / `fa-stopwatch` / `fa-gauge-high` / `fa-chart-simple` |
| 人・対話 | `fa-users` / `fa-comments` / `fa-robot` |
| 図解・設定 | `fa-diagram-project` / `fa-table` / `fa-gear` / `fa-sliders` |
| 強調・ひらめき | `fa-lightbulb` / `fa-star` / `fa-wand-magic-sparkles` |

## 確かめたこと

**名前の存在**（main）。
`@fortawesome/fontawesome-free@6.5.1/sprites/solid.svg` を取得し、
`symbol id=` から無料の solid の名前 **1390 件**の一覧を作って、
選んだ 30 件と見出し用の `fa-icons` を照合した。全件一致。

**描画とレイアウト**（verifier。
[報告](../agents/TODO-069/verifier-report.md)）。
ルートで `python3 -m http.server` を立て、Playwright（chromium）で
`player.html?slides=user` を 1920x1080 で開き、`renderSlide()` で
スライド 12〜14 を出して測った。

- `<i>` **33 件**（見出し 3 + 本文 30）すべてで
  `getComputedStyle(el, '::before').content` が非空。`none` / `normal` は
  **0 件**。`fontFamily` にも `"Font Awesome 6 Free"` が入っていた
- `#slide-canvas` の `scrollHeight - clientHeight` と
  `scrollWidth - clientWidth` は 3 枚とも 0。本文の外接矩形も canvas の内側
- `ICON_GROUPS` と `docs/User.md` の付録の表は、用途名・クラス名・
  並び順・件数が完全一致
- `duration` は 8 / 8 / 12。コンソールエラーと `pageerror` は 0 件

スクリーンショットは `archives/agents/TODO-069/shots/slide-12.png` 〜
`slide-14.png`。

## 分担の振り返り

**verifier が見つけたものは 0 件。** 名前の間違いも、はみ出しも、
2 箇所の食い違いも無かった。これは main が実装の前に
`sprites/solid.svg` の 1390 件と照合して、当てずっぽうの名前を 1 つも
書かなかったため。**見つからなかったことは確認が無駄だった意味ではない。**
FontAwesome には「CSS には名前があるが `fa-solid` では出ない」もの
（`fa-meta` のようなブランド専用）があり、名前の照合だけでは
描画されるかどうかは分からない。実測しないと確かめられない失敗が
別にある。

**見込みと食い違わなかった**（Opus 5 / high + verifier のまま）。
料金は main 72% / verifier 28% の $2.2。

次に同じ規模（既存の素材と機械的に照合できる項目）をやるなら:

- **名前・値の照合は、実装の前に main が権威ある素材と突き合わせて済ませる。**
  今回は `sprites/solid.svg` を取りに行った。ここを飛ばすと、verifier の
  報告が「この名前は出ない」の列挙になり、直して測り直す往復が増える
- **verifier への依頼は「実際に描画されるか」と「はみ出さないか」の 2 点に絞る。**
  今回は 3 点目として `ICON_GROUPS` と `docs/User.md` の表の突き合わせも
  頼んだが、両方とも main が同じリストから同時に書いており、食い違う余地が
  小さかった。ここは削ってよい
- **一覧を 2 箇所に持つ形自体を疑う。** 今回は 30 件で収まったが、増えると
  片方だけ古くなる。次に足すときは、文書側の表を `ICON_GROUPS` から
  生成する手を先に検討する
