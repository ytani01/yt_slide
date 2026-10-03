# TODO

**残っている項目: TODO-133、TODO-134。** これまでに 132 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-135` から。**

---

## TODO-133. ネットが無い場所では動画にしておくよう文書で勧める

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main のみ |

- [ ] `README.md` の「ネット接続は要る」（48 行目・114 行目付近）の後に、ネットが無い場所では前もって `ytslide video` で動画にしておくよう勧める 1 文を足す
- [ ] `docs/UsersGuide.md` の「ネット接続が要る」（100 行目・625 行目付近）にも同じ勧めを足し、動画の書き出しの節（540 行目付近）へ案内する。540 行目の「オフラインの上映」とつながるように書く

TODO-132（オフライン対応）を対応しないと決めたので、その代わりに動画を勧める（利用者の指示）。
スライド（`slides/readme.js`・`users-guide.js`）はナレーションと duration の測り直しが要るので触らない。
文書だけの変更で、試せるコマンドは既存の `ytslide video` だけなので、担当は main のみ。

---

## TODO-134. 動画にするとき JavaScript のアニメーションが動かないことがある

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5 / medium） |

- [ ] 動かない例を集め、原因を確かめる
- [ ] 決めた方式で、動画にアニメーションが映るようにする（または文書で制約を書く）

利用者の報告。`ytslide video` は各スライドを Playwright で **1 枚の PNG に撮り**、
静止画と音声をつないでいる（`src/ytslide/video.py` の冒頭。画面録画はしない）。
だから JavaScript や CSS のアニメーションは、撮った瞬間の 1 コマになる。
`docs/UsersGuide.md` の 559 行目付近にも「`animate-bounce` のようなアニメーションは
静止画になる」とある。「動かないことがある」の「ことがある」が、撮る瞬間に
よって映り方が変わる（途中のコマや最初のコマになる）という意味かは確かめる。

**slide_backgammon のセッションからの調査（2026-10-04、コードを読んだだけで未実測）:**

- 再現: `~/work/slide_backgammon`（HEAD 642d620）で
  `ytslide video --slides backgammon --out ~/Videos/slide_backgammon`
- 動きのほとんどは `narrationClock(el, draw)`（`slides/backgammon.js` 175 行付近）で、
  再生中でない（`isPlaying` が偽）あいだは `draw(null)` で**動き終わった形**を描く。
  撮るときは再生していないので、PNG は毎回この形になる（強調も無い）
- 撮る瞬間で映り方が変わるのは、時計を見ずに `requestAnimationFrame` で回り続ける
  `rulesBattle`（2 枚目）と `karenaTwinkle`（9 枚目）だけ（どちらも `Math.random` あり）
- 失われる動き: 線が伸びる `historyGrow`、写真が落ちてくる `cueDrop`、札の強調 `cueSay`
  （`transition duration-300` 付き）。2〜9 枚目のほぼ全部
- 時計は `performance.now()` と `requestAnimationFrame`。`t` は 1.0x の秒で、
  `getEffectiveSpeed()/BASE_SPEED_MULTIPLIER` を掛けて進む。コマ送りにするなら
  `page.clock` で時計を進め、`isPlaying = true` と `speechRunId` の更新で t=0 から
  動き出すはず（未確認）。尺は読み上げの mp3 の長さで分かる

**着手時に調べること:** 上の見立てを実測で確かめる。

**調べてから決めること:**（調べた結果を見せて利用者に聞く）

- 方式。今の静止画のまま撮る時刻を揃えるだけか、アニメーションのあるスライドだけ
  コマ送りで撮る（Playwright の `page.clock` などで時計を進めて連写する）か、
  画面録画にするか、文書で制約を明記するだけにするか
- コマ送りや録画にするなら、書き出しの時間がどれだけ延びてよいか

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
