# TODO-097. TODO-096 で残った文書と実態の食い違いを直す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 11,951 | 36,465 | 79% |
| verifier | Sonnet 5 | medium | 9,659 | 42,827 | 21% |
| 合計 |  |  | 21,610 | 79,292 | 概算 $1.7 |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま。モデルも effort も
  上書きしていない
- 実装は main が直接やった。5 ファイルの文言を直すだけで、
  implementer を立てる規模ではないと見た

## きっかけ

TODO-096 で `tools/*.py` 3 本を `src/ytslide/` へ移し、サブコマンドを 3 つ
（`init`・`update`・`web`）足したが、文書の追随が一部漏れていた。
利用者から「TODO-096 の変更で、ドキュメントに齟齬がないか」と聞かれて
洗い出した。`tools/` を指す記述は `archives/` の外には残っていなかった。

見つかったのは 5 件。

1. テストの本数が古い。`CLAUDE.md`「3 本」、`docs/Developer.md`「2 本」、
   `AGENTS.md` は `test_measure.py` と `test_video.py` だけを名指し
2. `docs/Developer.md` の構成表に `src/ytslide/index.py`・
   `tests/test_index.py`・`tests/test_cli.py` が無い
3. `ytslide update` がどの文書にも出てこない
4. `docs/User.md`「どれもカレントディレクトリを見る」の列挙が 3 つだけ
5. `README.md` のインストール節が `measure` と `index` しか触れておらず、
   `ytslide init` へ辿れない

## やったこと

- `CLAUDE.md`・`docs/Developer.md`・`AGENTS.md` のテストの記述を
  「`tests/` の 4 本」に揃えた。`AGENTS.md` は本数を書かず
  「`tests/` のテストを `uv run pytest` で確認する」にして、増えても
  古くならない形にした
- `docs/Developer.md` の構成表に `src/ytslide/index.py`・
  `tests/test_index.py`・`tests/test_cli.py` の 3 行を足した
- `ytslide update` を 3 か所に載せた。`README.md` のサブコマンドの表、
  `docs/User.md` の `--write` の直後（例つき）と「手順」の 3、
  `docs/Developer.md` の `duration` を測り直す節
- `README.md` のインストール節に、サブコマンド 6 つの表を足した。
  `ytslide init` の行から `docs/User.md` の「リポジトリの外に自分の
  スライドを置く」へリンクした。`uv tool install` のコメントは
  `# measure と index` → `# video 以外` に直した
- `docs/User.md` の列挙を「`ytslide` のサブコマンドはどれも」に改め、
  `--root` を持つのが `measure`・`index`・`update`・`video` の 4 つで、
  `init` と `web` はカレントディレクトリだけを見ることを書いた

## 確かめたこと

verifier が実測した（報告は
[`archives/agents/TODO-097/verifier-report.md`](../agents/TODO-097/verifier-report.md)）。

- `uv run pytest` は 4 ファイル・24 件が PASSED
- `README.md` のサブコマンドの表は `ytslide --help` の 6 つと過不足なく一致。
  各行の説明も各サブコマンドの `--help` の文と一致
- `--root` の有無を 6 サブコマンドすべての `--help` で確認し、
  `docs/User.md` の記述と一致
- 空のディレクトリで `ytslide init` → `ytslide web` を実際に動かし、
  置かれたファイルが `docs/User.md` の記述どおりで、`index.html` が
  HTTP 200 で返ることを確認
- `README.md` から `docs/User.md#リポジトリの外に自分のスライドを置く` への
  リンク先の見出しが実在することを確認

## 残ること

`ytslide init` した先で `--slides` を省くと、既定の `readme` を探して
`slides/readme.js が無い` で止まる（`init` が置くのは `slides/template.js`
だけ）。文書は常に `--slides` を明示した例を出しているので記述の誤りでは
ないが、既定値と `init` が噛み合っていない。**TODO-098 として別に立てた。**

## 分担の振り返り

- **verifier が見つけたのは 1 件**（上の「残ること」）。文書の記述そのものは
  6 項目すべて実測と一致していた。`--help` の突き合わせや `init` → `web` の
  実行は機械的な作業で、main が自分でやっても同じ結果になったはずだが、
  「書いたとおりに試す」役を分けたおかげで、書いた本人が想定していなかった
  `init` 直後の既定値の噛み合わせに当たった。**分けた価値はそこに出た**
- **見込みと食い違わなかった。** verifier 1 人、モデルも定義のまま。
  料金は $1.7 で、うち main が 79%。main の取り分が大きいのは、
  最初の洗い出し（5 ファイルの通読と grep）を main がやったため
- **次に同じ規模（文書 5 ファイルの文言を実態に合わせる）をやるなら、
  同じ組み方でよい。** ただし依頼文に「素の `<コマンド>` が動くか」と
  書いてしまい、verifier に「その想定自体が文書のどこにも無い」と
  返させた。**実行してほしい例は、文書に載っている形そのままで指定する。**
  載っていない形を試させると、境界線上の判断を押しつけることになる
