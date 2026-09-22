# TODO-113. 書き間違いの事前チェックと、失敗したときの案内を検討する

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | main のみ |
| 実施 | Opus 5 / effort 不明 | main のみ |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | 不明 | 15,884 | 36,410 | 100% |
| 合計 |  |  | 15,884 | 36,410 | 概算 $1.5 |

- 決めるだけの項目なので担当は立てていない
- main の effort は、このセッションでは確認する手段が無かった。見込みの
  Sonnet 5 に対して、実際は Opus 5 で動いた

## きっかけ

スライドは JavaScript ファイルなので、カンマの抜け・括弧の閉じ忘れ・
必須キーの書き忘れで読み込みに失敗する。今は画面がどうなるかを確かめて
いなかった。非プログラマが書く前提（TODO-103）なら、失敗したときに
「どのファイルの何行目が怪しいか」が分かる必要がある。

## 調べたこと

最小のスライド一式（2 枚）を作り、9 通りに壊して Chromium（Playwright）で
`player.html` を開き、画面・コンソール・再生の挙動を見た。

| 壊し方 | 今どうなるか |
|---|---|
| カンマ抜け | 「スライドのデータ slides/x.js を読み込めませんでした。／一覧へ戻る」（TODO-041 の案内）。行番号は出ない |
| 括弧の閉じ忘れ | 同上 |
| 構文が壊れた書き換え | 同上 |
| `title` 欠け | 画面は動く。一覧と操作欄に「1. undefined」 |
| `narration` 欠け | 字幕が空、読み上げなし、状態が「停止中」のまま次へ進まない |
| `duration` 欠け | 時間表示が `NaN:NaN`、進行バーが出ない、すぐ次のスライドへ飛ぶ |
| `body` も `render()` も無し | 本文に「undefined」と表示 |
| 存在しない画像パス | 画面には何も出ない。コンソールに 404 だけ |
| `slideData` が空配列 | 「0 Slides」、コンソールに `Cannot read properties of undefined` |

**構文エラーの行番号は、ブラウザ側で取れる。** `document.write` の前に
`window.addEventListener('error', …, true)` を置くと、実測でこう取れた。

```
nocomma  → slides/nocomma.js:12:9  Uncaught SyntaxError: Unexpected identifier 'narration'
noclose  → slides/noclose.js:21:1  Uncaught SyntaxError: Unexpected end of input
notarray → slides/notarray.js:9:5  Uncaught SyntaxError: Unexpected token '{'
```

`node --check` でも同じように行番号が出ることを確かめたが、`ytslide` は
今 Python だけで動くので、前提が 1 つ増える。

キーの欠けは構文としては正しいので、`error` イベントでは捕まらない。
別に見る必要がある。

## 決めたこと

1. **場所は両方。** 検査の中身は `player.html` に 1 か所だけ置き、
   `ytslide check` は Playwright で `player.html` を開いてその結果を
   端末に出す（検査の基準が 2 箇所に分かれない）
2. **見る範囲は 3 つ。** 構文エラー（行番号付き）、必須キーの欠け
   （`title`・`narration`・`duration`・`body`/`render`）、存在しない画像パス。
   `duration` と実測の食い違いは**見ない**（`ytslide measure` があり、
   役割が重なる）
3. **画面への案内は、既存のものに足す。** TODO-041 の「読み込めませんでした」に
   ファイル名・行番号・エラーの内容を足す。TODO-078 の音声の失敗通知の帯は
   使わない（読み込みに失敗すると再生自体が始まらないので、帯を出す場所が違う）

実装は **TODO-117** として立てた。

## テスト

この項目は方針を決めるところまでなので、コードは変えていない。壊した
スライドは作業用ディレクトリに置いただけで、リポジトリには入れていない。
