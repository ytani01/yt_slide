# TODO-079. `docs/User.md` は `body` を標準として書く

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |
| 実施 | Sonnet 5 / effort 記録なし | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Sonnet 5 | 記録なし | 7,603 | 57,498 | 71% |
| verifier | Sonnet 5 | medium | 4,409 | 37,716 | 29% |
| 合計 |  |  | 12,012 | 95,214 | 概算 $0.6 |

- verifier は定義（`model: sonnet`、`effort: medium`）のまま
- 集計は `--since` で 2026-09-20 19:12（前の項目のコミット直後）から切った。
  立ててから着手まで別の項目が挟まったため

## きっかけ

`player.html` は `render()` が無ければ `title`・`icon` から見出しを作って
`body` を枠で包む。`slides/template.js` も 8 種類が `body` で書かれているのに、
`docs/User.md` は `render()` を先に説明し、`body` を後から補足する構成で、
`render()` が標準に見えた。

## やったこと

- `docs/User.md`: 冒頭の例と「最小の例」を `body` に。キーの表を
  `title`・`duration`・`narration`・`body`・`icon`・`render()` の順にし、
  「`body` で書く（標準）」を「`render()` の書き方」より前に置いた。
  `render()` の節は「`body` で足りないとき」の高度な使い方と明記し、例を付けた
- `README.md`: 「自分のスライドを作る」の例を `body` に
- `slides/user.js`: 5 枚目の表の `render()` の行を `body` に。7 枚目に
  「`body` で書く」を足し、8 枚目を `render()` の枚にした（14 枚 → 15 枚。
  TODO の「11 枚 → 12 枚」は巻末のアイコン 3 枚を数えていなかった）。
  `duration` を測り直した（8 枚目 12 → 14 ほか）
- `player.html` は触っていない

## 確かめたこと

verifier（`archives/agents/TODO-079/verifier-report.md`）が実測した。

- `player.html?slides=user` の 15 枚で JS エラー 0、はみ出しなし
- 7 枚目に見出しとアイコンが出る。`User.md` の最小の例と README の例を
  `slides/sample.js` に貼って再生できた
- `measure-duration.py` の提案値が `user.js` の値と全枚一致

実装中に気づいたこと: スライドの `body` 内のコード例に `duration:`・`narration:`
と書くと、`measure-duration.py` が別のスライドと数えて書き換える。例からは
その 2 行を外した（バッククォートは `&#96;` で書いた）。

## 分担の振り返り

- verifier は問題を見つけなかった。README の例には `icon` が無いので
  アイコンが出ない点だけ報告した（意図どおり）
- 見込みどおり。挙動の分岐は変わらないので reviewer は立てなかった
- 次に同じ規模の文書とスライドデータだけの項目も、main が実装して verifier
  1 名で足りる。依頼に実測する項目を列挙したので、報告は 1 回で済んだ
