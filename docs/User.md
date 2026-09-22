# ユーザーズ・ガイド

**同じ内容をスライドでも見られる**（`player.html?slides=user`）。

`player.html` は再生エンジンだけで、スライドのデータは
`slides/<名前>.js` に分かれている。新しいスライドを作るときは、
**`player.html` は触らず、`slides/<名前>.js` を足すだけ。**
再生エンジンを直すなら [Developer.md](Developer.md) を読む。

## 手順

まず自分の内容を 1枚作って再生する。その後は、編集して確認する作業を繰り返す。
一覧の更新、時間の測定、HTTP での確認は、必要なときだけ行う。

### 1. 自分の作業場所を用意する

**後で一覧の生成や時間の測定も使うなら、次の CLI の手順で始める。**
[README の「インストール」](../README.md#インストール)に従って `ytslide` を入れる。
`uv` の導入先と Python の条件もそこにある。測定・動画用の追加準備は後でよい。
ターミナルで次を実行する。

```bash
mkdir ~/my-slides
cd ~/my-slides
ytslide init
```

`player.html`・`index.html`・`slides/template.js` ができる。
`template.js` はテンプレートで、最初の一覧には `template` が 1件載る
（開くと 19種類が並ぶ）。
`init` は既存のファイルをコピーで上書きせず、最後に一覧を再生成する。
新しく置く `index.html` のタイトルと見出しにはディレクトリ名が入る。

**以降のコマンドは `~/my-slides` で実行する。** `slides/` の中へは移動しない。
リポジトリを clone して中で作る場合は、そのディレクトリを作業場所にして
次の手順から始める（`init` は不要）。

**まずコピー・編集だけで試すなら、CLI は不要。**
[リポジトリの ZIP](https://github.com/ytani01/yt_slide/archive/refs/heads/main.zip) を
ダウンロードして展開する。ホームフォルダーに `my-slides` フォルダーを作り、
その中に `slides` フォルダーを作る。展開したファイルから `player.html` を
`my-slides/` へ、`slides/template.js` を `my-slides/slides/` へコピーして、
次の手順へ進む。Python・uv は要らない。
以下の `~/my-slides` は、このホームフォルダー内の作業場所を指す。

後で `ytslide` のコマンドを使いたくなったら、README の手順でインストールし、
ターミナルで `cd ~/my-slides` を実行する。続けて `ytslide init` を実行すると、
既存のプレイヤーとテンプレートを保ったまま、一覧生成に必要な
`index.html` も用意できる。

### 2. 最初の 1枚を書いて再生する

テキストエディターで `~/my-slides/slides/sample.js` を新規作成し、
[最小の例](#最小の例)を貼り付ける。`title`、`body`（本文）、
`narration`（読み上げる文章）を自分の内容に直し、保存する。
`duration` は省略せず、最初はおおよその秒数でよい。
ファイル名には英数字・`_`・`-` を使う。

`~/my-slides/player.html` をブラウザで開く。アドレス欄の末尾に
`?slides=sample` を付け、Enter を押す。ファイルの URL は
`file:///…/my-slides/player.html?slides=sample` の形になる。
再生ボタンを押して、自分の本文と読み上げを確認する。
**表示に使う CSS・フォントなども外部から取得するので、ネット接続が要る。**

`?slides=` を省くと `slides/readme.js` を探す。上の手順で用意した場所には無いので、
必ず `?slides=sample` を付ける。読み込みに失敗した場合は
「スライドのデータ slides/<名前>.js を読み込めませんでした。」と表示される。
ファイルの保存先と、URL の名前が一致しているか確かめる。

**`slides/template.js` からコピーして始めてもよい。** 19種類の
テンプレートが入っているので、`player.html?slides=template` で見て
近いものを選び、その 1枚をコピーして中身を差し替えるほうが、
1 から書くより早い（手順は次の 3.）。

**AI に書かせてもよい。** [依頼文の例](#ai-に作ってもらう)を使い、
生成されたファイルを保存して同じように確認する。

### 3. 編集して確かめる

`sample.js` を編集 → 保存 → ブラウザを再読み込み → 見た目と読み上げを確認、
を繰り返す。本文だけを直したときは、一覧の再生成も時間の測定も要らない。
操作や音声の切り替えは[プレイヤーの操作ガイド](#プレイヤーの操作ガイド)以降を参照する。

テンプレートをコピーするときは、同じプレイヤーを `?slides=template` で
開いて選ぶ。エディターで `slides/template.js` を開き、使いたい 1枚の
オブジェクト（`{` から対応する `},` まで）を `sample.js` の `slideData` の
中へコピーする。
最初の 1枚と置き換えるか、その後ろへ足し、題名・本文・ナレーションを直す。
テンプレートの区切りは `// ── N. 名前 ──` のコメントが目印になる。
詳しくは[「body で書く」](#body-で書く標準)へ。

### AI に作ってもらう

**渡すものは 3つ。**

- **`docs/User.md`（この文書）** — 書式の説明。
  [Markdown ファイル](https://raw.githubusercontent.com/ytani01/yt_slide/main/docs/User.md)
  をブラウザで開いて保存するか、内容をコピーして渡す。ZIP を展開してあれば、
  その中の `docs/User.md` でよい
- **作業場所の `slides/template.js`** — テンプレート 19種。渡すと、
  近いものに沿った見た目で返ってくる
- **スライドにしたい原稿や資料** — 無ければ、テーマと聞き手を文章で伝える

**依頼文には次を書く。** 書かないと、説明文や断片だけが返ってきて、
そのままでは保存できない。

- `slides/<名前>.js` として保存できる **JavaScript 全体**を出すこと
- `slidesConfig` と `slideData` を含めること
- 各スライドに `title`・`body`・`narration`・`duration` を書くこと
- `duration` はおおよその秒数でよいこと（[あとで測れる](#時間表示を合わせたいとき)）
- `player.html` は編集しないこと

**例 1。新しく作ってもらう。** テーマ・聞き手・枚数を自分の用途に置き換える。
原稿が無ければ「内容は添付の原稿に沿ってください。」の行を外し、
盛り込みたいことを文章で書く。

```text
添付した User.md の形式と template.js のテンプレートを使って、
「地域の読書会の紹介」を、初めて参加する人向けに 3枚のスライドにしてください。
内容は添付の原稿に沿ってください。
slides/sample.js として保存できる JavaScript 全体を出してください。
slidesConfig と slideData を含め、各スライドに title・body・narration・duration を書き、
duration はおおよその秒数にしてください。player.html は編集しません。
```

**例 2。できたものを直してもらう。** 直すスライドを番号で指し、
変えないものも書く。

```text
添付した sample.js の 3枚目を、箇条書きから 2カラムの比較に変えてください。
テンプレートは添付した template.js の中から近いものを選んでください。
narration と duration はそのままにして、
3枚目のオブジェクトだけを差し替える形で出してください。
```

出力された JavaScript を、前後の説明やコードブロックの囲みを含めずに
`~/my-slides/slides/sample.js` へ保存する。上の[最小の 1枚を再生する手順](#2-最初の-1枚を書いて再生する)
と同じく `player.html?slides=sample` を開き、本文・読み上げ・スライド送りを確認する。
直したい箇所はスライド番号と変更内容を AI に伝え、修正後に保存・再読み込みして確かめる。

### 一覧から開きたいとき

```bash
ytslide index
```

`~/my-slides/index.html` をブラウザで開くか再読み込みし、`sample` のリンクを押す。
ファイルの追加・改名・削除、一覧の説明やアイコンを変えたときに再実行する。
説明とアイコンを付ける場合は、`sample.js` 冒頭の `slidesConfig` を次の形にする。

```js
const slidesConfig = {
    title: 'サンプル',
    heading: 'サンプルのスライド',
    summary: '自分で作った最初のスライド',
    icon: 'fa-file-lines',
};
```

`summary`・`icon` は掲載の必須条件ではない。省くと警告が出るが、説明は空欄、
アイコンは `fa-file` で一覧に載る。直接 `?slides=sample` で開くだけなら
一覧の更新は要らない。

### 時間表示を合わせたいとき

[「測定と動画に要るパッケージ」](#測定と動画に要るパッケージ)で `curl`・`ffprobe` を用意し、
仕上げに次を実行する。

```bash
ytslide update --slides sample
```

Online TTS ですべてのスライドの読み上げ秒数を測り、`sample.js` の `duration` を書き換えてから
一覧を再生成する。ネット接続が要り、枚数に応じて時間がかかる。
ナレーションや読みの置換を直したら再測定できる。端末の Web Speech の声とは
速さが異なるため、すべての声に測定値が一致するわけではない。

測定だけなら `ytslide measure --slides sample --all --write`、
一覧だけなら `ytslide index` も単独で使える。
詳しくは[「narration と duration」](#narration-と-duration)へ。

### HTTP や別端末で確認したいとき

```bash
ytslide web
```

ブラウザは自動では開かない。自分で
`http://localhost:8000/player.html?slides=sample` を開く。
一覧を見るなら `http://localhost:8000/`（事前に `ytslide index` で更新する）。
サーバーは実行したターミナルで Ctrl-C を押すと止まる。ポートを変える場合は
`ytslide web -p 8001` のように指定し、URL の番号も変える。

同じ LAN の別端末から見るときは、配信元の OS のネットワーク設定で
LAN 内の IP アドレスを確認し、`http://<LAN内IP>:8000/` を開く。
`localhost` は開いた端末自身を指すので、別端末から配信元を見る URL には使わない。
**`web` は作業ディレクトリ全体を配信する。** 別端末からの接続には
配信元への通信が許可されている必要がある。

共有する段階では[「公開」](#公開)か[「動画に書き出す」](#動画に書き出す)へ進む。

### 別のディレクトリからコマンドを使う

`measure`・`index`・`update`・`video` は `--root` で作業場所を指定できる。
`init` と `web` はカレントディレクトリだけを見る。

```bash
ytslide index --root ~/my-slides
```

## `ytslide` のサブコマンド

| サブコマンド | 使う場面 |
|--------------|----------|
| `ytslide init` | 最初に、自分の作業ディレクトリへプレイヤーとテンプレートを用意する |
| `ytslide index` | 一覧から開きたいとき、`slides/*.js` から `index.html` を作り直す |
| `ytslide measure` | 読み上げ秒数だけを測る。`--write` で `duration` に書き戻せる |
| `ytslide update` | 時間表示を合わせる仕上げに、`measure --all --write` と `index` を続けて実行する |
| `ytslide web` | HTTP で確認したいとき、作業ディレクトリを配信する（ブラウザは自分で開く） |
| `ytslide video` | 動画で渡したいとき、MP4 と `.srt` に書き出す |

`measure`・`update`・`video` には `--slides sample` のように対象を指定する。
省略すると `readme` を探すが、`init` した場所には `readme.js` は無い。
`update` は `measure` と `index` を続けて実行するだけなので、
測定だけ・一覧だけが要るときは `measure`・`index` を単独で使う。

インストールは [README の「インストール」](../README.md#インストール)にある。

### 測定と動画に要るパッケージ

最初の 1枚を作ってブラウザで見る段階では、以下の追加準備は要らない。
測定や動画書き出しを使うときに用意する。

- `ytslide measure`・`ytslide update` — `curl`・`ffprobe`
- `ytslide video` — 加えて `ffmpeg`・Playwright（Python, chromium）。
  `uv tool install '...[video]'` で入る

```bash
sudo apt install curl ffmpeg   # curl・ffmpeg・ffprobe
playwright install chromium    # ytslide video だけが使う
```

Debian 12 (bookworm) / curl 7.88.1 / ffmpeg 5.1.9 / Python 3.14.7 /
playwright 1.63.0 で確認した。他の OS では入れ方を読み替える。

## `slides/<名前>.js` の中身

グローバルに 2つ定義する。いずれも `const` で、この名前でなければ認識されない。

```js
const slidesConfig = {
    title: 'ブラウザのタブに出る文字列',
    heading: 'ヘッダーに出る見出し',
    summary: 'index.html の一覧に出す説明文',
    icon: 'fa-list-check',
};

const slideData = [
    {
        title: 'プレイリストに出る題名',
        icon: 'fa-list-check',
        duration: 10,
        narration: '読み上げる文章。',
        body: `<ul>…</ul>`,
    },
    // 以下、スライドの数だけ続ける
];
```

| キー | 中身 |
|------|------|
| `title` | プレイリストと再生バーの上に出る題名 |
| `duration` | このスライドのおおよその秒数。**省略しない**（後述） |
| `narration` | 読み上げる文章。字幕にもそのまま出る |
| `body` | 本文の HTML を**文字列で書く**。見出しの下に差し込まれる。**標準の書き方**（後述） |
| `icon` | 見出しの先頭に出す FontAwesome のクラス名（例 `'fa-list-check'`）。省略できる |
| `render()` | `body` で足りないときだけ使う。スライドの HTML を**文字列で返す関数**（後述） |

**スライドの番号と枚数は書かない。** `SLIDE 01 / 17` の番号は
`slideData` の並び順から、総枚数と総時間は `slideData.length` と
`duration` の合計から自動で計算される。

`slidesConfig` の `summary`・`icon` は `index.html` の一覧専用で、
`player.html` の再生には関わらない。`ytslide index` を走らせると、
`slides/` にある `_` で始まらないファイルすべてから読み、
`index.html` のマーカーコメントの間の `<li>` を作り直す（並びは
`readme` を先頭、残りはファイル名の辞書順）。一覧に出したくないスライドは
ファイル名の頭に `_` を付ける（`?slides=` では今までどおり開ける）。
`summary`・`icon` を省くと警告が出るだけで生成は止まらない
（説明は空欄、アイコンは `fa-file`）。
`summary` は `index.html` にエスケープせずそのまま挿入する。HTML を
そのまま書ける（`developer.js` のように `<span>` などを埋め込める）が、
逆に `<` や `&` を含む素のテキストを書くと、そのまま HTML として
解釈される。

## `body` で書く（標準）

スライドは `body` だけで書く。外枠と見出しは `player.html` が `title` と
`icon` から作るので、`body` には本文の HTML だけを書く
（外側の `div` や `h2` は書かない）。

```js
{
    title: '箇条書きの例',
    icon: 'fa-list-check',
    duration: 7,
    narration: '……',
    body: `<ul>…</ul>`,
}
```

`title` が空（または未定義）なら見出しごと出ず、本文だけになる。`icon` を
省くとアイコンは出ない。`render()` も書いた場合は `render()` が優先される
（`body` は無視される）。

**テンプレートが `slides/template.js` にある**（`player.html?slides=template`）。
表紙、箇条書き、2カラム比較、表、コードと端末画面、図解、数字を大きく見せる、
引用、時系列、カード（段数を混ぜる）、ポイント・注意の帯、手順（横並び）、
前後の差分、割合バー、Q&A、本文と脚注、画像、画像（全面）、章の区切りの
19種類。使いたいテンプレートのスライドをまるごとコピーして、
中身を差し替えるのが早い。1枚は `// ── N. 名前 ──` のコメントから次の
コメントまでで、要らないテンプレートはその範囲を丸ごと削除してよい。「表紙」
「画像（全面）」「章の区切り」の 3つは、見出しの枠を外すため `render()` で
書いてある。

## `render()` の書き方

**`body` で足りないとき**の高度な使い方。見出しの形自体を変えたい、
全面を自分で組みたいスライドだけ `render()` を使う。

```js
{
    title: '全面のスライド',
    duration: 10,
    narration: '……',
    render: function() {
        return `<div class="flex flex-col h-full justify-center">…</div>`;
    }
}
```

差し込み先の `#slide-canvas` は縦に伸びる領域で、外側が **960x540 の
16:9 枠**。Tailwind・Google Fonts・FontAwesome は
`player.html` が CDN から読み込むため、クラス名とアイコンはそのまま使える
（オフラインでは崩れる）。

- **サイズは `cqw` と `clamp()` で書く。** 枠は container query
  （`container-type: inline-size`）で拡大縮小するため、`px` や `rem` の
  直書きは 16:9 を縮めたときに崩れる。
  例: `style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);"`、
  余白は `px-[3cqw]` `gap-[1.2cqw]` のように書く
- **`md:` などのブレークポイントは枠の中では使わない。** 幅 768px 未満と
  タッチ画面では枠ごと `transform: scale()` で縮める別経路になるため、
  画面幅で分岐させるとずれる
- 高さは 540px 相当。既存のスライドは
  `flex flex-col h-full justify-center` で縦に詰めている

既存の 17枚が `slides/claude-memo.js` にあるため、**近い見た目のものを
コピーして中身を差し替えると早い。** `slides/template.js` の「表紙」
「画像（全面）」「章の区切り」も `render()` で書いた例で、見出しの枠を外した
全面のスライドはこの形になる。

### 画像を入れる

ビットマップ画像は `images/` に置き、**`player.html` から見た相対パス**で
書く（`slides/` から見た位置ではない）。枠は container query で拡大縮小する
ため、幅を `cqw` か `w-full` で指定すれば画面の大きさに追従する。

```html
<img src="images/spheres.jpg" alt="…" class="w-full h-auto rounded-xl">
```

- 高さを抑えたいときは `class="max-h-[34cqw] object-contain"` を足す
- 枠いっぱいに敷くときは `render()` の中で
  `class="absolute inset-0 w-full h-full object-cover"`。文字を載せるなら
  上に半透明の膜を 1枚重ねる
- 見本は `slides/template.js` の「画像」と「画像（全面）」

## `narration` と `duration`

`duration` は**おおよその秒数でよい**。進行バーと残り時間はこの値で描かれるが、
スライド送りは読み上げの終了で起きるため、値がずれてもスライドは飛ばない。
バーが先に 100% になったり、読み終わってから待たされたりするだけで済む。

**ただし、省略はしない。** 1枚でも `duration` が無いと総時間の計算が崩れ、
そのスライド一式の残り時間と進行バーが**すべて表示されなくなる**。

ぴったり合わせたいときは `ytslide measure` で測る。出るのは
**Online TTS の音声を `BASE_SPEED_MULTIPLIER` 倍で再生した実測秒数**。
**`--text` に文章を渡すと、スライドに入れる前の下書きを測れる。**
読みの置換は `--slides` で指定したスライド一式のものを使うので、`--text`
だけのときも `--slides` を添える（省くとスライド一式の読みは効かず、
共通の置換表だけで測る）。

```bash
$ ytslide measure --slides sample --text 'ここに読み上げる文章'
下書き: 原文 10 字 / 読み 10 字 / 実測 2.376s / BASE_SPEED_MULTIPLIER=1.4 倍速 1.70s -> duration: 2
```

最後に出る `duration: 2` をそのまま書く。前提のパッケージは
[「測定と動画に要るパッケージ」](#測定と動画に要るパッケージ)にある。

`--slides <名前>` を付けると、どのスライド一式のスライドでも指定できる
（省くと `readme`）。`--write` を付けると、`duration` を直接書き換える。

```bash
ytslide measure --slides sample --all --write
```

測定結果に続き、`duration` が変わったスライドの変更内容が出力される。
`--write` を付けずに実行すれば、書き換えずに秒数だけ確認できる。

`ytslide update` は、この `--all --write` のあと `ytslide index` まで続けて
走らせる。ナレーションを直したあとの測り直しと一覧の作り直しは、これ 1つでよい。

```bash
ytslide update --slides sample
```

`-n <回数>` を付けると、その回数だけ測って**中央値**を採る（既定は 1）。
Online TTS の秒数は毎回同じとは限らないので、揺れが気になるときに使う。

書くときの注意:

- **1 文が長いと `TTS_MAX_CHARS` で切れる**（Online TTS の制限）。
  `ytslide measure` は超えると `★TTS_MAX_CHARS=180 字で切れる` と出力する
- 記号や英単語の読みは置換表を通してから読み上げられる。読みがおかしい
  ときは下の「読みを直す」を参照する

## 読みを直す

`narration` は読み上げの前に置換表を通る。表は 2つ。

| 表 | 置き場所 | 役割 |
|----|----------|-----------|
| 共通 | `player.html` の `SPEECH_RULES` | すべてのスライド一式で用いる語 |
| スライド一式 | `slides/<名前>.js` の `slidesConfig.rules` | 該当スライド一式だけの語 |

**当たる順はスライド一式が先、共通が後。** 同じ語に両方が当たるときはスライド一式側が
優先されるため、共通の読みをこのスライド一式だけ変えたい場合は `rules` に書く。

```js
const slidesConfig = {
    title: 'タブに出る名前',
    heading: '画面の見出し',
    rules: [
        [/requestAnimationFrame/gi, 'リクエスト アニメーション フレーム'],
    ],
};
```

`rules` は省いてもよい（共通の表だけを使う）。形式は
**1行 1ルール `[/パターン/フラグ, '読み']`**。
`ytslide measure` が同じファイルを読むため、この形を崩すと
測定値がずれる。

- **短い語が先に当たると、長い語に届かない。** 長いほうを先に書く。
  `Claude Code` は `Claude` より先に書く必要がある。
- **複数のスライド一式で使う語は共通に足す。** 1つのスライド一式にだけ書くと、別のスライド一式で
  同じ語を使ったときに読みがずれる。
- **読みを大きく変えたら `duration` も見直す**（長さが変わる）。
  測り直すなら `ytslide measure --slides <名前> --all --write`
- `--text` で下書きを測るときは `--slides <名前>` も付ける。表はスライド一式ごとに
  異なるため、付けないと既定の `readme` の表（`readme.js` が無ければ
  共通の表だけ）で測定してしまう。

## 動画に書き出す

URL を渡せない相手（メール添付、YouTube、オフラインの上映）には、
`ytslide video` で MP4 と `.srt` に書き出して渡す。

```bash
$ ytslide video --slides sample
スライド 1: 撮影済み。読み上げ音声を取得中…
スライド 1: 11.66s
（…枚数ぶん…）
video/sample.mp4 と video/sample.srt に書き出した
```

`--out <ディレクトリ>`（既定 `video/`）で書き出し先を変えられる。
`--only 1 --only 2` のように番号を渡すと、そのスライドだけ書き出す（確認用。全部より速い）。

- 各スライドの PNG（1920×1080）と読み上げの mp3 を作り、`ffmpeg` で連結する
  組み立て方式。画面録画ではないので実時間ぶん待たない
- 再生速度は `BASE_SPEED_MULTIPLIER`（1.4 倍）に揃える
- 字幕は映像に焼き込まず、`.srt` を別に出す
- 進行バー・残り時間・ボタンは映らない。動画では操作できないため
- `animate-bounce` のようなアニメーションは静止画になる
- 前提のパッケージは [「測定と動画に要るパッケージ」](#測定と動画に要るパッケージ)にある
- 書き出し先の `video/` は `.gitignore` に入っており、リポジトリには入れない。
  要るときに作り直す

## 公開

公開先の Web サーバーに、下記のファイルを同じ位置関係で置く。
再生用のビルドや依存関係のインストールは不要。

相手には公開先の `https://<公開先>/player.html?slides=sample` を渡す。
`index.html` も置いた場合は、そのディレクトリの公開 URL を渡せば一覧から選べる。
手元の `file://` や `localhost` の URL を送っても、相手はそのファイルを開けない。

### 「このスライドを見て」と渡す

表示中のスライドの番号が、URL の末尾に `#7` のように付く（1 始まり）。
自動送りでも追従するので、いま見ているところの URL をコピーして渡せる。

```
player.html?slides=sample#7
```

開くとその番号のスライドから始まる。再読み込みしても同じスライドに戻る。番号が無い・
範囲外・数字でないときは 1枚目から始まる。

### 他のサーバーへ持っていくとき

**渡すのは `player.html` とスライド一式だけ。** 同じ位置関係のまま置く。

```
player.html
index.html          ← 一覧が要るときだけ
slides/<名前>.js    ← 公開したいスライド一式の分だけ
images/             ← 画像を使っているときだけ
```

`player.html` がローカルから読むのはこの `.js` と、スライドが参照する画像
だけで、参照は相対パス。残り（Tailwind・Google Fonts・FontAwesome・
読み上げの音声）はすべて外部から取得する。

- **`index.html` を持っていくなら、持っていかないスライドの `.js` を
  `slides/` から消してから `ytslide index` を走らせ直す。**
  `index.html` は `slides/` を見て作った静的なファイルで、渡す側で
  自動的に絞り込まれるわけではない。消さずに持っていくと無いスライドへの
  リンクが残り、開いたときに「スライドのデータ `slides/<名前>.js` を
  読み込めませんでした。」と出る
- `docs/`・`archives/`・`README.md`・`TODO.md` は**要らない**。
  `index.html` を作り直すなら `ytslide index` が要る（`uv tool install` で
  入れる。[README の「インストール」](../README.md#インストール)）。
  `ytslide measure` は `duration` を測るためのもので、どちらも再生には
  関わらない
- **ネット接続が要る。** オフラインでは見た目が崩れ、音声も出ない
- **`file://` でも動く。** サーバーに置かず、ファイルを直接開いても表示から
  読み上げまで動く（Online Voice で確かめた）。HTTP で配信しても同じ

置き場所の自由度や公開 URL を保つ方法は
[Developer.md の「場所を選ばない」](Developer.md#場所を選ばない)にある。

## テキストで書く利点

スライド 1式は `slides/<名前>.js` というテキストファイル 1つに収まっている。
専用の形式でもバイナリでもないので、文章を扱う道具がそのまま効く。

### AI に書かせられる

渡すのは `slides/template.js`（テンプレート 19種）、この `docs/User.md`（書式の説明）、
スライドにしたい原稿の 3つ。**AI が書いたものをそのまま `slides/<名前>.js` として
保存すれば、`player.html?slides=<名前>` で再生できる。** 取り込みも変換も要らない。

直すときも「3枚目を 2枚に分けて」「用語を揃えて」と文章で頼めて、結果は `git diff` で
1行ずつ確かめられる。気に入らなければ戻せるので、思い切って任せられる。
依頼文の例は [AI に作ってもらう](#ai-に作ってもらう)にある。

### バージョン管理

git で管理しておけば、どのスライドのどこを直したかが差分で読める。他の人にレビューを
頼める。直した結果が悪ければ、1つ前に戻せる。「直す前」を別名で取っておかなくてよい。

```bash
git diff slides/sample.js           # 直した箇所だけが行単位で出る
git checkout -- slides/sample.js    # 直す前に戻す
```

### 一括置換

用語・製品名・バージョン番号が変わったとき、全スライドをまとめて直せる。
1枚ずつ開いて探す作業が要らないので、直し忘れが残らない。

```bash
rg -n 'ver\. 1\.2' slides/                  # どこに出てくるか先に見る
sed -i 's/ver\. 1\.2/ver. 1.3/g' slides/*.js
```

置換した後は `git diff` で、狙った箇所だけが変わったかを確かめる。

### 自動生成

集計結果やログからスライドを機械的に作れる。毎月同じ表を手で貼り直す作業が要らない。
出力するのは `const slidesConfig` と `const slideData` の 2つを定義したテキストなので、
どの言語からでも書ける。

```python
rows = [('売上', 120), ('問い合わせ', 34)]    # CSV やデータベースから読む

print('const slidesConfig = {title: "月次報告"};')
print('const slideData = [')
for name, value in rows:
    print(f"  {{title: '{name}', duration: 8,")
    print(f"   narration: '{name}は{value}件でした。',")
    print(f"   body: '<p>{value} 件</p>'}},")
print('];')
```

出力を `slides/monthly.js` に保存すれば、`player.html?slides=monthly` で再生できる。

### 自動化

`ytslide` のサブコマンドはどれも非対話で動くので、他の処理とつなげられる。
原稿を直したら読み上げ秒数を測り直して MP4 まで作る、という流れを 1本のスクリプトに
まとめられる。手で順番に叩いて、途中で 1つ忘れる、ということが無くなる。

```bash
ytslide measure --slides sample --all --write && ytslide video --slides sample
```

### 形式に閉じ込められない

平文なので、中身を読むのにこのツールが要らない。題名・ナレーション・本文が
そのまま書いてあるだけなので、後から別の道具へ移したくなっても取り出せる。

### エディタを選ばない

使い慣れたエディタで書ける。オフラインでも、ssh 越しの端末でも、スマホの
エディタでも編集できる。書く場所を選ばない。

## プレイヤーの操作ガイド

再生ボタンの隣の「操作ガイド」を押すと、キー操作とタッチ操作を確認できる。
キーボードでは Tab で「操作ガイド」へ移動し、Enter または Space で開く。
「閉じる」または Escape で閉じると、「操作ガイド」ボタンへフォーカスが戻る。
ガイドの表示中はプレイヤーのショートカットは働かない。
再生中に開いた場合は、そのまま再生が続く。

## チャプター一覧の検索

右側のチャプター一覧の検索欄に語を入れると、**題名とナレーションの両方**を
部分一致で探して一覧を絞り込む。見出しの右に「該当数 / 全体の枚数」が出て、
見つからないときは「該当するスライドはありません。」と表示される。
欄の右端の × を押すと絞り込みを解除する（多くのブラウザでは Escape でも消える）。

絞り込むのは一覧の表示だけで、スライドの番号・再生順序・総時間は変わらない。
絞り込んだ結果から選ぶと、その番号のスライドへ移動する。検索欄に文字を
入れている間は、Space や矢印はプレイヤーの操作に渡らない。

## 読み上げの声を選ぶ

ヘッダーのプルダウンで、読み上げに使う声を選ぶ。選んだ声は次に開いたときも
覚えている。

- **Online Voice**: Google Translate TTS。ネット接続が要る（既定）
- **Web Speech (自動)**: 端末の日本語音声から自動で選ぶ
- **声の名前**: 端末に入っている日本語音声（Windows の Nanami・Haruka、
  macOS の Kyoko、Android の追加音声など）

消音は、そのプルダウンの左にあるスピーカーマークで切り替える（`M` キーでも
同じ）。消音中はマークが赤い「消音」の形になる。

一覧に出るのは**その端末に入っている声だけ**。日本語の声が「Google 日本語」
しか無い端末では、Online Voice と同じ声なので切り替えても変わらない。
声を増やすには OS 側で音声を追加する。

## 音が出ないとき

音声を再生できないと、スライドの近くに「音声を再生できませんでした」と出て、
状態表示は「音声エラー」になる。**消音中・一時停止中とは別の状態**で、
消音や一時停止では出ない。

- **もう一度再生**: 同じスライドの音声をやり直す
- **音声エンジンを切り替える**: Online Voice と Web Speech API を入れ替えて読み直す

出ている間も、想定の秒数でスライドは進む。次のスライドへ進むか、音が出始めると消える。

## 最小の例

`slides/sample.js` として保存し、`player.html?slides=sample` で開く。

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
        body: '<p>本文はここに書く</p>',
    },
];
```

文字の色と書体は `player.html` が決めているので、`body` には本文の HTML を
書くだけでよい。

### 文字の大きさを変えたくなったら

既定の大きさは本文向け。大きく見せたい行には `style` で指定する。

```html
<p style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">大きく見せたい行</p>
```

**`px` や `rem` の直書きではなく `clamp()` と `cqw` を使う。** 枠は画面に
合わせて拡大縮小するため、固定の大きさだと小さい画面で崩れる。
[`render()` の書き方](#render-の書き方)に、余白や改行の指定もまとめてある。

## 付録 アイコン名の例

`icon` と `render()` の中で使える FontAwesome のクラス名。`player.html` が
CDN から読む **FontAwesome 6.5.1 の無料の solid** から、用途別に 30件挙げる。

| 用途 | クラス名 |
|------|----------|
| 箇条書き・一覧 | [`fa-list-check`](https://fontawesome.com/icons/list-check?s=solid) / [`fa-list-ol`](https://fontawesome.com/icons/list-ol?s=solid) / [`fa-table-list`](https://fontawesome.com/icons/table-list?s=solid) |
| 注意・禁止 | [`fa-triangle-exclamation`](https://fontawesome.com/icons/triangle-exclamation?s=solid) / [`fa-circle-exclamation`](https://fontawesome.com/icons/circle-exclamation?s=solid) / [`fa-ban`](https://fontawesome.com/icons/ban?s=solid) / [`fa-circle-info`](https://fontawesome.com/icons/circle-info?s=solid) |
| 手順・進行 | [`fa-flag-checkered`](https://fontawesome.com/icons/flag-checkered?s=solid) / [`fa-arrow-right`](https://fontawesome.com/icons/arrow-right?s=solid) / [`fa-circle-check`](https://fontawesome.com/icons/circle-check?s=solid) |
| コード・端末 | [`fa-code`](https://fontawesome.com/icons/code?s=solid) / [`fa-terminal`](https://fontawesome.com/icons/terminal?s=solid) / [`fa-file-code`](https://fontawesome.com/icons/file-code?s=solid) |
| ファイル・文書 | [`fa-folder-open`](https://fontawesome.com/icons/folder-open?s=solid) / [`fa-file-lines`](https://fontawesome.com/icons/file-lines?s=solid) / [`fa-book`](https://fontawesome.com/icons/book?s=solid) |
| 時間・計測 | [`fa-clock`](https://fontawesome.com/icons/clock?s=solid) / [`fa-stopwatch`](https://fontawesome.com/icons/stopwatch?s=solid) / [`fa-gauge-high`](https://fontawesome.com/icons/gauge-high?s=solid) / [`fa-chart-simple`](https://fontawesome.com/icons/chart-simple?s=solid) |
| 人・対話 | [`fa-users`](https://fontawesome.com/icons/users?s=solid) / [`fa-comments`](https://fontawesome.com/icons/comments?s=solid) / [`fa-robot`](https://fontawesome.com/icons/robot?s=solid) |
| 図解・設定 | [`fa-diagram-project`](https://fontawesome.com/icons/diagram-project?s=solid) / [`fa-table`](https://fontawesome.com/icons/table?s=solid) / [`fa-gear`](https://fontawesome.com/icons/gear?s=solid) / [`fa-sliders`](https://fontawesome.com/icons/sliders?s=solid) |
| 強調・ひらめき | [`fa-lightbulb`](https://fontawesome.com/icons/lightbulb?s=solid) / [`fa-star`](https://fontawesome.com/icons/star?s=solid) / [`fa-wand-magic-sparkles`](https://fontawesome.com/icons/wand-magic-sparkles?s=solid) |

**名前をクリックすると FontAwesome のページに飛び、実物のアイコンを
見られる。**

`icon` にはこの名前だけを書く（`fa-solid` は `player.html` が付ける）。
`render()` の中では `<i class="fa-solid fa-list-check"></i>` と組みで書く。

```js
{
    title: '注意点',
    icon: 'fa-triangle-exclamation',
    ...
}
```

ここに無いものは [FontAwesome の検索](https://fontawesome.com/search?o=r&m=free&s=solid)
で探す。**無料の solid に限る**（有料のアイコンや、ブランドのロゴ
（`fa-brands`）は `fa-solid` では出ない）。**名前を間違えても何も言われず、
アイコンが出ないだけ**なので、足したら画面で確かめる。

同じ一覧がスライドの巻末にもある（`player.html?slides=user`）。
