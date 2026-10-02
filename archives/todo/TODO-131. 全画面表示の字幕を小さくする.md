# TODO-131. 全画面表示の字幕を小さくする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 20 | 2,876 | 11,081 | 590,136 | 74% |
| verifier | Sonnet 5.5 | medium | 18 | 183 | 26,842 | 188,777 | 26% |
| 合計 |  |  | 38 | 3,059 | 37,923 | 778,913 | 計 819,933 |

- verifier の定義は `~/.claude/agents/verifier.md`（`model: sonnet`、`effort: medium`）。上書きしていない
- 立てる前に大きさを利用者と決めたやり取りは、始点のコミットより前なので入っていない

## きっかけ

slide_backgammon のセッションから頼まれた（利用者の要望）。全画面表示の
字幕の文字が大きい。向こうは yt_slide の `player.html` を写して使っているので、
こちらで直したコミットに揃える。大きさは利用者が 1.8%（いまの 3/4）に決めた。

## やったこと

- `player.html` の `#viewport-stage.is-fullscreen > #subtitle-banner` の font-size を
  `clamp(14px, min(2.4vw, 4.27dvh), 44px)` から `clamp(14px, min(1.8vw, 3.2dvh), 33px)` に
  した（`vh` の行も同じ）。上限も同じ比率で下げ、下限の 14px はそのまま
- 同じ節のコメントと `docs/Developer.md` の説明を 1.8%・14〜33px に直した

## 確かめたこと

verifier が Playwright で全画面表示にして、字幕の font-size を測った
（[報告](../agents/TODO-131/verifier-report.md)）。

| 画面 | 期待値 | 実測 |
|------|--------|------|
| 1920×1080 | 33px（上限） | 33px |
| 1280×720 | 23.04px | 23.04px |
| 390×844（縦持ち） | 14px（下限） | 14px |

1280×720 のスクリーンショットで、字幕が枠の下端に収まって欠けていないことも
見た。`uv run pytest` は 41 passed。

## 分担の振り返り

- verifier は 3 つの画面サイズとも期待値どおりと報告した。食い違いは見つけていない。
  字幕が既定で非表示なので、先に字幕ボタンを押す必要があった（依頼に書いていなかった）
- 見込みと実施は同じだった
- 次に同じ規模（CSS の値を変えるだけ）なら、同じく main で実装し、verifier に
  `evaluate` で値を読ませる組み方でよい。依頼には「字幕ボタンを押してから測る」
  まで書くと、担当が手順を探す分が減る
