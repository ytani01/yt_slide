# TODO-087. GitHub Pages で公開する

|        | main                 | 担当     |
|--------|----------------------|----------|
| 見込み | Opus 5 / effort high | verifier |
| 実施   | Opus 5 / effort high | verifier |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 32,782 |         90,808 | 95%        |
| verifier | Sonnet 5 | medium |  7,377 |         36,798 | 5%         |
| 合計     |          |        | 40,159 |        127,606 | 概算 $4.3  |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま。モデルも effort も上書きしていない

## きっかけ

`index.html` を GitHub Pages で公開したい、という話から。

リポジトリは素の静的ファイル（`index.html`、`player.html`、`slides/`、
`images/`）だけで、参照はすべて相対パス。ビルドも要らないので、GitHub 側で
公開元を指定するだけで済むはずだった。

公開元は `develop` のルートにした。`main` は 33 コミット遅れており、公開の
たびにマージする手間を増やさないため。`develop` はこのリポジトリの
デフォルトブランチでもある。

## やったこと

Pages を有効にした（`gh api -X POST repos/ytani01/yt_slide/pages`、
`source[branch]=develop`、`source[path]=/`）。公開先は
https://ytani01.github.io/yt_slide/ 。

ところがビルドが `Page build failed.` で失敗した。3 回走らせて 3 回とも
失敗している。

| ビルド | 作成 | 結果 |
|---|---|---|
| 1 回目（有効化） | 19:47:55 UTC | errored |
| 2 回目（自動） | 19:58:22 UTC | errored |
| 3 回目（手で蹴り直し） | 20:00:00 UTC | errored |

ブランチ公開（legacy）方式はビルドログが API からもブラウザからも取れず、
`Page build failed.` 以上の情報が出ない。原因の直接確認はできなかった。
Liquid 構文（`{{` `{%`）との衝突は調べたが、引っかかったのは画像 4 件だけで、
中身がバイナリなので Jekyll の処理対象外だった。GitHub 全体の障害でもない
（githubstatus は All Systems Operational）。

**リポジトリのルートに空の `.nojekyll` を置いた。** これで Jekyll の処理を
丸ごと飛ばし、静的ファイルをそのまま配信する。原因を特定しなくても、この手の
失敗をまとめて回避できる。

置いた直後のビルド（4 回目、コミット `4fd8ad6`）は 17.0 秒で `built` になり、
トップが HTTP 200 を返した。`.nojekyll` が効いたことは、無しの 3 回が
すべて失敗し、置いた 1 回目で成功したことから分かる。

## 確かめたこと

verifier が Playwright（headless Chromium、1280x800）で実機確認した。
報告は `archives/agents/TODO-087/verifier-report.md`、計測スクリプトは
同じディレクトリの `check-pages.js.txt`。

- トップに描画されたスライド一覧のリンクは 5 個で、`index.html` の
  `player.html?slides=` の数・順序・値と一致
- readme のリンクをクリックすると `player.html?slides=readme#1` へ遷移し、
  本文が描画される
- 5 つのスライド（readme / user / template / developer / claude-memo）すべてで
  本文が空でなく、「スライドのデータ … を読み込めませんでした」の文言も出ない
- コンソールエラー、pageerror、HTTP 400 以上のレスポンスは全ページで 0 件。
  `slides/*.js` と `images/*` も 200 で取れている
- スクリーンショット 2 枚（トップと readme）は不透明で、欠けや余計な要素は無い

音声再生（TTS）はヘッドレスで鳴らないため対象外。レイアウトの余白・
フォントサイズの測り直しも依頼から外した。

## 分担の振り返り

- **verifier が見つけたもの**: 食い違いは 1 件も無かった。ただし
  「確かめなかったこと」に `claude-memo` の遷移・本文確認を挙げてきたのは
  有効だった。こちらの依頼文が readme / user / template / developer の
  4 つしか名指ししておらず、5 つ目が漏れていた。報告を受けて同じ担当に
  続けて頼み、`claude-memo` も本文 623 文字・エラー 0 件を確認している
- **見込みと食い違った点**: 見込み（main = Opus 5 / effort high、担当 =
  verifier）はそのまま実施できた。食い違ったのは項目の中身のほうで、
  立てた時点では「3 回目のビルドが成功したら `.nojekyll` は不要」と
  書いていたが、3 回目も失敗して不要にはならなかった
- **次に同じ規模の項目をやるなら**: 確認の対象は**ファイルを列挙せず
  `grep` のコマンドで渡す**（`~/.claude/CLAUDE.md` に既にある規則）。
  今回まさに列挙して 1 件漏らした。`grep -o 'slides=[a-z-]*' index.html`
  と書いて渡せば、担当が自分で 5 つを数えられた。担当を立て直さず同じ
  担当に続けて頼んだ判断は正しく、計測スクリプトを組み直させずに済んでいる。
  reviewer を立てなかったのも妥当で、空ファイル 1 つで分岐は変わっていない

## 残ること

`main` ブランチは公開に使っていない。公開版と作業版を分けたくなったら、
`main` へマージして公開元を切り替える必要がある。

Actions ワークフロー方式（`build_type: workflow`）への切り替えは見送った。
ビルドログが見えるようになる利点はあるが、`.nojekyll` で公開できた以上は
要らない。切り替えるなら、`archives/` 17MB を配信対象から外す設定が別に要る。
