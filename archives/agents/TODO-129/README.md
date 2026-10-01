# TODO-129 の分担

- **main** — 実装（`browser.py` のハンドラーを分け、`web` に `--root` を足す）と
  テスト・文書。変更が小さく、実装の担当は分けなかった
- **reviewer**（Opus 5.5 / high） — 分岐が変わる（`/player.html` の出どころ）ので入れた。
  報告は [reviewer-report.md](reviewer-report.md)
- **verifier**（Sonnet 5.5 / medium） — `player.html` の無い作業場所で `web` を
  実際に起動して取り出し、テストが壊すと落ちるかを見た。
  報告は [verifier-report.md](verifier-report.md)

reviewer を先、verifier を後に回した。
