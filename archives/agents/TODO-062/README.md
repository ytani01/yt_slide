# TODO-062 の分担

| 担当 | 依頼 | 報告 |
|------|------|------|
| implementer | [implementer-task.md](implementer-task.md) | [implementer-report.md](implementer-report.md) |
| reviewer | [reviewer-task.md](reviewer-task.md) | [reviewer-report.md](reviewer-report.md) |
| verifier | [verifier-task.md](verifier-task.md) | [verifier-report.md](verifier-report.md) |

計測スクリプトは [shot.py](shot.py)（Playwright で 1920x1080 に描画して撮る）。

## この分担にした理由

- `render()` の有無で**分岐が増える**ので、確認とは別に reviewer を入れた
  （「動くか」と「良いか」は別）
- 既存 4 本・45 枚の見た目が変わらないことは、読み合わせでは確かめられない。
  verifier には**変更前の `player.html` と撮り比べる**ところまで依頼文で指定した
- reviewer を先、verifier を後に回した。並行させると reviewer の指摘で
  実装が変わり、verifier の実測が古い差分に対するものになる

2 つの表（見込みと実施、消費トークン）は
`archives/todo/TODO-062. スライドの見出しと本文の枠を player.html に持たせる.md`
にある。
