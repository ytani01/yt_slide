# TODO

**残っている項目: TODO-131。** これまでに 130 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-132` から。**

---

## TODO-131. 全画面表示の字幕を小さくする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet / medium） |

- [ ] `player.html` の `#viewport-stage.is-fullscreen > #subtitle-banner` の
      font-size を枠の幅の 2.4% から 1.8% にする
      （`clamp(14px, min(1.8vw, 3.2dvh), 33px)`。`vh` の行も同じく。下限 14px は変えない）
- [ ] 同じ節のコメント（「枠の幅の 2.4%」）と `docs/Developer.md` の該当箇所を直す

slide_backgammon のセッションから頼まれた（利用者の要望）。向こうは
yt_slide の `player.html` を写して使っているので、こちらで直したコミットの
ハッシュに揃える。大きさは利用者が 1.8%（いまの 3/4）に決めた。
上限の 44px も同じ比率で 33px に下げる。

verifier には Playwright で 1920×1080 と 390×844（縦持ち）の全画面表示で、
字幕の font-size を測らせる。値を変えるだけで分岐は変わらないので、
reviewer は付けない。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
