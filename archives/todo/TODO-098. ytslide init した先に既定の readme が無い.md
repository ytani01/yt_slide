# TODO-098. `ytslide init` した先に既定の `readme` が無い

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |
| 実施 | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 24,776 | 207,402 | 59% |
| implementer | Sonnet 5 | medium | 25,460 | 134,553 | 17% |
| reviewer | Sonnet 5 | high | 28,693 | 85,413 | 17% |
| verifier | Sonnet 5 | medium | 12,310 | 54,552 | 7% |
| 合計 |  |  | 91,239 | 481,920 | 概算 $7.1 |

- 3 担当ともモデル・effort は定義（`~/.claude/agents/*.md`）のまま
- implementer は 1 人に 3 回頼んだ（1 回目の方針・差し替え後の実装・
  レビュー指摘の手当て）。表の値はその合計
- **1 回目の実装は丸ごと捨てた**（下記「方針を差し替えた」）。
  implementer の消費にはその分が入っている

## きっかけ

`ytslide init` が置くのは `slides/template.js` だけなので、その場で
`--slides` を省いて `ytslide measure` / `update` / `video` を叩くと、既定の
`readme`（`paths.DEFAULT_SLIDES`）を探して `slides/readme.js が無い` で
止まっていた。`player.html` を `?slides=` 無しで開いたときも同じ。
TODO-097 の verifier が `init` 直後の状態で踏んで見つけた。

## 方針を差し替えた

**最初は「既定の名前を実在させる」で始めた**（`init` が `slides/readme.js`
も置く）。実装まで終えたところで、利用者から「`readme.js` と `README.md` に
ついては、あれば使う・なければ無視するでいいのでは」と指摘があり、
取り下げた。実装は `git checkout` で戻した。

取り下げた理由:

- `init` が置く `slides/readme.js` は yt_slide 自体の紹介 17 枚で、
  利用者の置き場所には無関係な中身が入る
- **`README.md` は `index.html` が既に「あれば使う・なければ無視」に
  なっていた。** `fetch` して 404 なら何もしない（`.catch(() => {})`）。
  それどころか `init` が空の `README.md` を置くと `res.ok` が通ってしまい、
  中身が空の README セクションが開いた状態で出ていた

## やったこと

- **`ytslide init` が `README.md` を置くのをやめた。** 置くのは
  `slides/template.js`・`player.html`・`index.html` の 3 つ
- **CLI の「`<名前>.js` が無い」に候補を添えた。** `measure` と `video` の
  2 か所から `_no_slides_error()` を呼ぶ。候補は `index.py` の
  `slide_names()` をそのまま使い、`index.html` の一覧と同じ並び
  （`readme` が先頭、残りは辞書順）にした
- **`player.html` に「一覧へ戻る」を足した。** スライドのデータを
  読み込めなかったとき、`index.html` へのリンクを出す。`slidesName` は
  URL 由来なので、文字列連結で HTML を組まず `createElement('a')` で足す
- `tests/test_cli.py` を直し、候補を挙げる側を通るテストを足した
- `docs/User.md` の 2 か所（読み込み失敗時の表示、`ytslide init` が
  置くファイル）を実態に合わせた

`paths.DEFAULT_SLIDES` は `readme` のまま。**既定の名前は変えていない。**

## 確かめたこと

verifier が実測した（報告は
[`archives/agents/TODO-098/verifier-report.md`](../agents/TODO-098/verifier-report.md)）。

- `uv run pytest` は 25 件が通過
- 空のディレクトリで `ytslide init` すると 3 つのファイルが置かれ、
  `README.md` は置かれない。二度目は上書きしない
- `measure --all` が `slides/readme.js が無い` と候補を出す。
  候補の並びは `readme` が先頭
- **`uv tool install` で入れた `ytslide`** でも `init` が通る
  （同梱データから読めている）
- `player.html?slides=nosuch` と `?slides=` 省略の両方で「一覧へ戻る」が
  出る。`href` は `index.html`
- `index.html` は `README.md` を置けば表示し、置かなければ何も出さない

## 残ること

verifier が `uv tool install` の確認をしたとき、**元々入っていた
`ytslide`（作業ツリーから入れた dirty ビルド）を厳密には戻せず**、
現在のコミットからのクリーンな再ビルドに置き換わっている。使う分には
困らないが、手元の `ytslide` のバージョン表示が変わっている。

## 分担の振り返り

- **reviewer が 3 件見つけた。** うち 1 件は、`_no_slides_error()` が
  `index.py` の `slide_names()` と同じ規則を作り直していて、**実測で
  並び順がずれる**というもの。実際に 4 つの `.js` を置いて両方を呼び、
  出力を並べて示してきた。「動くか」を見る verifier では拾えない類いで、
  **レビューを別に立てた効果が出た**
- 残り 2 件は「候補を挙げる側を通るテストが無い」と「`docs/User.md` が
  `player.html` の変更に追随していない」。どちらも
  **実装した本人が「終わった」と判断した後に出てきた**
- **見込みと食い違ったのは分担ではなく回数。** 3 担当という編成は
  見込みどおりだったが、**利用者の指摘で方針が変わり、実装が 1 回分
  丸ごと無駄になった**。$7.1 のうち、捨てた実装の分が含まれている
- **次に同じことをやるなら、方針を決める前に「使う側が既にどうなって
  いるか」を調べる。** 今回でいえば `index.html` が `README.md` を
  `fetch` して 404 を無視していること。これを先に見ていれば、
  「既定の名前を実在させる」案は最初から出てこなかった。
  **選択肢を利用者に出す前に、関係する既存の実装を読む**
