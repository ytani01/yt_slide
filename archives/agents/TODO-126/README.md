# TODO-126 の分担

| 担当 | モデル / effort | 範囲 |
|------|-----------------|------|
| main | Opus 5.5 / medium | 実装（`player.html` に `formatSlideNum()` を足し、2 か所を置き換え） |
| reviewer | Opus 5.5 / high | `slideData` が確定してから呼ばれるか、番号の取りこぼし、docs の記述 |
| verifier | Sonnet 5.5 / medium | Playwright で 1 桁（`readme`）・2 桁（`claude-memo`）・3 桁（一時の 120 枚）の表示を読み出す |

番号の書式が変わる（表示の分岐が変わる）ので reviewer を入れた。

- [reviewer-report.md](reviewer-report.md)
- [verifier-report.md](verifier-report.md)
