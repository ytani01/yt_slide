# TODO-065. `measure-duration.py` に測る回数のオプションを足す

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier + reviewer |
| 実施 | Opus 5 / effort high | reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 28,693 | 102,468 | 76% |
| verifier | Sonnet 5 | medium | 10,680 | 108,943 | 15% |
| reviewer | Sonnet 5 | high | 7,685 | 46,867 | 7% |
| wording | Haiku 4.5 | 記載なし | 8,282 | 31,110 | 3% |
| 合計 |  |  | 55,340 | 289,388 | 概算 $4.4 |

- **この表は TODO-059 との合計。** 2 項目を同じセッションで並行して進めたので、
  項目ごとには切れない。reviewer はこの項目だけ、wording は TODO-059 だけを
  担当した。main と verifier は両方を担当している
- main のモデルは見込みの Sonnet 5 / medium ではなく Opus 5 / high だった。
  利用者が 2 項目をまとめて指示したため、セッションのモデルがそのまま使われた
- verifier と reviewer は定義（`~/.claude/agents/`）のまま。モデルは上書きしていない
- wording は定義が Haiku 4.5 で、**Haiku は effort に対応しない**ので「記載なし」

## きっかけ

Online TTS の秒数は毎回同じとは限らないのに、1 回の実測で `duration` を
決めていた。TODO-032 の「スライド 15 のずれ」も、1 回の測定では揺れと
直し忘れの区別が付かなかった。

## やったこと

**1. `-n` / `--repeat` を足した（既定 1）。** n 回測って **中央値** を採る
（`statistics.median`）。たまたま長い 1 回に引きずられない。既定を 1 にしたので
今までと同じ挙動のままで、Google TTS へのリクエストも増えない。

**2. TTS の取得を `fetch_duration()` に切り出した。** mp3 を `curl` で取って
`ffprobe` で長さを測る部分。`measure()` はそれを `repeat` 回呼んで中央値を採る
だけになった。

**3. `-n 0` 以下はエラーで止める。**

**4. 出力に回数を出す。** `-n` を 2 以上にしたときだけ
`実測 3 回の中央値 16.224s` と出る。既定のときは今までと同じ表示。

**5. テストを足した。** `tools/test_measure_duration.py` に、3 回の中央値・
偶数回（真ん中 2 つの平均）・既定 1 回の 3 つ。`fetch_duration()` を差し替える
ので、ネットワークは要らないまま。

**6. `docs/User.md` に `-n` の説明を足した。**

## 確かめたこと

verifier が実測した（`archives/agents/TODO-065/verifier-report.md`）。

- `python3 tools/test_measure_duration.py` が `OK`
- `--text 'テストです' -n 3` で `3 回の中央値` が出る。`-n` を省くと出ない
- スライド番号（`--slides readme 1 -n 2`）でも効く
- `--slides claude-memo --all --write` でも効く（確認後に `git checkout` で戻した）
- `-n 0` と `-n -1` はエラーで止まる
- `docs/User.md` の記述と挙動が食い違っていない

reviewer は要修正 0 件（`archives/agents/TODO-065/reviewer-report.md`）。
指摘のうち「偶数回のテストが無い」は、決着前にテストを足して対応した。

## 分担の振り返り

- **reviewer が見つけたもの**: 偶数回（`statistics.median` が真ん中 2 つの
  平均を返す）のテストが無いこと。実装の誤りは 0 件。中央値を平均や最初の値に
  書き換えるとテストが落ちることも、実際に書き換えて確かめていた
- **verifier が見つけたもの**: 食い違いは 0 件。`--all --write` を
  `claude-memo` で試して `git checkout` で戻すところまで、指示どおり実行した
- **見込みとの食い違い**: 担当は見込みどおり（verifier + reviewer）。
  main のモデルだけが見込みより上（Sonnet 5 / medium → Opus 5 / high）。
  2 項目を 1 つの指示でまとめて渡されたので、軽いほうに合わせる機会が無かった
- **次に同じ規模なら**: 実装が 40 行程度の 1 ファイルで、reviewer の指摘も
  テスト 1 本だった。**reviewer と verifier を同時に起こさず、この順**（先に
  reviewer、指摘を潰してから verifier）で足りる。実装を implementer に出す
  必要は無い。`--all --write` の確認先を、その項目で触っていないスライド一式に
  名指しで指定しておくと、verifier が退避と復帰で迷わない
