# TODO-074 の分担

- **main**: 実装（`player.html` の 2 か所）と文書。変更が小さく、書き換え場所が
  `renderSlide()` 末尾の 1 行と起動時の 1 行で済む見込みだったので、
  implementer は立てなかった
- **reviewer**: 挙動が変わる項目なので確認とは別に立てた。`renderSlide()` の全経路、
  ハッシュの境界、`replaceState` の例外、docs と実装の食い違いを見させた
- **verifier**: reviewer の指摘を反映したあとに、Playwright（Chromium 1280x720）で
  起動・操作・自動送り・再読み込み・例外注入を実測させた

報告: [reviewer-report.md](reviewer-report.md) / [verifier-report.md](verifier-report.md)
