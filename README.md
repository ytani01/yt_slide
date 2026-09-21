# yt_slide

**ファイル 2 つを置くだけで、ナレーション付きのプレゼンが動く。**

スライドを順に映しながら読み上げ、字幕を出し、時間どおりに次へ進む。
ビルドもインストールも不要。`player.html` と `slides/<名前>.js` を
Web サーバーに置けば、URL を渡すだけで見てもらえる。

## できること

- **読み上げ**。Google Translate TTS とブラウザの Web Speech API を
  ボタンで切り替えられる
- **字幕**。ナレーションの全文を画面下に出す。消すこともできる
- **自動再生**。読み終わると数秒待って次へ。待ち時間は 1〜3 秒から選べる
- **再生速度** 0.75〜2.0 倍。進行バーと残り時間は実際の再生時間に追従する
- **フルスクリーン**、前後送り、頭出し、チャプター一覧の検索
- **スマホ対応**。左右のスワイプでスライドを送り、タップで再生・一時停止
- **MP4 への書き出し**。URL を渡せない相手には動画と `.srt` で渡せる

## すぐ試す

`player.html` をブラウザで開くだけ。サーバーを立てる必要はない。
ファイルを直接開いた `file://` でも、表示から読み上げまで動く
（表示にも読み上げにもネット接続は要る）。

`player.html?slides=<名前>` で `slides/<名前>.js` を読む。`?slides=` を省くと
このリポジトリの紹介（`slides/readme.js`）が流れる。
同じディレクトリを開くと、スライドの一覧（`index.html`）から選べる。

## 入っているスライド

| 名前 | 中身 |
|--------|------|
| `readme` | このリポジトリの紹介（既定） |
| `user` | スライドの作り方 |
| `developer` | `player.html` の作り |
| `claude-memo` | 実例。「私の Claude Code の使い方」17 枚 |
| `template` | スライドの型の見本 19 種。コピーして使う |

`docs/` の説明と、同じ内容をスライドでも見られる。

## 自分のスライドを作る

**`player.html` は触らず、`slides/<名前>.js` を 1 つ足すだけ。**
題名・読み上げる文章・本文の HTML を書けば 1 枚になる。

手順は [docs/User.md の「手順」](docs/User.md#手順)にある。作業場所の用意、
一覧の生成、読み上げ秒数の測定、HTTP での確認、公開と動画への書き出しまで、
そこにまとめてある。

## インストール

**見るだけならブラウザだけ。** インストールは要らない（ネット接続は要る）。

自分のスライドを作るときは `ytslide` CLI を使う。
[uv の公式手順](https://docs.astral.sh/uv/getting-started/installation/)で
`uv` を入れ、次を実行する。Python 3.13 以上が必要。

```bash
uv tool install 'git+https://github.com/ytani01/yt_slide'          # video 以外
uv tool install 'git+https://github.com/ytani01/yt_slide[video]'   # video も使う
```

リポジトリのチェックアウトからなら `uv tool install '.[video]'`。
`video` は Playwright（chromium）が重いので、既定の install には含めず
extra に分けている。

サブコマンドの一覧と、測定・動画の書き出しに要るパッケージは
[docs/User.md の「`ytslide` のサブコマンド」](docs/User.md#ytslide-のサブコマンド)にある。

## 説明

- [docs/User.md](docs/User.md) — **スライド作成者向け。**
  `player.html` は編集せず、`slides/<名前>.js` を足す手順
- [docs/Developer.md](docs/Developer.md) — **開発者向け。**
  全体の作り、再生ロジック、読み上げ、レイアウトの設計。
  リポジトリの構成もこちら
