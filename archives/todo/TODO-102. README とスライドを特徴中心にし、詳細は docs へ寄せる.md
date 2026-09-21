# TODO-102. README とスライドを特徴中心にし、詳細は docs へ寄せる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | reviewer + verifier |
| 実施 | Opus 5 / effort high | reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 21,028 | 41,326 | 60% |
| reviewer | Sonnet 5 | high | 18,341 | 85,552 | 23% |
| verifier | Sonnet 5 | medium | 13,287 | 67,470 | 17% |
| 合計 |  |  | 52,656 | 194,348 | 概算 $3.5 |

- reviewer・verifier とも `~/.claude/agents/` の定義のまま（モデルの上書きはしていない）。
  effort は定義の frontmatter の値

## きっかけ

README.md が 191 行、`slides/readme.js` が 10 枚あり、どちらも細かすぎた。
README は大きな特徴とアピールが主で、細かい説明は他の文書に任せる。

`docs/User.md` に「手順」（作業場所の用意、最初の 1 枚、一覧、測定、HTTP
での確認、公開、動画）が、`docs/Developer.md` に「リポジトリの構成」が
既にあり、README の後半はその重複になっていた。

## やったこと

- `README.md` を 191 行から 77 行にした。残したのは「できること」
  「すぐ試す」「入っているスライド」「自分のスライドを作る」（入口だけ）
  「インストール」「説明」。「必要なもの」「自分のスライドを作る」の手順、
  「ファイル構成」「動画に書き出す」と `ytslide` のサブコマンド表は落とし、
  docs へのリンクに置き換えた
- `docs/User.md` に「`ytslide` のサブコマンド」節を新設し、サブコマンドの表と
  「測定と動画に要るパッケージ」（`curl`・`ffmpeg`・Playwright の導入）を
  そこへ移した。README の `#必要なもの` を指していた 3 か所のリンクを、
  同じファイル内の `#測定と動画に要るパッケージ` へ張り替えた
- `docs/Developer.md` の「リポジトリの構成」の表に、README の「ファイル構成」
  表にしか無かった 6 行（`index.html`・`docs/`・`pyproject.toml`・`TODO.md`・
  `archives/`・`CLAUDE.md`）を足した
- `slides/readme.js` を 10 枚から 6 枚にした。`slides/user.js` と担当が重なる
  4 枚（slidesConfig と slideData／1 枚の要素／`render()` の書き方／
  `duration` の測り方）を落とし、「自分のスライドを作る」の枚に user の
  スライドと `docs/User.md` へのリンクを足した。narration を変えたので
  `ytslide measure --slides readme --all --write` で測り直した
  （4 枚目が 9 → 14 秒）

「インストール」を README に残したのは、前提になるパッケージは README に
書いて他の文書から指す、と TODO-067 で決めていたため。`#インストール` を
指す 4 か所のリンクはそのまま使える。

## 確かめたこと

- reviewer（Sonnet 5 / effort high）が、削除前の README（`git show HEAD:README.md`）
  と移した先を突き合わせた。要修正 0 件。「`index.html` の説明が README から
  完全に消えた」という指摘を受け、「すぐ試す」に一覧から選べる旨の 1 行を戻した
- verifier（Sonnet 5 / effort medium）が Playwright で
  `file://…/player.html?slides=readme` を 1280x720 と 390x844 の 2 サイズで開き、
  6 枚すべてのスクリーンショットを撮って確認。枚数表示は `01/6`〜`06/6`、
  はみ出し・重なり・見切れ・空の枠なし、コンソールエラー 0 件。4 枚目の
  2 つのリンクは実際に動作（GitHub の URL は 200）。README・`docs/User.md`・
  `docs/Developer.md` 間のアンカーはすべて実在する見出しを指していた。
  `uv run pytest` は 26 passed
- スクリーンショットは `~/tmp/playwright-mcp/TODO-102-readme-<番号>-<幅>.png`

## 見送ったもの

- `video/readme.mp4` の作り直し。`.gitignore` に入っておりリポジトリには
  無いので、要るときに `ytslide video --slides readme` で作り直せばよい

## 分担の振り返り

- **reviewer** は、README から消えて docs にも残らなかった記述として
  `index.html` の説明を 1 件見つけた。移す元と移した先の突き合わせは、
  書いた本人（main）には「同じことが docs にある」で流れてしまうところで、
  分けた効果が出た。あわせて、main が「できること」に足した
  「チャプター一覧の検索」が項目の指示に無い加筆だと指摘した（残す判断をした）
- **verifier** は食い違いを 0 件で返した。スライドを 4 枚落とす変更で
  枚数表示や残りの枚の崩れが出ていないことを、2 つの画面サイズの実物で
  確かめた点に意味があった
- 見込み（Opus 5 / reviewer + verifier）と実施は食い違わなかった。
  文書だけの項目だが、README と docs に同じ主張が 2 か所ある状態を
  片付ける作業だったので reviewer を外さなかったのは当たりだった
- 次に同じ規模（文書の整理と、スライドの枚数を減らす項目）をやるなら、
  同じ組み方でよい。ただし reviewer への依頼には「削除前の版を
  `git show HEAD:<file>` で取り出して突き合わせる」と最初から書く。
  今回は書いたので初手から突き合わせに入れた。書かないと差分だけを
  読んで「消えた情報」を見落とす
