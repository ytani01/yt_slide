# TODO-132 の分担

- implementer（Opus 5.5）: 取り込み・Service Worker・manifest・オフラインの読み上げ・配布経路・文書。
  Service Worker と読み上げの分岐が込み入るので Opus に上書きした。報告は implementer-report.md
- reviewer（Opus 5.5）: 差分のレビュー。挙動と分岐が変わるため。報告は reviewer-report.md
- verifier: 起こす前に利用者がやめると決めた

offline_check.py・offline_speech_check.py は implementer が確認に使った Playwright のスクリプト。
実装は捨てたので、今のリポジトリでは動かない。
