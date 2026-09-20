# TODO-063 の分担

見込みは implementer + wording + verifier だったが、着手時に利用者と
**main + verifier** に変えた。

- **9 枚の HTML とナレーションは main が書く。** 既存 4 本の `render()` を
  コピーして中身を差し替える作業で、型に揃える判断が main に集中している。
  1 ファイル（`slides/template.js`）と文書 1 箇所の変更で、実装を分ける
  規模ではない（TODO-062 の振り返りでも「削るなら implementer」）
- **wording は省く。** `narration` は 1 枚 1 文で、推敲の余地が小さい
- **reviewer は入れない。** `player.html` の分岐は触っておらず、
  スライドのデータを足すだけで挙動は変わらない
- **verifier は残す。** 9 枚が実際に崩れずに描画されるかは、書いた本人には
  判断できない

## 報告

- [verifier の報告](verifier-report.md)。撮影スクリプトは `measure.py`、
  生の測定値は `results.json`
