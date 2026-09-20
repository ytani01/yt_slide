# TODO-080 の分担

`player.html` の操作ボタンを入れ替える項目。**再生の状態に関わる変更**なので、
「動くか」と「良いか」を分けた。

| 担当 | 役割 | 報告 |
|------|------|------|
| main | 実装 | — |
| reviewer | 差分を規約と設計に照らして見る | [reviewer-report.md](reviewer-report.md) |
| verifier | ブラウザで実測する | [verifier-report.md](verifier-report.md)・[verify.py](verify.py) |

- 差分が 1 ファイル・36 行だったので、実装は main が持った
- **reviewer を先、verifier を後**に回した。reviewer の指摘で実装が変われば、
  verifier の実測が古い差分に対するものになるため
- verifier には「TTS リクエストを数える」と測り方まで渡した。旧実装の
  二重呼び出しが直ったことは、静的な読み合わせでは確かめられないため

振り返りは
[`archives/todo/TODO-080. 先頭・末尾へ送るボタンを付け、「最初から」を外す.md`](../../todo/TODO-080.%20先頭・末尾へ送るボタンを付け、「最初から」を外す.md)
にある。
