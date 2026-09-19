# TODO-068 の分担

`player.html`・`tools/measure-duration.py`・文書 4 本・スライド一式 4 本に
またがる項目なので、`TODO.md` の見込みどおり implementer + reviewer + verifier
を立てた。`load_common_rules()` のパースが変わる（挙動が変わる）ので、
確認とは別にレビューも入れた。

**reviewer を先、verifier を後**に回した。並行させると、reviewer の指摘で
実装が変わり、verifier の実測が古い差分に対するものになるため。

`slides/developer.js` の文面は、着手時に利用者と決めてから implementer に
渡した（文言が固まるまで verifier を起こさない）。

| ファイル | 中身 |
|----------|------|
| `implementer-brief.md` | 実装の依頼。決めたこと、決まった文面 |
| `implementer-report.md` | 実装の報告 |
| `reviewer-brief.md` | レビューの依頼 |
| `reviewer-report.md` | レビューの報告 |
| `verifier-brief.md` | 確認の依頼 |
| `verifier-report.md` | 確認の報告 |
