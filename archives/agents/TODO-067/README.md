# TODO-067 の分担

| 担当 | モデル | 役割 |
|------|--------|------|
| main | Opus 5 / effort high | 現状調査、`README.md` の「必要なもの」節の執筆、docs 2 本の置き換え |
| verifier | Sonnet 5 / effort medium | 書いたコマンドとパッケージの対応が実機・実装と合うかの照合 |

文書だけを変える項目だが、**書いたとおりに試せる手順があるので確認は分けた**。
実装と確認を同じ担当が持つと、「調べて書いたのだから合っているはず」で終わる。

`apt install` は実行させず、`command -v`・`--version`・`dpkg -S` で実在と版を
照合させた。照合が中心で判断が要らないので Sonnet に振った。

- [verifier-report.md](verifier-report.md) — 照合の結果
