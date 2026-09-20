# TODO-080. 先頭・末尾へ送るボタンを付け、「最初から」を外す

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |
| 実施 | Opus 5 / effort high | reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 13,136 | 24,434 | 73% |
| verifier | Sonnet 5 | medium | 7,447 | 55,158 | 15% |
| reviewer | Sonnet 5 | high | 7,201 | 43,177 | 12% |
| 合計 |  |  | 27,784 | 122,769 | 概算 $2.2 |

- reviewer・verifier とも `~/.claude/agents/` の定義のまま。モデルの上書きはしていない
- main は Opus 5 のまま着手した。見込みでは Sonnet 5 を想定していたが、
  切り替えずに進めた

## きっかけ

操作ボタンの並びが `◀ ▶ 操作ガイド 最初から` で、「最初から」だけが
`ml-2` で離れた位置にあった。先頭へ戻る手段はそこにあったが、**末尾へ飛ぶ
手段が無く**、シークバーの右端を押すしかなかった。

送りのボタンを `⏮ ◀ ▶ ⏭` と並べれば、先頭・末尾も前後送りと同じ場所で
操作できる。

## やったこと

`player.html` だけを変えた（26 行追加・10 行削除）。

- `restart-btn`（「最初から」）を、HTML・`getElementById`・クリックの
  ハンドラごと削除した
- `prev-btn` の左に `first-btn`（`fa-backward-fast`）、`next-btn` の右に
  `last-btn`（`fa-forward-fast`）を足した。見た目のクラスは
  `prev-btn`・`next-btn` と同じ `w-10 h-10`
- 新しいボタンのハンドラは `renderSlide(0, true)` /
  `renderSlide(slideData.length - 1, true)` だけを呼ぶ。旧 `restart-btn` は
  `renderSlide()` の後に `playPresentation()` も呼んでいて、再生中は
  `speakCurrentNarration()` が二重に走っていた。前後送りと同じ形にして解消した
- キー操作に Home（先頭）と End（最後）を足した。既存の分岐の中に置いたので、
  ガイド表示中とフォーカスがボタン・入力欄にあるときは効かない扱いも同じ
- 操作ガイドに `Home / End 先頭／最後のスライド` の行を足し、
  「その他のボタン」の説明を送りのボタンの並びの案内に差し替えた

`aria-label` は「先頭のスライド」「最後のスライド」、`title` は
「先頭のスライドへ移動（Home）」「最後のスライドへ移動（End）」。
既存のボタンの付け方に揃えた。

## 確かめたこと

reviewer が差分を規約と設計に照らして見て、**指摘 0 件**だった
（`archives/agents/TODO-080/reviewer-report.md`）。

verifier が Playwright（Python, chromium, headless）で
`player.html?slides=user`（14 枚）を操作し、**15 項目すべて一致**した
（`archives/agents/TODO-080/verifier-report.md`。スクリプトは同じ場所の
`verify.py`）。

- ボタンの並びは DOM 順・`getBoundingClientRect().x` の昇順とも
  `first-btn, prev-btn, play-btn, next-btn, last-btn`（x = 41, 89, 137, 193, 241）
- `first-btn` で index 0、`last-btn` で index 13（全 14 枚）。Home / End でも同じ
- 先頭で `first-btn`、末尾で `last-btn` を 2 回押しても index は変わらず、
  `pageerror` は 0 件
- 再生中に `next-btn`・`last-btn`・`first-btn` を押したときの
  `translate.google.com` への TTS リクエストは、いずれも 1 件ずつ。
  旧 `restart-btn` のような二重呼び出しは無い
- 幅 390px で 5 つとも表示され、矩形の重なり無し、クリックできる
- `grep -n "restart\|最初から" player.html` は 0 件

## 分担の振り返り

- **reviewer** は差分の指摘を 1 件も出さなかった。代わりに
  `archives/agents/TODO-076/verify_playwright.py` に旧 ID `restart-btn` の
  参照が残っていることを見つけたが、`archives/` は現行仕様ではないので直していない。
  依頼で `grep` の範囲を `player.html docs slides README.md` と渡したのに
  `archives/` まで見たのは、指示より広く探した結果で、害は無かった
- **verifier** も食い違いを見つけなかった。ただし「TTS リクエストを数える」と
  測り方まで指定したので、二重呼び出しが直っていることを**数値で**確かめられた。
  測り方を書かなければ「二重には見えない」で返ってきていたはず
- **見込みと食い違ったのは main のモデルだけ。** Sonnet 5 を想定して立てたが
  Opus 5 のまま着手し、main が料金の 73%（$1.6）を占めた。差分は 36 行で、
  ハンドラは既存の `prev-btn` をなぞるだけだったので、Sonnet 5 で足りた
- **次に同じ規模（1 ファイル・数十行・挙動は既存のなぞり）をやるなら、
  main を Sonnet 5 に落として reviewer を省く。** reviewer が 0 件で、
  verifier が実測で全項目を押さえた。ただし**省けるのは「既存のハンドラと
  同じ形に揃える」変更だけ**で、新しい状態や分岐が増えるなら reviewer は要る
