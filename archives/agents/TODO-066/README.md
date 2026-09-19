# TODO-066 の分担

新しい道具を 1 本作る項目で、実装・テスト・文書がまとまって要る。
`TODO.md` の見込みどおり implementer + reviewer + verifier を立てた。
挙動が変わる（分岐が増える）ので、確認とは別にレビューも入れた。

**reviewer を先、verifier を後**に回した。並行させると、reviewer の指摘で
実装が変わり、verifier の実測が古い差分に対するものになるため。

| ファイル | 中身 |
|----------|------|
| `implementer-brief.md` | 実装の依頼。決めたこと、撮影の実測済みコード |
| `implementer-report.md` | 実装の報告（レビュー指摘の修正、フェードの修正の追記を含む） |
| `reviewer-brief.md` | レビューの依頼。見なくてよいものも書いた |
| `reviewer-report.md` | レビューの報告。要修正 1 件、検討 3 件 |
| `verifier-brief.md` | 確認の依頼。実際に走らせる手順を指定した |
| `verifier-report.md` | 確認の報告。通しの書き出しと実測値、フェード修正の再確認 |

分担の振り返りは `archives/todo/TODO-066. スライドを MP4 に書き出すツールを作る.md` にある。
