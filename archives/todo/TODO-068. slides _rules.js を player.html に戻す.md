# TODO-068. `slides/_rules.js` を `player.html` に戻す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |
| 実施 | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 21,692 | 94,523 | 58% |
| implementer | Sonnet 5 | medium | 13,948 | 96,830 | 19% |
| verifier | Sonnet 5 | medium | 13,014 | 64,378 | 14% |
| reviewer | Sonnet 5 | high | 11,528 | 63,440 | 10% |
| 合計 |  |  | 60,182 | 319,171 | 概算 $4.6 |

- 3 担当ともモデルは上書きせず、`~/.claude/agents/*.md` の定義のまま
  （`model: sonnet`）。`effort` も定義のまま
- 分担の理由と各担当の報告は `archives/agents/TODO-068/` にある

## きっかけ

TODO-054 で共通の読みの置換表を `player.html` から `slides/_rules.js` へ出した。
その結果、スライドを作る人が開く `slides/` に、**自分が作ったものではない
ファイルが 1 つ混じる**ようになった。TODO-060 で検討し直して「戻す」と決めた
（[TODO-060](TODO-060.%20slides%20_rules.js%20を%20player.html%20に含めるか、もう一度検討する.md)）。
配布ファイルが 2 つに減るのは結果であって、目的ではない。

## やったこと

- `player.html` — `SPEECH_RULES`（23 ルール）を `prepareSpeechText()` の直前へ
  移した。中身と並び順は変えていない。`<script src="slides/_rules.js">` と、
  読み込み順を説明していたコメントを削除した。同じ `<script>` に入るので、
  スライド一式より先に読む必要は無くなった
- `tools/measure-duration.py` — `load_common_rules()` の読み先を `player.html` に
  した。`const SPEECH_RULES = [` から `];` までを切り出してから `load_rules()` に
  渡す（ファイル全体に `JS_RULE_RE` を当てると、あとから増える正規表現
  リテラルを拾うため）。**囲いが見つからなければ `SystemExit` で止める**
- `slides/_rules.js` を削除した
- `README.md`・`docs/Developer.md`・`docs/User.md`・スライド一式 4 本のコメントから
  `_rules.js` への言及を消した。`docs/User.md` の「他のサーバーへ持っていくとき」は
  3 ファイル → 2 ファイルになった
- `slides/developer.js` のスライド 3「場所を選ばない」— 「ローカルを指すのは
  2 つだけ」が 1 つになったので、ナレーションと帯の文面を直し、`duration` を
  測り直した（17 → 16）
- `README.md` と `slides/readme.js` の「ファイル 3 つ」を「ファイル 2 つ」に直した
  （計 6 箇所）。`readme` のナレーション 2 枚は `duration` に変化なし

## 確かめたこと

- `tools/test_measure_duration.py` が通る（exit 0）
- `load_common_rules()` が 23 ルールを読み、`git show HEAD:slides/_rules.js` の
  23 行とパターン・置換文・フラグまで一致する
- 移動の前後で、置換後の読み上げ文が全 46 枚（文面を変えた 3 枚を除く）で一致する。
  実装前のコミットを `git worktree` に取り出して突き合わせた
- `player.html` の `const SPEECH_RULES = [` を崩すと
  `tools/test_measure_duration.py` が落ちる（`SystemExit`）。復元も確認した
- ブラウザ（Playwright, chromium）で `player.html?slides=<名前>` を開いて
  `prepareSpeechText()` を直接呼んだ結果が、Python 側と全 49 枚で一致する
- リポジトリの外に `player.html` と `slides/<名前>.js` だけを置いて配信し、
  ローカル宛てのリクエストが 2 件・どちらも 200 で、404 が無いこと
  （`developer` と `readme` で 1 回ずつ）

## 分担の振り返り

- **reviewer が見つけたのは、grep に出ない食い違い**だった。`README.md` の
  キャッチコピーと `slides/readme.js` の「ファイル 3 つ」は、`_rules` でも
  `slides/` でも引っかからない。**数を書いた箇所は、その数を数え直す対象に
  ならない**。implementer の依頼書は `grep -rn '_rules'` で対象を渡していたので、
  この 6 箇所は範囲の外にあった
- **verifier は実測で全項目を通し、食い違いを 0 件で返した。** 囲いを崩すと
  落ちることまで確かめている。**reviewer を先に回したのが効いた** — 6 箇所の
  修正が済んでから実測したので、計測は 1 回で済んだ
- 見込み（implementer + reviewer + verifier）と実施は一致した。**この規模で
  3 担当は過剰ではなかった** — reviewer 分の $0.5 で、README の誤りが残るのを
  防げた
- **次に同じ規模（1 つのファイルを消して参照元を直す項目）をやるなら、
  依頼書の対象範囲に「消えるものの数を書いている箇所」を明示的に足す。**
  `grep` で識別子を渡すだけでは、数だけで書かれた記述に届かない。
  担当の構成は同じでよい
