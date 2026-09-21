# TODO-093. `index.html` に `README.md` を載せる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | main が実装 + verifier + reviewer |
| 実施 | Opus 5 / effort high | main が実装 + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 6,016 | 19,174 | 53% |
| reviewer | Sonnet 5 | high | 13,309 | 50,831 | 28% |
| verifier | Sonnet 5 | medium | 8,634 | 38,053 | 20% |
| 合計 |  |  | 27,959 | 108,058 | 概算 $1.4 |

- reviewer・verifier は定義（`~/.claude/agents/`）のモデル・effort のまま。
  上書きしていない

## きっかけ

`index.html` は入口なのにスライドの一覧しか出ておらず、リポジトリの説明を
読むには GitHub 側へ回る必要があった。同じディレクトリに `README.md` が
あるなら、その中身も入口で読めるようにする。

置き場所は一覧の上。常に全文が出ていると一覧が下へ押し下げられるので、
畳めるようにする（既定は開いた状態）。

## やったこと

`index.html` だけを変えた。

- marked.js（cdnjs、12.0.2）を読み込み、`fetch('README.md')` の結果を
  `marked.parse()` で HTML にして差し込む
- 差し込み先は `<details id="readme" open>`。既定は `hidden` にしておき、
  README を読めたときだけ外す。読めなければ（404、`file://`、通信断）
  何も出さず、これまでどおりの見た目になる
- marked の出力向けの CSS を `#readme-body` の下に足した。見出し、段落、
  箇条書き、リンク、コード、`pre`、引用、表、`hr`、画像

`tools/make-index.py` は触っていない。書き換えるのはマーカーの間だけなので
影響しない。

ビルド時に Markdown を HTML へ変換して埋め込む案もあったが、`README.md` を
直すたびにスクリプトの実行が要るので採らなかった。

## 確かめたこと

verifier が Playwright（Chromium）で、`python3 -m http.server` 配信の
`index.html` を 1280x900 と 390x844 の 2 つの幅で開いて実測した。
スクリーンショットは `archives/agents/TODO-093/` にある。

- README あり: 一覧の上に中身が出る。`h1`・`ul`・`code`・`a`・`table` が
  それぞれ HTML の要素になっている
- 既定で開いた状態。`summary` のクリックで閉じ、もう一度で開く
- README 無し（`index.html` だけを別のディレクトリへ置いて配信）:
  `#readme` は `hidden` のままで、一覧の見た目は変わらない
- JS の例外は無し

reviewer のレビューは要修正 0 件。マーカーの範囲、CDN の書き方、CSS の
スコープ、コメントの文体を見て、`python3 tools/test_make_index.py` も
通ることを確かめた。

README が無いとき、Chrome がコンソールに `Failed to load resource: 404` を
残す。JS のエラーではなくブラウザのネットワークログで、fetch で存在を
確かめる設計では避けられないため、そのままにした。

## 分担の振り返り

- **reviewer** は要修正を見つけなかった。CSS が TODO に挙げた 4 種類
  （見出し・箇条書き・コード・リンク）より広いことを指摘した。指摘の
  とおりだが、任意の `README.md` を出すので引用や画像も来うると判断して
  残した。`tools/test_make_index.py` を自分で走らせてマーカーの無事を
  確かめたのは、静的な読み合わせで済まさなかった分だけ役に立った
- **verifier** は README 無しのときの 404 のコンソール出力を見つけた。
  実機で開かなければ出てこない。要素の個数も数えており、依頼に測り方まで
  書いたぶんは返ってきた
- 見込みと食い違いは無い。`index.html` 1 ファイル・39 行の追加に対して
  reviewer と verifier で料金の 48% を使ったが、404 の件は実測でしか
  出なかったので verifier は外せない
- **次に同じ規模（1 ファイル・数十行・分岐 1 つ）をやるなら、同じ組み方で
  よい。ただし reviewer には差分そのものだけを渡し、規約のファイルを
  読み直させない**（今回 reviewer が verifier より高く付いたのは、
  `CLAUDE.md` 系を広く読んだ分。見てほしい観点を列挙してあるので、
  規約の読み直しは要らないと依頼に書く）
