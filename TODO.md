# TODO

**残っている項目: TODO-112、TODO-120。** これまでに 118 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-121` から。**

---

## TODO-112. PDF に書き出せるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | implementer + reviewer + verifier |

- [ ] `ytslide pdf <名前>` で、スライド全枚を 1 スライド 1 ページの PDF に出す
- [ ] 出力に載せるのはスライドの見た目だけ。ナレーション文・字幕・操作 UI は入れない
- [ ] `docs/User.md` の「`ytslide` のサブコマンド」と README に足す

配布先から「PDF をください」と言われたときに渡すものが無い。今ある書き出しは
MP4 と `.srt` だけで、印刷にも回覧にも向かない。

`src/ytslide/video.py` が Playwright（chromium）で `player.html` を開いて
撮っているので、その仕組みを使い回して `page.pdf()` に流す。`video` と同じく
Playwright が要るため、extra は `video` に相乗りさせるか `pdf` を分けるかを
着手時に決める。

**実装の前に確かめること** — `page.pdf()` は chromium のヘッドレスでしか
動かず、背景色は `print_background=True` が要る。ページサイズを 16:9 に
合わせられるか、スライドの縮小経路（container query）が印刷時にどう効くかを、
1 枚で実際に出して見てから全体を組む。

---

## TODO-120. 開いたまま `#N` だけ書き換えても N 枚目へ移るようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] `hashchange` を受け取って、`#N` の N 枚目を表示する

`player.html` は `#N` を起動時に 1 回だけ読む（TODO-074）。`#` の後ろだけが
変わってもブラウザはページを読み直さないので、アドレスバーで `#4` を `#7` に
書き換えても表示は 4 枚目のままになる。Playwright で `#4` → `#7` と続けて
開いたときも同じで、URL は `#7`、表示は `04` だった（2026-10-01 実測）。
slide_backgammon の TODO-052 で見つかった。

表示中に `history.replaceState` で `#N` を書き換えているが、`replaceState` は
`hashchange` を起こさないので、受け取っても繰り返し呼ばれることはない。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
