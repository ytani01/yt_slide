# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 構成

`player.html`（外枠と再生エンジン）、`index.html`（スライドの一覧。入口。
`ytslide index` が `slides/*.js` から生成する）、`slides/*.js`（スライドのデータ。
`readme`・`user`・`developer`・`claude-memo`・`template` の 5 つのスライド一式）。
**プレイヤー側（`player.html` と `slides/*.js`）はビルドも依存関係のインストールも
不要**で、ブラウザで開くだけで動く。インストールが要るのは、`duration` を測る・
`index.html` を作り直す・動画に書き出す `ytslide`（`src/ytslide/`）だけ
（`uv tool install`。README の「インストール」）。
テストは `tests/` の 4 本（`test_cli`・`test_index`・`test_measure`・`test_video`。
`uv run pytest`）。
配置場所が `public_html/` なので、ファイルがそのまま公開される。
確認はブラウザで `player.html` を開くだけ。

日本語のスライドをナレーション付きで自動再生するプレイヤーページ。
`player.html` は `?slides=<名前>` で `slides/<名前>.js` を読む（既定は `readme`）。
`claude-memo` は「Claude Code の使い方」を紹介するスライド一式。

## 触る前に読むもの

**中身の説明は `docs/` にある。ここには写しを置かない**（二重管理を避ける
ため。TODO-043）。

- **`player.html` を直すなら [`docs/Developer.md`](docs/Developer.md)。**
  再生ロジックと `duration` の決まり、読み上げの 2 系統と安全タイマー、
  container query と狭い画面の縮小経路、擬似フルスクリーン、副作用のある
  変更など。**直す前に必ず目を通すこと**
- **スライドを足す・作るだけなら [`docs/User.md`](docs/User.md)。**
  `slides/<名前>.js` の書き方と `duration` の測り方

個々の変更の経緯は `archives/todo/` にある。`docs/` は利用者向けなので
TODO 番号を書かない。番号で参照してよいのはこのファイルと `archives/` の中だけ。
