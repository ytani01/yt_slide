# TODO-060. `slides/_rules.js` を `player.html` に含めるか、もう一度検討する

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | main のみ |
| 実施 | Opus 5 / effort high | main のみ |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 7,456 | 30,767 | 100% |
| 合計 |  |  | 7,456 | 30,767 | 概算 $0.9 |

- 立ててから着手まで間が空いたので、集計は `--since '2026-09-20 07:32:13'` で切った

## きっかけ

TODO-054 で共通の読みの置換表を `player.html` から `slides/_rules.js` へ出した。
その結果、動かすのに 3 ファイルが要るようになり、TODO-059 で
「HTML 1 枚で動く」という記述を直すことになった。戻せば 2 ファイルになる。

スライド一式ごとに読みを足せるのは `slidesConfig.rules`（各スライドのファイル側）の
働きで、共通表が別ファイルであることには依存しない。つまり TODO-054 の目的は、
共通表を `player.html` に戻しても失われない。

## 決めたこと

**共通表を `player.html` に戻す。** 実装は TODO-068 で行う。

判断の軸は**スライドを作る人から見た `slides/` の中身**。いまの `slides/` には
`_rules.js` と、利用者が作ったスライドのファイルが並んでいる。**利用者にとって
`_rules.js` は「自分が作ったものではない、よく分からないファイル」**で、
そこに置かれていること自体がよろしくない。戻せば `slides/` には
利用者のスライドだけが並ぶ。

配布ファイルが 3 つから 2 つに減るのは結果であって、理由ではない。

### 調べたこと

戻すときに触る箇所を数えた。

- `player.html`（1329 行）に 29 行の表が入る。`<script src="slides/_rules.js">`
  （464 行目）を外す
- `tools/measure-duration.py:82` の `load_common_rules()` が
  `slides/_rules.js` を読んでいる。読み先を `player.html` に変える。
  いまの `JS_RULE_RE` をそのまま `player.html` に当てるとヒットは 0 なので
  誤爆しないが、あとから `player.html` に `[/…/g, '…']` の形が増えると拾う。
  `slides_rules_from_text()` と同じく `const SPEECH_RULES = [` で囲いを付ける
- `_rules.js` への言及は archives を除いて 12 箇所（`README.md` 1、
  `docs/Developer.md` 5、`docs/User.md` 2、スライド 4 本のコメント）
- うち `slides/developer.js:83` はナレーション本文なので、`duration` の
  測り直しが要る

### 反対側の見方（採らなかった）

開発する側から見ると、共通表を 1 語足すのに 1329 行の `player.html` を
開くことになり、専用ファイルのほうが扱いやすい。利用者に共通表を直させる
場面も無い（`docs/User.md` の「読みを直す」は `slidesConfig.rules` に書かせる
手順で、共通表は開発側の持ち物）。

**利用者の目線を優先した。** 開発側が少し不便になるのは受け入れる。

## 確かめたこと

- `JS_RULE_RE` を `player.html` 全体に当ててヒット 0 であることを
  `python3` で実測した（`load_rules()` と同じくコメント行を落としてから）
- `_rules.js` への言及の箇所は `grep -rn '_rules'` で数えた（archives を除く）

## 残ること

実装は TODO-068。
