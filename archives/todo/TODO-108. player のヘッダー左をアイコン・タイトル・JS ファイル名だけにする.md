# TODO-108. player のヘッダー左をアイコン・タイトル・JS ファイル名だけにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 5,329 | 52,373 | 82% |
| verifier | Sonnet 5 | medium | 5,569 | 32,265 | 18% |
| 合計 |  |  | 10,898 | 84,638 | 概算 $1.4 |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま sonnet / medium

## きっかけ

ヘッダーの左に、バッジ「AI Presentation Video」と説明文
「インタラクティブ・プレゼンテーション動画プレイヤー」が並んでいた。
どちらも場所を取るだけで、見る人には要らない。
どのスライドを開いているかは、タイトルよりファイル名のほうが確かめやすい。

## やったこと

`player.html` の 2 箇所だけを変えた。

- `<header>`: バッジの `<span>` と説明文の `<p>` を削除。`<h1>` から
  `flex` の入れ子を外して `id="slides-heading"` を直接持たせ、その下に
  `id="slides-file"` の `<p>` を置いた。`hidden sm:block` を付けないので
  狭い画面でも出る。長い文字列は親の `min-w-0` と `truncate` で省略する
- `startApp()`: `#slides-file` に `slides/${slidesName}.js` を入れる。
  `slidesName` は `?slides=` を読んだときのグローバル変数をそのまま使う

## 確かめたこと

verifier が Playwright（chromium）で実測した。報告は
[archives/agents/TODO-108/verifier-report.md](../agents/TODO-108/verifier-report.md)。

既定（`slides/readme.js`）と `?slides=user` を、1280x800 と 375x667 の
4 通りで開き、いずれも次を確認した。

- ヘッダー左はアイコン・スライドタイトル・ファイル名だけ
- `AI Presentation Video` と「インタラクティブ・プレゼンテーション動画
  プレイヤー」は `body.innerText` に含まれない
- ファイル名は実際に読み込んだファイルと一致
- 横スクロールは出ない（`scrollWidth` == `clientWidth`）。
  右側のボタン類との重なり・はみ出しも無い
- コンソールエラーは無し

狭い画面ではタイトルが `truncate` で省略されるが、ファイル名は全文出る。

## 分担の振り返り

- verifier は食い違いを 1 件も見つけなかった。2 箇所の書き換えで、
  どちらも表示だけを変えるものだったので、想定の範囲
- 見込みと食い違いは無い。$1.4 で、うち main が 82%
- 次に同じ規模（HTML の見た目だけを数行変える）なら、同じ組み方でよい。
  実装を分けると依頼文を書く分だけ高くつく。確認は分けたままにする
