# TODO-063. 典型パターンのサンプルを 8〜10 種類用意する

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + wording + verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 26,108 | 92,186 | 87% |
| verifier | Sonnet 5 | medium | 8,214 | 51,574 | 13% |
| 合計 |  |  | 34,322 | 143,760 | 概算 $2.9 |

- verifier は定義のモデル（`sonnet`）と `effort`（`medium`）のまま使い、
  上書きしていない
- main の `effort` は記録に残らない。Opus 5 の既定は `high`
- 集計は `--since '2026-09-20 10:45:00'`（TODO-062 の決着コミットの時刻）で
  切った。TODO-062 と 1 つのコミットで立てたため、番号では範囲を切れない

## きっかけ

TODO-062 で見出しと本文の枠を `player.html` に持たせ、`body` に本文を
書くだけでスライドが作れるようになった。ただし**「本文をどう組むか」の
見本が無い**ままだった。定型を固めるほど見た目がワンパターンになりやすい
ので、枠は揃えたうえで、中身の型を複数用意して選べるようにする。

## やったこと

`slides/template.js` を、箇条書き 1 枚から**型の見本 9 枚**に広げた
（`player.html?slides=template` で並べて見られる）。

| # | 型 | 書き方 |
|---|------|--------|
| 1 | 箇条書き | `body` |
| 2 | 2 カラム比較 | `body` |
| 3 | 表 | `body` |
| 4 | コードと端末画面 | `body` |
| 5 | 図解 | `body` |
| 6 | 数字を大きく見せる | `body` |
| 7 | 引用 | `body` |
| 8 | 時系列 | `body` |
| 9 | 章の区切り | `render()` |

- **8 種類は `body` だけで書ける。** 9 枚目の「章の区切り」だけは見出しの
  枠を外した全面のスライドなので `render()` で書き、`render()` が要る場面の
  実例を兼ねさせた。`title` は目次のために残してある
- **クラスと配色は既存 4 本から採った。** 見出し `text-sky-400`、
  アイコン `text-lime-400`、本文 `text-slate-200`、カード
  `bg-slate-800/60 border border-slate-700 rounded-xl`、コード枠
  `bg-slate-950 border border-slate-800`。サイズはすべて `cqw` と `clamp()`
- **中身は型そのものの説明にした。** 再生すればどの型があるか分かり、
  そのままコピー元にもなる
- `slidesConfig.rules` に `render()` と `body` の読みを足した
- **`duration` は `tools/measure-duration.py --slides template --all --write`
  の実測値**（5〜10 秒。9 枚で 62 秒）
- `docs/User.md` の 2 箇所から指すようにした。「`body` だけで書く」節の
  末尾に 9 種類の一覧を、「`render()` の書き方」節に「章の区切り」が
  `render()` の例であることを足した。**コードは転記していない**

`README.md` と `slides/readme.js` の「入っているスライド」の一覧には
`template` を足していない。見本であって読み物のスライド一式ではなく、
足すと同じ表が 2 箇所あるうちのスライド側でナレーションと `duration` の
測り直しまで波及するため。

## 確かめたこと

verifier が Playwright（chromium）で 1920x1080 に描画して実測した。
`python3 -m http.server` で配信し、`renderSlide()` で 9 枚を順に表示した。
測定スクリプトは `archives/agents/TODO-063/measure.py`、生の数値は
同じディレクトリの `results.json` に残した（PNG は残していない。
撮り直すなら `measure.py` を走らせる）。

- **9 枚とも `#slide-canvas` の `scrollHeight`/`clientHeight` と
  `scrollWidth`/`clientWidth` が一致**（溢れ 0）。本文要素の外接矩形も
  全 9 枚で canvas の矩形の内側
- 見出しの `h2` とアイコンは 1〜8 枚目に出ており、**9 枚目だけ `h2` が無い**
  （`render()` で書いたとおり）
- ブラウザのコンソールエラー 0 件
- `tools/test_measure_duration.py`・`tools/test_make_video.py` とも通過
- `player.html` に差分が無いことも確認した

1920x1080 の 1 サイズだけで、縮小したときの崩れは見ていない。

## 分担の振り返り

- **verifier は「崩れていない」を数値で出した。** 依頼文で
  `scrollHeight`/`clientHeight` と `getBoundingClientRect()` を名指しし、
  「目視だけの『崩れなし』は不可」と書いたので、静的な読み合わせに
  逃げずに済んだ。既存 4 本の見た目の確認とピクセル比較を名指しで
  外したのも効いて、取り分は 13%
- **見込みの 3 担当から verifier だけに減らした。** implementer を外したのは、
  既存 4 本の `render()` から型を採って揃える判断が main に集中していて、
  依頼文にレイアウトの指示を書き切るほうが高くつくため。wording を外したのは
  `narration` が 1 枚 1 文だったため。reviewer は `player.html` の分岐を
  触っておらず、データを足すだけで挙動が変わらないので入れていない
- **次に同じ規模（1 ファイルにデータを足す + 文書 1 箇所）をやるなら、
  同じく main + verifier で組む。** ただし main が 87% を占めており、
  減らす余地があるのは**素材を読む量**のほう。今回は既存 4 本から
  `grep` で当たりを付けてから 3 箇所だけ読んだが、それでも
  `cache_read` が 255 万トークンある。**型の見本ができたので、
  次に同じ作業をするなら既存 4 本ではなく `slides/template.js` だけを
  読めば済む**

分担の理由と verifier の報告は `archives/agents/TODO-063/` にある。
