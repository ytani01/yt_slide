# yt_slide

**ファイル 2 つを置くだけで、ナレーション付きのプレゼンが動く。**

スライドを順に映しながら読み上げ、字幕を出し、時間どおりに次へ進む。
動画に書き出す必要はない。Web サーバーに置けば、URL を渡すだけで
見てもらえる。その URL でディレクトリを開くと、スライドの一覧
（`index.html`）が出る。

ビルドもインストールも不要。`player.html` と `slides/`（画像を使うなら
`images/` も）を Web サーバーに置くだけで公開できる。

## できること

- **読み上げ**。Google Translate TTS とブラウザの Web Speech API を
  ボタンで切り替えられる
- **字幕**。ナレーションの全文を画面下に出す。消すこともできる
- **自動再生**。読み終わると数秒待って次へ。待ち時間は 1〜3 秒から選べる
- **再生速度** 0.75〜2.0 倍。進行バーと残り時間は実際の再生時間に追従する
- **フルスクリーン**、前後送り、頭出し
- **スマホ対応**。左右のスワイプでスライドを送り、タップで再生・一時停止

## すぐ試す

`player.html` をブラウザで開くだけ。サーバーを立てる必要はない。
ファイルを直接開いた `file://` でも、表示から読み上げまで動く。

`player.html?slides=<名前>` で `slides/<名前>.js` を読む。`?slides=` を省くと
このリポジトリの紹介（`slides/readme.js`）が流れる。

