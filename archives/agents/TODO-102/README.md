# TODO-102 の分担

README.md と `slides/readme.js` を特徴中心に削り、細かい説明を
`docs/User.md`・`docs/Developer.md` へ寄せた項目。

| 担当 | モデル | effort | 役割 |
|------|--------|--------|------|
| main | Opus 5 | high | どの節をどこへ移すか決め、README・docs・`slides/readme.js` を編集 |
| reviewer | Sonnet 5（定義のまま） | high | 移す元と移した先の突き合わせ、README に残した内容の過不足 |
| verifier | Sonnet 5（定義のまま） | medium | アンカーの到達確認、`slides/readme.js` 6 枚の表示と再生、pytest |

- 文書だけの項目だが、README と `docs/` に同じ主張が 2 か所あるのを
  片付ける作業なので reviewer を入れた（`~/.claude/CLAUDE.md` の
  「文書を移す・写す項目では、移す元が今と合っているかも確かめさせる」）
- reviewer を先、verifier を後に回した。reviewer の指摘で文面が変わると、
  verifier の実測が古い差分に対するものになるため
- 報告は `reviewer-report.md`・`verifier-report.md` にある
