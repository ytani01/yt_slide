# TODO-112. PDF に書き出せるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | implementer（Sonnet 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | implementer（Sonnet 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 70 | 17,200 | 49,555 | 3,054,649 | 67% |
| reviewer | Opus 5.5 | high | 50 | 4,975 | 66,578 | 1,074,190 | 24% |
| implementer | Sonnet 5.5 | medium | 16 | 138 | 34,760 | 204,084 | 5% |
| verifier | Sonnet 5.5 | medium | 16 | 572 | 21,222 | 154,140 | 4% |
| 合計 |  |  | 152 | 22,885 | 172,115 | 4,487,063 | 計 4,682,215 |

- 見込みの行は着手時に書き直した（立てたときは `Sonnet 5 / effort medium | implementer + reviewer + verifier`）
- 立ててから着手まで空いたので `--since '2026-10-02 04:31:00'` で集計した

## きっかけ

配布先から「PDF をください」と言われたときに渡すものが無かった。書き出しは
MP4 と `.srt` だけで、印刷にも回覧にも向かない。

## やったこと

- 着手前に `page.pdf()` を 1 枚ずつ試した（`archives/agents/TODO-112/try-pdf.py`）。
  `video.py` の `FIT` でスライドだけを 1920×1080 に広げ、`emulate_media(media='screen')`
  のあと `width='1920px', height='1080px', print_background=True`、余白 0 で
  1440×810pt（16:9）の 1 ページになる。文字はテキストのまま、見た目は動画用の
  PNG と同じ
- 引数は他のサブコマンドに揃えて `ytslide pdf --slides <名前>`（`--out` の既定 `pdf`、
  `--root`）にした。TODO に書いていた `ytslide pdf <名前>` の形にはしていない
- `src/ytslide/pdf.py` を足した。1 枚ずつ `page.pdf()` の bytes を `pypdf` の
  `PdfWriter` でつなぐ。枚数はページが読み込んだ `slideData.length` から取る
  （`measure.narrations()` の正規表現で数えると、`narration` の書き方によって
  0 ページになる。reviewer が実測）
- `pypdf` は `video` の extra に足した（`check` も同じ extra で Playwright を使っている）。
  `pypdf` が無いときは、chromium を起こす前に入れ方を添えて止める
- 文書: README のインストール、`docs/UsersGuide.md` のサブコマンドの表・要るパッケージ・
  `--root` の一覧・「PDF に書き出す」の節、`docs/Developer.md` のファイル一覧、
  `init --claude` が置く `CLAUDE.md` の本文に `pdf` を足した
- `.gitignore` に `/pdf/`
- テスト 3 件（`--slides`・`--out` の受け渡し、スライドが無いときのエラー、
  `pypdf` が無いとき）

## 確かめたこと

- `uv run pytest`: 38 passed。`ruff check src tests`: 指摘なし
- reviewer: `cli.py` を 3 通り壊して、追加したテストが落ちることを実測
- verifier: `ytslide init` した作業場所で UsersGuide の手順どおりに
  `ytslide pdf --slides sample` を実行し、`pdf/sample.pdf` が 19 ページ（枚数と同じ）、
  1440 x 810 pts。1・10・19 ページを目視し、スライドの中身だけで字幕・進行バー・
  ボタン・「SLIDE nn / NN」の行が無い。`pypdf` の分岐を壊すとテストが落ちる。
  リポジトリで実行しても `pdf/` は git status に出ない
- グラデーション文字（`bg-clip-text`）のまわりに、poppler 系のビューアだけ細い枠が
  見える。ghostscript で描くと出ないので、ビューアの描画のくせとして扱った

## 残ること

- 作業場所に `player.html` が無いと、`paths.set_root()` が同梱データ側の
  `player.html` へ落とし、そのページは同梱側の `slides/<名前>.js` を読む。
  同梱側に同じ名前があると、エラーにならずに違うスライドで PDF ができる
  （無ければ Playwright のトレースバック）。`video` も同じ開き方なので前から
  ある問題で、`ytslide init` した作業場所では起きない。直すなら `video`・`pdf`
  （と `check`）に共通の箇所で、別の項目にする（reviewer 報告の要修正 1・検討 4）

## 分担の振り返り

- implementer は指示どおり実装し、pytest・実際の書き出しまで済ませたが、
  文書の取りこぼし（`video`・`check` だけを挙げた箇所が 9 か所）は残した。
  reviewer はそれと、ページ数の数え方で 0 ページになる件、`player.html` が無い
  作業場所の件を実測で見つけた。verifier は食い違いを見つけなかった
- 見込みとの食い違いは無い。reviewer の指摘を main が直したので、main の
  output が見込みより増えた
- 次に同じ規模（新しいサブコマンド 1 つ + 文書）なら同じ編成でよい。ただし
  implementer の依頼に「`rg -n "video" README.md docs/` で、既存の
  サブコマンドを列挙している箇所を全部挙げて直す」と書く。文書の行番号を
  名指しした依頼は、名指ししなかった列挙を取りこぼす
