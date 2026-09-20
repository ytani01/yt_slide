# TODO-089 の分担

新しいスクリプト 1 本を足し、`slides/*.js` 5 つと文書 4 つ（`docs/User.md`・
`README.md`・`CLAUDE.md`・`slides/user.js`）に波及する項目なので、実装・
レビュー・確認を分けた。生成される HTML の中身が変わる（挙動が変わる）ため、
確認とは別にレビューも入れた。

| 担当 | モデル | 何を任せたか |
|------|--------|--------------|
| implementer | Sonnet 5 / effort medium | `tools/make-index.py` と自己テスト、`slidesConfig` への `summary`/`icon` 追加、文書の追従 |
| reviewer | Sonnet 5 / effort high | 差分のレビュー。正規表現の耐性、HTML のエスケープ、文書との食い違い、既存コードとの揃い |
| verifier | Sonnet 5 / effort medium | 実測での確認。冪等性、並び順、ブラウザでの表示（`file://` と HTTP）、文書どおりの手順の再現 |

reviewer を先、verifier を後に回した（reviewer の指摘で実装が変わるため）。
reviewer の指摘 2 件は main が採否を判断し、同じ implementer に続けて直させた。

- [implementer-report.md](implementer-report.md)（末尾に「レビュー後の修正」）
- [reviewer-report.md](reviewer-report.md)
- [verifier-report.md](verifier-report.md)
