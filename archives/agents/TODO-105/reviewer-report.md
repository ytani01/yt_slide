# TODO-105 reviewer 報告

対象: `git diff -- README.md docs/User.md slides/readme.js slides/user.js`。
`TODO.md` の TODO-105 節、`CLAUDE.md`、依頼書、CLI とプレイヤーの実装、
関連する既存ガイドを照合した。コード・文書は変更していない。

## 要修正

### 1. コピー方式の後に `ytslide index` を使うと、案内どおりでは失敗する

- **重大度: 中**
- **箇所:** `docs/User.md:39-48`、`docs/User.md:109-116`
- **問題:** コピー方式で用意するのは `player.html` と
  `slides/template.js` だけだが、後から CLI を使う場合について
  「`init` のやり直しは不要」と一律に案内している。その後の
  「一覧から開きたいとき」は `ytslide index` だけを実行させているため、
  コピー方式から一覧生成へ進んだ利用者は手順どおりに完了できない。
- **根拠:** `src/ytslide/index.py:99-103` の `build_index()` は
  `index.html` が無いと
  「`ytslide init` でディレクトリを初期化してから実行する」という
  `ClickException` を出す。`ytslide init` は既存の `player.html` と
  `slides/template.js` を上書きせず、足りない `index.html` を作れる
  （`src/ytslide/cli.py:29-34, 60-78`、
  `tests/test_cli.py:58-93`）。したがって、コピー対象に `index.html` を
  含めるか、一覧を使う場合だけ `init` が必要だと案内する必要がある。

## 検討

### 2. CLI 方式では AI に渡す `docs/User.md` の入手元が手順中に無い

- **重大度: 低**
- **箇所:** `docs/User.md:17-37`、`docs/User.md:89-105`
- **問題:** 先に示す CLI 方式は `ytslide init` で始めるが、その出力は
  `player.html`、`index.html`、`slides/template.js` であり
  `docs/User.md` は含まれない。一方、AI の手順は「展開したリポジトリの
  `docs/User.md`」を渡すよう求めるため、ZIP を展開していない CLI 方式の
  利用者は、その資料をどこから入手するか手順だけでは分からない。
- **根拠:** 実装の生成物は `src/ytslide/cli.py:56-78`、既存の説明も
  `docs/User.md:28-33` の 3 ファイルだけで一致している。README には
  `docs/User.md` へのリンクがあるので回避はできるが、TODO-105 が求める
  「必要な資料」と「途切れずに辿れる手順」としては、この箇所だけ
  ZIP 展開を前提に切り替えている。実害の大きさは未確認。

## 問題が無かった点

- README は入口、詳細は `docs/User.md`、公開は必要ファイルと共有 URL の
  短い案内、という分担を保っている。公開先サービス別の説明は増えていない。
- README の「再生にはインストール不要」と、コピー・編集だけの場合、
  CLI が必要な一覧生成・測定・HTTP 配信・動画出力の区別は、CLI 実装と一致する。
- ZIP の入手先、README の断片例から完全な最小例へのリンク、AI の依頼文、
  出力先と確認方法、公開するファイルと URL、ネット接続・声・音声エラーの
  案内は存在し、リンク先の見出しも確認できた。
- `slides/readme.js` と `slides/user.js` の変更は、README とガイドで追加した
  「再生時はインストール不要」「ZIP から試す」「コピー方式もある」という
  説明と矛盾しない。指示外の機能変更は無い。
- `git diff --check -- README.md docs/User.md slides/readme.js slides/user.js` は通過した。
  main から `uv run pytest` が 26 passed と報告を受けたが、reviewer では
  再実行していない。

## 未確認

- 変更したナレーションの `duration` は据え置き。Online Voice で時間内に
  収まるかは未確認。表示、リンク遷移、読み上げ、画面幅ごとの欠けを含む
  ブラウザでの再現は、依頼どおり後続 verifier の担当とした。

## 指摘反映後の再確認

2026-09-22 に、上記 2 件に対する `docs/User.md` の追加差分だけを再確認した。

- **指摘 1 は解消。** `docs/User.md:47-49` は、コピー方式の後で CLI を
  導入するときに `cd ~/my-slides`、`ytslide init` の順で実行する案内へ
  変わった。`src/ytslide/cli.py:60-78` のとおり既存のプレイヤーと型は
  上書きせず、不足する `index.html` を作って一覧も生成するため、後続の
  `ytslide index` を実行できる状態になる。
- **指摘 2 は解消。** `docs/User.md:92-98` に raw Markdown へのリンクと、
  ブラウザから保存または内容をコピーする方法、ZIP 内のファイルを使う方法が
  加わった。CLI 方式と ZIP 方式のどちらでも、AI に渡す `docs/User.md` の
  入手元を手順中で特定できる。
- 追加差分に新しい問題は見つからなかった。`git diff --check -- docs/User.md`
  は通過した。ブラウザでのリンク遷移と raw Markdown の取得は verifier の
  担当であり、reviewer では未確認。
