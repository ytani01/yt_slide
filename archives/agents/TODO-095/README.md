# TODO-095 の分担

3 本のスクリプト・テスト・文書にまたがり、探す場所の分岐が増える
（挙動が変わる）項目なので、実装・レビュー・確認をすべて分けた。
reviewer を先、verifier を後に回した。

| 担当 | 依頼したこと | 報告 |
|------|--------------|------|
| implementer | 探し方の優先順の実装、`--root` の追加、テスト、`docs/User.md` の節 | [implementer-report.md](implementer-report.md) |
| reviewer | `ROOT` が決まるタイミング、優先順の分岐、後方互換、文書の食い違い、テストの強さ | [reviewer-report.md](reviewer-report.md) |
| verifier | 文書の手順どおりの再現、優先順の実測、テスト 3 本、エラーの出方、後方互換 | [verifier-report.md](verifier-report.md) |

reviewer の指摘 2 件は、同じ implementer に続けて頼んで直した
（立て直すと文脈の読み直しから始まるため）。

着手前の実測（外のディレクトリで `--slides mine --all` が落ちること）は
main が行い、その結果を implementer への依頼に書いた。
