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

自分で作ったスライドも `player.html?slides=<名前>` で開ける。ただし
スライドの一覧（`index.html`）には自動では出ない。出すには `index.html`
に `<li>` を 1 つ足す（[User.md の手順](docs/User.md#手順)）。

## 必要なもの

**見るだけならブラウザだけ。** インストールは要らない（ネット接続は要る）。

前提が要るのは `tools/` のスクリプトを使うときだけ。

```bash
sudo apt install curl ffmpeg   # curl・ffmpeg・ffprobe
pip install playwright         # make-video.py だけが使う
playwright install chromium
```

- `tools/measure-duration.py` — `curl`・`ffprobe`
- `tools/make-video.py` — 加えて `ffmpeg`・Playwright（Python, chromium）

Debian 12 (bookworm) / curl 7.88.1 / ffmpeg 5.1.9 / Python 3.14.7 /
playwright 1.63.0 で確認した。他の OS では入れ方を読み替える。

## 自分のスライドを作る

**`player.html` は触らない。** `slides/` に JavaScript を 1 つ足すだけ。

```javascript
const slidesConfig = { title: 'ブラウザのタブに出る名前', heading: '画面上部の見出し' };

const slideData = [
    {
        title: '1 枚目',                 // 見出しに出る
        duration: 10,                    // 読み上げにかかる秒数
        narration: 'ここが読み上げられ、字幕にも出ます。',
        body: `<p class="text-2xl">好きな HTML を書く</p>`,
    },
];
```

`duration` は目分量で決めず、`tools/measure-duration.py --slides <名前> --all --write`
で実測値を入れる。手順は [docs/User.md](docs/User.md) にある。

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
| `index.html` | スライドの一覧。足したら 1 行足す（`docs/User.md` の「手順」） |
| `slides/<名前>.js` | スライドのデータ。`player.html?slides=<名前>` で読まれる |
| `images/` | スライドに貼るビットマップ画像 |
| `docs/` | 説明（下記） |
| `tools/measure-duration.py` | 読み上げ秒数を測り、`duration` に書き戻す |
| `tools/test_measure_duration.py` | 書き戻しの置換を確かめる自己テスト |
| `tools/make-video.py` | スライド一式を MP4 と `.srt` に書き出す |
| `tools/test_make_video.py` | 分割や字幕の組み立てを確かめる自己テスト |
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
tools/make-video.py --slides readme   # video/readme.mp4 と video/readme.srt
```

前提のパッケージは[「必要なもの」](#必要なもの)にある。書き出しには
数分かかる（Raspberry Pi での実測。数分の動画で数分）。書き出し先の `video/` は
`.gitignore` に入っており、リポジトリには入れない。

## 説明

- [docs/User.md](docs/User.md) — **スライド作成者向け。**
  `player.html` は編集せず、`slides/<名前>.js` を足す手順
- [docs/Developer.md](docs/Developer.md) — **開発者向け。**
  全体の作り、再生ロジック、読み上げ、レイアウトの設計
