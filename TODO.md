# TODO

**残っている項目: TODO-112, TODO-119。** これまでに 117 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-120` から。**

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

## TODO-119. スマホのフルスクリーンでブラウザの UI が残る

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] 擬似フルスクリーンに入るとき `requestFullscreen()` も呼ぶ。使えない環境では今の擬似フルスクリーンだけで動く
- [ ] 抜けるときは `exitFullscreen()` も呼ぶ。ブラウザ側で抜けたとき（戻るジェスチャーなど）は `fullscreenchange` を受けて擬似フルスクリーンも解除する
- [ ] iPhone 向けに、ホーム画面から起動したときブラウザの UI が出ないようにする
- [ ] `docs/Developer.md` の「擬似フルスクリーン」、`docs/UsersGuide.md` か README に iPhone での使い方を足す

スマホで最大化しても URL バーなどが残る。今のフルスクリーンは CSS だけの
擬似フルスクリーン（`setFullscreen`）で、Fullscreen API を呼んでいないため。

Android の Chrome・Firefox と iPad の Safari（iPadOS 16.4 以降）は API で
UI まで消せる。**iPhone の Safari は要素の Fullscreen API を持たない**ので、
ブラウザの UI を消せるのは「ホーム画面に追加」から起動したときだけ。

**着手時に決めること** — iPhone 向けを `apple-mobile-web-app-capable` の
meta で済ませるか、manifest（`display: fullscreen`）を置くか。manifest の
`start_url` は 1 つなので、`?slides=<名前>` ごとに追加したい場合に合うかを
先に確かめる。

**実装の前に確かめること** — 本物のフルスクリーン中に `100dvh` の
レターボックスがそのまま画面に合うか、`body.fs-lock` と暗幕が要るままか。
Android 実機か、Playwright の headed chromium で測る。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
