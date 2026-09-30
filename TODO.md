# TODO

**残っている項目: TODO-112、TODO-121。** これまでに 119 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-122` から。**

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

## TODO-121. `test_all_slides_rules_load` の失敗を直す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ verifier（Sonnet 5.5 / medium） |

- [ ] `uv run pytest` の `tests/test_measure.py::test_all_slides_rules_load` を通す

`assert len(common_rules) == 23` が `25 == 23` で落ちる（2026-10-01、TODO-120 の
確認で見つかった。TODO-120 の変更を外した HEAD でも同じ）。共通の置換表
（`player.html` の `SPEECH_RULES`）が 25 件に増えたのに、テストの件数が
古いままになっている、という見立て。着手時に、増えた 2 件がいつ・どの項目で
入ったかを確かめてから、テストと置換表のどちらを直すかを決める。
件数を決め打ちで比べるテストのままでよいかも、そこで見る。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
