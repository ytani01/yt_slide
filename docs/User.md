# スライドを作る

**同じ内容をスライドでも見られる**（`player.html?slides=user`）。

`player.html` は再生エンジンだけで、スライドのデータは
`slides/<名前>.js` に分かれている。新しいスライドを作るときは、
**`player.html` は触らず、`slides/<名前>.js` を足すだけ。**
再生エンジンを直すなら [Developer.md](Developer.md) を読む。

## 手順

1. `player.html` と同じディレクトリの `slides/` に `<名前>.js` を作る
   （`<名前>` は英数字・`_`・`-` のみ。その他は無視される）
2. `slidesConfig` と `slideData` を書く（下記）
3. ブラウザで `player.html?slides=<名前>` を開く

`?slides=` を省くと `slides/readme.js` を読む。読み込みに失敗した場合、
白画面ではなく「スライドのデータ slides/<名前>.js を読み込めませんでした。」
と表示して停止する。

## `slides/<名前>.js` の中身

グローバルに 2 つ定義する。いずれも `const` で、この名前でなければ認識されない。

```js
const slidesConfig = {
    title: 'ブラウザのタブに出る文字列',
    heading: 'ヘッダーに出る見出し',
};

const slideData = [
    {
        title: 'プレイリストに出る題名',
        duration: 10,
        narration: '読み上げる文章。',
        render: function() {
            return `<div class="...">…</div>`;
        }
    },
    // 以下、スライドの数だけ続ける
];
```

| キー | 中身 |
|------|------|
| `title` | プレイリストと再生バーの上に出る題名 |
| `duration` | このスライドの秒数。**読み上げの実測値を入れる**（後述） |
| `narration` | 読み上げる文章。字幕にもそのまま出る |
| `render()` | スライドの HTML を**文字列で返す関数**。`#slide-canvas` の `innerHTML` に入る |

**スライドの番号と枚数は書かない。** `SLIDE 01 / 17` の番号は
`slideData` の並び順から、総枚数と総時間は `slideData.length` と
`duration` の合計から自動で計算される。

## `render()` の書き方

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

既存の 17 枚が `slides/claude-memo.js` にあるため、**近い見た目のものを
コピーして中身を差し替えると早い。**

## `narration` と `duration`

`duration` には **Online TTS の音声を `BASE_SPEED_MULTIPLIER` 倍で再生した
実測秒数**を入れる。
進行バーと残り時間はこの値で描かれる。スライド送りは読み上げの終了で起きるため、
値がずれてもスライドは飛ばないが、バーが先に 100% になったり、読み終わってから
待たされたりする。

測るには `tools/measure-duration.py` を使う。**`--text` に文章を渡すと、
どのスライド一式でも測定できる。**

```bash
$ tools/measure-duration.py --text 'ここに読み上げる文章'
下書き: 原文 10 字 / 読み 10 字 / 実測 2.376s / BASE_SPEED_MULTIPLIER=1.4 倍速 1.70s -> duration: 2
```

最後に出る `duration: 2` をそのまま書く。`curl` と `ffprobe` が必要。

`--slides <名前>` を付けると、どのスライド一式のスライドでも指定できる
（省くと `readme`）。`--write` を付けると、`duration` を直接書き換える。

```bash
$ tools/measure-duration.py --slides user --all --write
（11 枚の測定結果）
スライド 7: duration 23 -> 12
user.js: 1 枚を書き換えた
```

変わったスライドだけ出力される。結果が気に入らなければ `git checkout` で戻す。

`-n <回数>` を付けると、その回数だけ測って**中央値**を採る（既定は 1）。
Online TTS の秒数は毎回同じとは限らないので、揺れが気になるときに使う。

書くときの注意:

- **1 文が長いと `TTS_MAX_CHARS` で切れる**（Online TTS の制限）。
  `measure-duration.py` は超えると `★TTS_MAX_CHARS=180 字で切れる` と出力する
- 記号や英単語の読みは置換表を通してから読み上げられる。読みがおかしい
  ときは下の「読みを直す」を参照する

## 読みを直す

`narration` は読み上げの前に置換表を通る。表は 2 つ。

| 表 | 置き場所 | 役割 |
|----|----------|-----------|
| 共通 | `slides/_rules.js` の `SPEECH_RULES` | すべてのスライド一式で用いる語 |
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
**1 行 1 ルール `[/パターン/フラグ, '読み']`**。
`tools/measure-duration.py` が同じファイルを読むため、この形を崩すと
測定値がずれる。

- **短い語が先に当たると、長い語に届かない。** 長いほうを先に書く。
  `Claude Code` は `Claude` より先に書く必要がある。
- **複数のスライド一式で使う語は共通に足す。** 1 つのスライド一式にだけ書くと、別のスライド一式で
  同じ語を使ったときに読みがずれる。
- **読みを変えたら `duration` を測り直す**（長さが変わる）。
  `tools/measure-duration.py --slides <名前> --all --write`
- `--text` で下書きを測るときは `--slides <名前>` も付ける。表はスライド一式ごとに
  異なるため、付けないと既定の `readme` の表で測定してしまう。

## 公開

このディレクトリは `public_html/` 下なので、ファイルを置くだけで公開される。
ビルドも依存関係のインストールも不要。

### 他のサーバーへ持っていくとき

**渡すのは次の 3 つだけ。** 同じ位置関係のまま置く。

```
player.html
slides/_rules.js
slides/<名前>.js    ← 公開したいスライド一式の分だけ
```

`player.html` がローカルから読むのはこの 2 種類の `.js` だけで、参照は
相対パス。残り（Tailwind・Google Fonts・FontAwesome・読み上げの音声）は
すべて外部から取得する。

- `tools/`・`docs/`・`archives/`・`README.md`・`TODO.md` は**要らない**。
  `tools/measure-duration.py` は `duration` を測るためのもので、再生には
  関わらない
- **ネット接続が要る。** オフラインでは見た目が崩れ、音声も出ない
- **HTTP で配信する。** `file://` で直接開くのは試していない

置き場所の自由度や公開 URL を保つ方法は
[Developer.md の「場所を選ばない」](Developer.md#場所を選ばない)にある。

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
        duration: 5,
        narration: 'これはサンプルのスライドです。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h1 class="font-extrabold text-slate-50"
                        style="font-size: clamp(1.8rem, 5cqw, 3.8rem);">
                        サンプル
                    </h1>
                    <p class="text-slate-200 mt-[1.5cqw]"
                       style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">
                        本文はここに書く
                    </p>
                </div>
            `;
        }
    },
];
```
