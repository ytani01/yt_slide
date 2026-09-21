# yt_slide

**スライドは JavaScript ファイル 1つ。ただし 1 から書かなくていい。**

スライドを順に映しながら読み上げ、字幕を出し、時間どおりに次へ進む。
中身は `slides/<名前>.js` に書く。19種類のテンプレートをコピーして
差し替えるか、テンプレートとガイドを AI に渡して書いてもらう。書けたら
`player.html` と 2つ並べて Web サーバーに置き、URL を渡すだけ
（見る側に要るのはブラウザだけ）。

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

**[動いているところを見る](https://ytani01.github.io/yt_slide/)** —
何も入れずに、このリポジトリのスライドをそのまま再生できる。

手元で試すなら、[リポジトリの ZIP](https://github.com/ytani01/yt_slide/archive/refs/heads/main.zip)
をダウンロードして展開し、中の `player.html` をブラウザで開く。サーバーを立てる必要はない。
ファイルを直接開いた `file://` でも、表示から読み上げまで動く
（表示にも読み上げにもネット接続は要る）。

`player.html?slides=<名前>` で `slides/<名前>.js` を読む。`?slides=` を省くと
このリポジトリの紹介（`slides/readme.js`）が流れる。
同じディレクトリを開くと、スライドの一覧（`index.html`）から選べる。

声は相手の端末によって異なる（[声の選び方](docs/User.md#読み上げの声を選ぶ)）。
音が出ないときは消音と端末の音量を確認し、
[音声の再試行・切り替え](docs/User.md#音が出ないとき)を試す。

## 入っているスライド

| 名前 | 中身 |
|--------|------|
| `readme` | このリポジトリの紹介（既定） |
| `user` | スライドの作り方 |
| `developer` | `player.html` の作り |
| `claude-memo` | 実例。「私の Claude Code の使い方」17枚 |
| `template` | スライドのテンプレート 19種。コピーして使う |

`docs/` の説明と、同じ内容をスライドでも見られる。

## 自分のスライドを作る

**[用意する](docs/User.md#1-自分の作業場所を用意する) →
[テンプレートや AI で作る](docs/User.md#2-最初の-1枚を書いて再生する) →
[手元で確認する](docs/User.md#3-編集して確かめる) →
[公開先に置く](docs/User.md#他のサーバーへ持っていくとき) →
[URL を渡す](docs/User.md#公開)。**

**`player.html` は触らず、`slides/<名前>.js` を 1つ足すだけ。**
1枚は、題名・読み上げる文章・本文を並べただけのもの。次は 1枚分の断片で、
保存して動くファイル全体は [ガイドの「最小の例」](docs/User.md#最小の例)にある。

```js
{
    title: 'はじめに',
    duration: 5,
    narration: 'これはサンプルのスライドです。',
    body: '<p>本文はここに書く</p>',
}
```

**1 から書かなくてよい。** 表紙、箇条書き、2カラム比較、表、図解、引用、
時系列、Q&A など、
**[19種類のテンプレート](https://ytani01.github.io/yt_slide/player.html?slides=template)**
が `slides/template.js` に入っている。近いテンプレートをまるごとコピーして、
題名・読み上げる文章・本文を差し替えるのが早い。

**AI に書かせてもよい。** 渡すのは 3つ —
`slides/template.js`（テンプレート 19種）、
[docs/User.md](docs/User.md)（書式の説明）、スライドにしたい原稿や資料。
作りたい内容を伝えれば `.js` を書いてくれる（このリポジトリのスライドも
そうやって作った）。そのまま使える
[依頼文の例と、保存・確認の手順](docs/User.md#ai-に作ってもらう)がガイドにある。

手順は [docs/User.md の「手順」](docs/User.md#手順)にある。作業場所の用意、
一覧の生成、読み上げ秒数の測定、HTTP での確認、公開と動画への書き出しまで、
そこにまとめてある。

公開するときは `player.html` と `slides/<名前>.js`（画像を使う場合は画像も）を
同じ位置関係で置き、相手に `https://<公開先>/player.html?slides=<名前>` を渡す。
一覧も置く場合の説明は [ガイドの「公開」](docs/User.md#公開)へ。

## インストール

**見るだけならブラウザだけ。** インストールは要らない（ネット接続は要る）。

ファイルのコピー・編集とブラウザでの確認だけなら、Python・uv・`ytslide` は不要。
公開先にもこれらを入れる必要はない。

作業場所をコマンドで用意する、一覧を生成する、読み上げ秒数を測る、HTTP で確認する、
動画に書き出す場合は `ytslide` CLI を使う。
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

## ライセンス

MIT License。[LICENSE](LICENSE) にある。
