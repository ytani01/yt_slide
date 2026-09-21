# TODO-093 verifier report

## 方法

`python3 -m http.server` を 2 本立てて実測した。

- port 8093: リポジトリのルート（`README.md` あり）
- port 8094: `index.html` だけをコピーした別ディレクトリ（`README.md` 無し）

Playwright（`/tmp/verify064/node_modules/playwright`。既存インストールを流用）
の Chromium で、1280x900 と 390x844 の両方を開き、要素数・console イベント・
スクリーンショットを取得した。スクリプトは
`archives/agents/TODO-093/`（本レポートと同じ場所）には置いていないが、
`/tmp/claude-649/.../scratchpad/todo093/test.js` に残っている
（セッション限りの一時領域なので、再実行したい場合は同内容を作り直すこと）。

## 1. README.md のレンダリング（一致）

1280x900、`#readme-body` の要素数（実測）:

```
h1: 1, h2: 8, ul: 3, ol: 0, code: 63, a: 6, table: 2
```

`README.md` 本文を `grep` で数えた見出し・箇条書き・表の行数
（`^# `=1, `^## `=8, `^\* \|^- `=10, `^|`=23 行）と矛盾しない
（`ul` はリストのタグ数、`grep` は行数なので単純比較はできないが、
h1=1・h2=8・table=2 は一致した）。スライド一覧（`<ul class="space-y-3">`）
より上に `#readme` が出ており、指示どおりの位置。

## 2. details の開閉（一致）

- 初期状態: `detailsOpen: true`（`open` 属性あり）、`readmeHidden: false`
- `summary` を 1 回クリック: `open` 属性が外れる（`afterClickClose: false`）
- もう一度クリック: `open` 属性が戻る（`afterClickReopen: true`）

スクリーンショットでも見た目が閉じる・開くのを確認した
（`1280-with-readme-open.png` / `1280-with-readme-closed.png` /
`1280-with-readme-reopened.png`）。

## 3. README.md が無いとき（一致・ただし注記あり）

`#readme` は `hidden` のまま（`classList.contains('hidden') === true`）。
`open` 属性自体は HTML に静的に書かれているので残るが、`hidden` が効いて
画面には出ない。スクリーンショット（`1280-no-readme.png`）は
`1280-with-readme-closed.png`（README を畳んだ状態のスライド一覧部分）と
見比べて、スライド一覧の見た目・並びは変わっていない。

## 4. コンソールエラー（食い違いあり）

- README ありのケース（1280/390 とも）: コンソールエラーは 0 件。
- README 無しのケースでは、両方の画面幅で以下が 1 件ずつ出た。

```
Failed to load resource: the server responded with a status of 404 (File not found)
```

これは `fetch('README.md')` が 404 を返したときに、Chrome が
devtools のコンソールへ出すネットワークレベルのログで、
`.catch(() => {})` で握りつぶした後もこのログ自体は消えない
（JS の例外ではなく、ブラウザがリソース読み込み失敗を記録する仕組みのため）。
指示の「3 でもエラーが出ないこと」は厳密には満たしていない。

ただし、`fetch()` で存在確認する設計を採る限りこの 404 ログは
avoid できない（`README.md` の有無を事前に判定する手段が無いため）。
実害（表示崩れやスクリプト停止）は無い。これが許容範囲かどうかは
判断が要る点として報告する。

## 変更ファイル

`git status --porcelain` は次のみ:

```
 M index.html
?? archives/agents/TODO-093/
```

`index.html` の差分は `<script src=".../marked.min.js">` の追加、
README 表示用の CSS、`<details id="readme">` ブロック、末尾の
fetch スクリプトのみ。`tools/make-index.py` は変更されておらず、
指示どおり触れていない。差分の範囲は TODO-093 の指示と一致する。

## 確かめられなかったこと

- `marked.min.js` を cdnjs から読めない環境（オフライン、CSP 制限など）
  での挙動は確かめていない（指示の範囲外と判断した）。
- テーブルの罫線やコードブロックの折り返しなど、細かいスタイルの
  「好み」については見ていない（デザインの良し悪しは見なくてよいと
  指示されているため）。

## スクリーンショット

`archives/agents/TODO-093/` に保存:

- `1280-with-readme-open.png` / `1280-with-readme-closed.png` /
  `1280-with-readme-reopened.png`
- `390-with-readme-open.png`
- `1280-no-readme.png` / `390-no-readme.png`

目視で欠け・文字化け・余計な要素は無いことを確認した。
