# TODO-124. スライドのダブルタップでフルスクリーンを切り替える

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 54 | 15,894 | 71,289 | 1,845,090 | 69% |
| reviewer | Opus 5.5 | high | 30 | 2,552 | 61,346 | 625,180 | 25% |
| verifier | Sonnet 5.5 | medium | 14 | 69 | 31,662 | 153,002 | 7% |
| 合計 |  |  | 98 | 18,515 | 164,297 | 2,623,272 | 計 2,806,182 |

- 立ててから着手までに TODO-123 の決着が挟まったので、`--since '2026-10-02 00:52:50'`（この会話の開始）で切った
- verifier の output 69 は少なすぎる。`subagents/` のログが途中経過しか拾えない既知の件（todo-workflow skill）
- reviewer・verifier は `~/.claude/agents/` の定義のまま（モデルの上書きなし）

## きっかけ

フルスクリーンの切り替えは、ボタン・F キー・終了ボタン・暗幕のタップしか
無かった。スライドを見ている最中に、枠そのものから入り切りしたい。

1 回目のタップを待たせないのは、反応の遅れを避けるためと、最初のタップで
読み上げの unlock（TODO-002）を通すため（利用者が決めた）。

## やったこと

- `player.html`
  - 枠（`#player-viewport`）に `dblclick` のハンドラを足し、`setFullscreen` を
    切り替える。再生／一時停止は、`dblclick` の前に届く 2 回の `click` が
    打ち消し合うので触らない
  - 一続きのクリックで切り替えた回数（`tapToggles`）を数え、2 回のときだけ
    `dblclick` に応じる。片方の `click` がスワイプ（TODO-010）として捨てられた
    ときは打ち消し合わないため。数え直しは `document` の capture で、
    `e.detail === 1` のときだけ（`playBtn.click()` の合成 click は detail 0）
  - `.video-viewport` に `touch-action: manipulation`。ダブルタップをズームに
    取られないようにする
  - 操作ガイドのタッチ操作に「スライドをダブルタップ」を足し、フルスクリーンの
    戻り方にも書き足した
- `docs/Developer.md` の「擬似フルスクリーン」節に、仕組みと `sequenceDiagram`、
  `flowchart` の入口を足した
- `README.md` のスマホ対応の行に足した

## 確かめたこと

- 着手前に Playwright（chromium）で、`touchscreen.tap` 2 回と `mouse.dblclick` の
  どちらも `click`（detail 1）→ `click`（detail 2）→ `dblclick` の順に届くことを
  測った（`archives/agents/TODO-124/probe.py`）
- reviewer が、最初の版では `playBtn.click()` の detail 0 で回数が 0 に戻り、
  フルスクリーンに入らないことを見つけた。`=== 1` に直した
- verifier が Playwright で、マウスのダブルクリック（停止中・再生中から）、
  スマホのダブルタップ、単発のタップ、スワイプ直後のタップ、暗幕のダブルタップ、
  F キーと終了ボタンを測り、すべて期待どおり。`pytest` は 35 passed
- 再生中にダブルタップすると、一時停止と再開を通るので、そのスライドの
  ナレーションは頭から読み直しになる（`playPresentation` が `speakCurrentNarration`
  を呼ぶ。今までの一時停止→再開と同じ）。`docs/Developer.md` に書いた

## 残ること

- **実機では測っていない。** 特に iPhone・iPad の Safari で `dblclick` が届くかは
  未確認。届かなければ、README と操作ガイドの記述が iOS では成り立たない
- 3 連打すると、フルスクリーンに入ったうえで再生状態が 1 回分反転したまま残る
  （reviewer。実害は未確認）
- フルスクリーン中、暗幕と枠にまたがってダブルタップすると、1 回目で抜け、
  2 回目が枠に当たって再生状態が 1 回変わる。入り直しはしない（verifier。
  実害は未確認）

## 分担の振り返り

- **reviewer** は、ダブルタップでフルスクリーンに入らないという、項目の目的が
  丸ごと外れる誤りを見つけた。main は実装後に自分で動かしておらず、
  pytest が通ったことで済ませていた。ほかに 3 連打、iOS 未確認、
  `touch-action` の理由の書き方、操作ガイドの書き漏らしを挙げた
- **verifier** は、7 項目すべて一致。暗幕と枠にまたがるダブルタップの挙動を、
  座標の誤りから偶然見つけた
- 見込みと実施は同じ編成で、食い違いは無い
- 次に同じ規模（`player.html` に十数行のイベント処理）の項目をやるなら、
  同じ 3 者で組む。ただし **main は reviewer に回す前に、着手前に作った
  計測スクリプト（今回の `probe.py`）を実装後にも 1 回流す**。それで
  reviewer の要修正 1 件は main の段階で捕まり、reviewer は設計の検討に
  集中できた
