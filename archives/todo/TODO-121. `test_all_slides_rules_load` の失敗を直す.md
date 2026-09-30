# TODO-121. `test_all_slides_rules_load` の失敗を直す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 24 | 3,011 | 36,708 | 587,879 | 89% |
| verifier | Sonnet 5.5 | medium | 8 | 112 | 17,848 | 61,552 | 11% |
| 合計 |  |  | 32 | 3,123 | 54,556 | 649,431 | 計 707,142 |

- 集計は決着のコミットの直前まで。verifier の分はログの都合で少なめに出ている

## きっかけ

`uv run pytest` の `tests/test_measure.py::test_all_slides_rules_load` が
`assert len(common_rules) == 23` で `25 == 23` と落ちていた（TODO-120 の確認で見つかった）。

## やったこと

増えた 2 件（`MP4`・`AI` の読み）は TODO-114（2026-09-22、224e0e1）で、
ナレーションに出てくる語として意図して `player.html` の `SPEECH_RULES` に足したもの。
置換表は正しく、テストの件数だけが古かった。

件数の決め打ちをやめ、`player.html` の `const SPEECH_RULES = [` から `];` までで
`[/` で始まる行を数え、`measure.load_common_rules()` の件数と比べる形にした
（`tests/test_measure.py`）。表に足してもテストを直さずに済み、読み込みで
規則が抜けたときは落ちる。

## 確かめたこと

verifier が実行して確かめた（[報告](../agents/TODO-121/verifier-report.md)）。

- `uv run pytest -q` が 30 件すべて通る
- `load_rules` の戻り値から 1 件落とす一時改変で、このテストが落ちる
- `SPEECH_RULES` に 1 行足しても通る

表の開始行・終了行はインデント込みの完全一致で探すので、`player.html` の
インデントが変わるとテストは `ValueError` で落ちる（黙って通ることはないので、そのままにした）。

## 分担の振り返り

- verifier は、壊すと落ちること・足しても落ちないことを実測で示した。新しい問題は見つけていない
- 見込みどおりの編成で、食い違いは無い
- 次にテスト 1 本を数行直す規模なら、同じく main が実装し、verifier は「通る・壊すと落ちる」の 2 点に絞って Sonnet で足りる。reviewer は要らない（テストの比べ方が変わるだけで、製品の挙動は変わらない）
