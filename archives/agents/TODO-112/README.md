# TODO-112 の分担

| 担当 | モデル / effort | 範囲 |
|------|-----------------|------|
| main | Opus 5.5 / medium | 着手前の実測（`page.pdf()` を 1 枚ずつ。`try-pdf.py`）、reviewer の指摘の反映（`pdf.py` の簡素化、文書、`.gitignore`、テスト 1 件） |
| implementer | Sonnet 5.5 / medium | `pdf.py`・`pdf` コマンド・extra・文書・テストの実装 |
| reviewer | Opus 5.5 / high | 差分のレビュー（`--root` の扱い、テストの強さ、文書の取りこぼし） |
| verifier | Sonnet 5.5 / medium | `init` した作業場所で文書の手順を再現、PDF の目視、テストを壊すと落ちるか、`pdf/` が git に出ないか |

新しいファイル・サブコマンド・依存関係・文書・テストがまとめて要るので implementer に分けた。
挙動が増えるので reviewer を入れた。

- [try-pdf.py](try-pdf.py)（着手前の実測に使ったもの）
- [implementer-report.md](implementer-report.md)
- [reviewer-report.md](reviewer-report.md)
- [verifier-report.md](verifier-report.md)
