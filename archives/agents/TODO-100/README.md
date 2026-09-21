# TODO-100 の分担

`measure.py` の 1 関数に分岐を足す項目。実装は main が行い、
確認とレビューを分けた。挙動（分岐）が変わるので、確認の担当とは別に
レビューの担当も入れた（TODO-017）。

| 担当     | モデル   | effort | 報告                    |
|----------|----------|--------|-------------------------|
| reviewer | Sonnet 5 | high   | `reviewer-report.md`    |
| verifier | Sonnet 5 | medium | `verifier-report.md`    |

- **reviewer を先、verifier を後**に回した。reviewer の指摘で実装が
  変わると、verifier の実測が古い差分に対するものになるため
- reviewer には「置換表が空になる経路で測定値の意味が変わらないか」
  「共通の置換表が効かなくなっていないか」を見させた
- verifier には測る条件（空のディレクトリ、`--root` の渡し方、
  `curl --max-time` を付けること、通信できないときの代替手段）まで
  依頼文に書いた

振り返りは
`archives/todo/TODO-100. ytslide measure --text が init した先で落ちる.md`
の「分担の振り返り」にある。
