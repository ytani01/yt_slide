# TODO

**残っている項目: TODO-112、TODO-122。** これまでに 120 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-123` から。**

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

## TODO-122. Claude Code にスライドを作らせる手順を示し、init --claude で CLAUDE.md を置く

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort high | main（実装・文書・スライド）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] `docs/UsersGuide.md` の「AI に作ってもらう」の次に「Claude Code で作る」の節を足す
- [ ] `ytslide init` が作業場所に `docs/UsersGuide.md` も置く（いつも）
- [ ] `ytslide init --claude` のときだけ `CLAUDE.md` も置く
- [ ] どちらも既にあれば上書きしない（他のファイルと同じ）
- [ ] `CLAUDE.md` の中身は `init` のコード（`src/ytslide/cli.py`）に文字列で持つ
- [ ] `UsersGuide.md` を同梱データに足す（`pyproject.toml` の `force-include`）。テストを足す
- [ ] `slides/users-guide.js` の「AI に作ってもらう」の次に 1 枚足す
- [ ] README・`docs/UsersGuide.md` の `init` で何ができるかの説明を直す

「AI に作ってもらう」はチャット型の AI に添付し、返ってきたコードを手で保存する
前提で書いてある。Claude Code ならファイルを直接読み書きし、`ytslide check`・
`measure`・`update` も自分で実行できるので、手順が変わる。流れは
「構成案だけ出させて承認 → 書かせる → `check` → スクリーンショットで見た目 →
人が再生して読みを聞く → 番号で直しを伝える → `update` → 必要なら `video`」。

`init` した作業場所には `docs/UsersGuide.md` が無く、Claude Code に書式を
読ませられない。`UsersGuide.md` は GitHub の URL を読ませず、同梱して置く
（オフラインでも読め、入れた版とずれない。利用者が決めた）。
`--claude` を付けなくても置く。チャット型の AI に渡すときにも手元にあるとよい
（利用者が決めた）。

**`CLAUDE.md` はテンプレートのファイルを置かず、`init` のコードに文字列で持つ。
生成するのは `--claude` を付けたときだけ**（どちらも利用者が決めた）。テンプレートをファイルとしてリポジトリやパッケージに置くと、
Claude Code がそれを自分への指示と取り違えるおそれがある。`UsersGuide.md` に
載せてコピーしてもらう案もあったが、手間が残るのでやめた。中身は
「`docs/UsersGuide.md` を読む」「`player.html` を触らない」
「書いたら `ytslide check`」程度にし、依頼文から毎回の 2〜3 行を省けるようにする。

**ナレーションを足すので、`users-guide.js` の読みは利用者が先に聞いて確かめる**
（確認の担当はそのあとに起こす）。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
