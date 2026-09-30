# TODO

**残っている項目: TODO-112、TODO-118。** これまでに 116 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-119` から。**

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

## TODO-118. リンクやボタンにフォーカスが残るとキー操作が効かない

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus / high）+ verifier（Sonnet / medium） |

- [ ] `player.html` の keydown のガードを狭める。`a` は除外の対象から外す。
      `button` は Space・Enter だけブラウザに任せ、←→・Home/End・F・M は効かせる。
      入力欄（`input`・`textarea`・`select`・`contenteditable`）は今までどおり全部任せる

`target="_blank"` のリンク（README.md など）を押して元のタブに戻ると、
フォーカスがリンクに残り、どのキーも効かない。マウスで再生ボタンなどを
押したあとに ←→ が効かないのも同じ原因。

ガードは TODO-076 で「ボタン上の Space が再生操作に化けないように」入れたもので、
Space 以外のキーまで止めていた。リンクの上の Space はリンクを開かない
（ページがスクロールするだけ）ので、`a` を外しても失うものは無い。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
