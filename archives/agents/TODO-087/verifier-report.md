# TODO-087 verifier report

対象: https://ytani01.github.io/yt_slide/ （develop ブランチのトップ、コミット 4fd8ad6）

手段: Playwright (headless Chromium, 1280x800) をスクリプトで操作。curl による
静的な読み合わせはしていない。スクリプトは `archives/agents/TODO-087/check-pages.js.txt`
に保存。

## 1. トップのリンク数

`index.html` に埋め込まれた `player.html?slides=` は 5 個
（`readme`, `user`, `template`, `developer`, `claude-memo`）。
実機で描画されたリンクも 5 個、同じ順序・同じ slides 値で一致。

## 2. コンソールエラー・失敗リクエスト

トップ、readme クリック後、readme/user/template/developer 直接アクセスの
いずれでも、コンソールエラー・pageerror・HTTP 400 以上のレスポンスは
**0 件**（JSON の `consoleErrors` / `failedRequests` はすべて空配列）。
`slides/*.js` と `images/*` を含め、200 以外の応答は観測しなかった。

## 3. readme リンクのクリック遷移

トップで readme のリンクをクリックすると
`https://ytani01.github.io/yt_slide/player.html?slides=readme#1` へ遷移。
期待どおり。

## 4. readme 本文の描画

クリック後の `document.body.innerText` は 432 文字、
「yt_slide の紹介」「ファイル２つで、ナレーション付きのプレゼンが動き出す」
などの見出し・本文が確認できた。
「読み込めませんでした」という文言は含まれない（`hasErrorMsg: false`）。

## 5. user / template / developer への直接 URL アクセス

| slides | title | body 文字数 | エラー文言 | consoleErrors | failedRequests |
|---|---|---|---|---|---|
| readme | yt_slide - ファイル 2 つで動くナレーション付きプレゼン | 432 | なし | 0 | 0 |
| user | player.html で別のスライドを作る - 使い方 | 585 | なし | 0 | 0 |
| template | テンプレート | 456 | なし | 0 | 0 |
| developer | player.html を直す人へ - 開発者向けガイド | 444 | なし | 0 | 0 |
| claude-memo | Claude Code 活用法 - プレゼン動画プレイヤー | 623 | なし | 0 | 0 |

いずれも本文が空でなく、読み込み失敗の文言も出ていない。

## 6. スクリーンショット

- `~/tmp/playwright-mcp/TODO-087-pages-top.png`（1280x800）
- `~/tmp/playwright-mcp/TODO-087-pages-readme.png`（1280x800）

目視確認: 両方とも不透明で、欠けている領域や余計な要素は無い。
トップはカード 5 枚（readme/user/template/developer/claude-memo）が
縦に並んで全て表示されている。readme はヘッダー・スライド本文・
チャプター一覧・再生コントロールが揃って描画されている。
（デザインの良し悪しは評価していない）

## 検証コマンドの終了コード

Node スクリプトは正常終了（exit code 0）。

## 確かめなかったこと

- 音声再生（TTS）: 指示により対象外
- レイアウトの余白・フォントサイズの測り直し: 指示により対象外

## 変更ファイル

`git status` はクリーン。今回の作業でリポジトリ側のファイルは変更していない
（このタスクは実機確認のみ）。