自分のスライドを作るときは、下の[「自分のスライドを作る」](#自分のスライドを作る)へ進む。

## インストール

**見るだけならブラウザだけ。** インストールは要らない（ネット接続は要る）。

自分の作業場所を用意する手順では、`ytslide` CLI を使う。
[uv の公式手順](https://docs.astral.sh/uv/getting-started/installation/)で
`uv` を入れ、次を実行する。Python 3.13 以上が必要。

```bash
uv tool install 'git+https://github.com/ytani01/yt_slide'          # video 以外
uv tool install 'git+https://github.com/ytani01/yt_slide[video]'   # video も使う
```

| サブコマンド | 使う場面 |
|--------------|----------|
| `ytslide init` | 最初に、自分の作業ディレクトリへプレイヤーと型の見本を用意する |
| `ytslide index` | 一覧から開きたいとき、`slides/*.js` から `index.html` を作り直す |
| `ytslide measure` | 読み上げ秒数だけを測る。`--write` で `duration` に書き戻せる |
| `ytslide update` | 時間表示を合わせる仕上げに、`measure --all --write` と `index` を続けて実行する |
| `ytslide web` | HTTP で確認したいとき、作業ディレクトリを配信する（ブラウザは自分で開く） |
| `ytslide video` | 動画で渡したいとき、MP4 と `.srt` に書き出す |

`measure`・`update`・`video` には `--slides sample` のように対象を指定する。
省略すると `readme` を探すが、`init` した場所には `readme.js` は無い。
`update` は `measure` と `index` を続けて実行するだけなので、
測定だけ・一覧だけが要るときは `measure`・`index` を単独で使う。

リポジトリのチェックアウトからなら `uv tool install '.[video]'`。
`video` は Playwright（chromium）が重いので、既定の install には含めず
extra に分けている。

## 必要なもの

最初の 1 枚を作ってブラウザで見る段階では、以下の追加準備は要らない。
測定や動画書き出しを使うときに用意する。

- `ytslide measure` — `curl`・`ffprobe`
- `ytslide video` — 加えて `ffmpeg`・Playwright（Python, chromium）。
  `uv tool install '...[video]'` で入る

```bash
sudo apt install curl ffmpeg   # curl・ffmpeg・ffprobe
playwright install chromium    # ytslide video だけが使う
```

Debian 12 (bookworm) / curl 7.88.1 / ffmpeg 5.1.9 / Python 3.14.7 /
playwright 1.63.0 で確認した。他の OS では入れ方を読み替える。

## 自分のスライドを作る

[インストール](#インストール)を済ませ、ターミナルで自分の作業場所を作る。
以下のコマンドは `~/my-slides` で実行する。

```bash
mkdir ~/my-slides
cd ~/my-slides
ytslide init
```

`player.html`・`index.html`・`slides/template.js` ができる。
テキストエディターで `~/my-slides/slides/sample.js` を新規作成し、
次を貼り付けて保存する。本文とナレーションを自分の内容に直せば、最初の 1 枚になる。

```js
const slidesConfig = {
    title: 'サンプル',
    heading: 'サンプルのスライド',
};

const slideData = [
    {
        title: 'はじめに',
        icon: 'fa-flag-checkered',
        duration: 5,
        narration: 'これはサンプルのスライドです。',
        body: `
            <p class="text-slate-200"
               style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">
                本文はここに書く
            </p>
        `,
    },
];
```

`duration` は省略せず、最初はおおよその秒数でよい。
`~/my-slides/player.html` をブラウザで開き、アドレス末尾に
`?slides=sample` を付けて Enter を押す。再生ボタンで読み上げを確認する。
**表示確認にもネット接続が要る。**

普段は `sample.js` を編集・保存し、ブラウザを再読み込みして確かめる。
見た目を整えるなら、`slides/template.js` の使いたい型をコピーする。
以下は必要になったときだけ行う。

- 一覧から開く: `ytslide index` を実行し、`index.html` を開く。
  `summary`・`icon` を省いても一覧に載る（警告が出る）。
- 時間表示を合わせる: [追加準備](#必要なもの)のあと
  `ytslide update --slides sample`。Online TTS で全枚を測って `duration` を
  書き換え、一覧も作り直す。本文だけの修正には測定も一覧更新も要らない。
- HTTP で確認する: `ytslide web` を実行し、自分で
  `http://localhost:8000/player.html?slides=sample` を開く。終了は Ctrl-C。
- 共有する: [Web サーバーへの公開](docs/User.md#公開)か、
  [動画への書き出し](#動画に書き出す)へ進む。

詳しい操作と、同じ LAN の別端末での確認は [docs/User.md](docs/User.md#手順)にある。
リポジトリを clone して中で作る場合は、そこにある `player.html` と `slides/`
をそのまま使い、`slides/sample.js` の作成から始められる。

## 入っているスライド

| 名前 | 中身 |
|--------|------|
| `readme` | このリポジトリの紹介（既定） |
| `user` | スライドの作り方 |
| `developer` | `player.html` の作り |
| `claude-memo` | 実例。「私の Claude Code の使い方」17 枚 |
| `template` | スライドの型の見本 19 種。コピーして使う |

`docs/` の説明と、同じ内容をスライドでも見られる。

## ファイル構成

| ファイル・ディレクトリ | 中身 |
|------------------------|------|
| `player.html` | 外枠の HTML・CSS と再生ロジック。**これ 1 つが本体** |
| `index.html` | スライドの一覧。`ytslide index` が生成する（`docs/User.md` の「手順」） |
| `slides/<名前>.js` | スライドのデータ。`player.html?slides=<名前>` で読まれる |
| `images/` | スライドに貼るビットマップ画像 |
| `docs/` | 説明（下記） |
| `src/ytslide/` | `ytslide` CLI 本体（`init`・`measure`・`index`・`update`・`video`・`web`） |
| `tests/` | `src/ytslide/` の自己テスト（`uv run pytest`） |
| `pyproject.toml` | `ytslide` のパッケージ定義（`uv tool install` で使う） |
| `archives/` | 決着した TODO 項目と、サブエージェントの報告。**現行仕様ではない** |
| `TODO.md` | 進行中の項目と、完了済みの目次 |
| `CLAUDE.md` | Claude Code 向けのプロジェクト規約 |

Tailwind・Google Fonts・FontAwesome・読み上げの音声は外部から取得するため、
**ネット接続が必要**。サーバーに置かず `file://` で直接開いても、表示から
読み上げまで動く
（詳細は [Developer.md の「場所を選ばない」](docs/Developer.md#場所を選ばない)）。

## 動画に書き出す

URL を渡せない相手（メール添付、YouTube、オフラインの上映）には、MP4 に書き出して渡す。

```bash
ytslide video --slides sample   # video/sample.mp4 と video/sample.srt
```

前提のパッケージは[「必要なもの」](#必要なもの)にある。書き出しには
数分かかる（Raspberry Pi での実測。数分の動画で数分）。書き出し先の `video/` は
`.gitignore` に入っており、リポジトリには入れない。

## 説明

- [docs/User.md](docs/User.md) — **スライド作成者向け。**
  `player.html` は編集せず、`slides/<名前>.js` を足す手順
- [docs/Developer.md](docs/Developer.md) — **開発者向け。**
  全体の作り、再生ロジック、読み上げ、レイアウトの設計
