# TODO-134. 動画にするとき JavaScript のアニメーションが動かないことがある

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5 / medium） |
| 実施 | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 78 | 15,913 | 506,158 | 4,236,308 | 32% |
| implementer | Opus 5.5 | medium | 160 | 13,877 | 454,642 | 8,156,443 | 58% |
| reviewer | Opus 5.5 | high | 38 | 5,601 | 92,066 | 1,141,102 | 8% |
| verifier | Sonnet 5.5 | medium | 10 | 474 | 46,224 | 85,902 | 1% |
| 合計 |  |  | 286 | 35,865 | 1,099,090 | 13,619,755 | 計 14,754,996 |

- implementer は定義のモデルが sonnet。page.clock とアニメーションの時刻合わせが込み入るので Opus 5.5 に上書きした
- verifier は見込みでは Sonnet 5 と書いたが、`sonnet` を指定して Sonnet 5.5 で動いた
- implementer は 1 つの担当に、実測 → 本実装 → レビュー指摘の修正を続けて頼んだ。途中で API の利用上限で 1 度止まり、再開させた
- 範囲には、立ててから着手までのあいだの TODO-133 を立てたやり取りも少し入っている

## きっかけ

利用者の報告。slide_backgammon を `ytslide video` で書き出すと、ナレーションに
合わせた動きがすべて消える。`ytslide video` は各スライドを 1 枚の PNG に撮って
静止画と音声をつないでいたので、動きは原理的に入らない。slide_backgammon の動きの
ほとんどは `narrationClock` で、再生中でないあいだは動き終わった形を描くため、
「途中の 1 コマ」ではなく毎回同じ最後の形が撮れていた（slide_backgammon の
セッションの調査）。

## やったこと

実測（`archives/agents/TODO-134/implementer-measure-report.md`）を見て、利用者が
「全スライドを `page.clock` のコマ送りで 30 fps・JPEG で撮る」「書き出しに時間が
かかるのは構わない」と決めた。

- `src/ytslide/video.py`: 各スライドを、読み上げ音声の長さ + 末尾の無音の分だけ
  コマ送りで撮る。時計を止め、再生中の状態（`isPlaying`・`speechRunId`）にして
  1/30 秒ずつ進め、毎コマ `getAnimations()` で CSS transition と `element.animate()` の
  時刻を合わせる。JPEG は ffmpeg の stdin に流し、一時ファイルにためない。
  ffmpeg が落ちたときは、エラー文の末尾を添えて止まる
- `src/ytslide/browser.py`: ページを開くときに `page.clock` を入れられるようにした
- `src/ytslide/cli.py`: ffmpeg のエラーを表示する
- `tests/test_video.py`: 動くスライドを短く書き出し、動きが映ること、時刻合わせ・
  再生中にする操作・末尾の無音の分のコマ・ffmpeg のエラー処理を確かめる。
  それぞれ壊すと落ちることを implementer が確かめた
- `docs/UsersGuide.md`・`docs/Developer.md`: 動きが映ること、書き出しに動画の
  2 倍ほどかかること、`<video>`・GIF・SVG の `<animate>` は映らないことがあること、
  乱数を使う動きは書き出すたびに変わること

## 確かめたこと

- verifier: pytest 44 件・ruff が通った。slide_backgammon（172.6 秒）の書き出しは
  311 秒。3 枚目・4 枚目の途中のフレームで動きが映り、欠け・操作パネルは無い。
  readme（動かないスライド）の見た目は崩れていない
- slide_backgammon のセッション: 全 9 枚の cue の前後 66 フレームを見て、
  6 種類の動き（historyGrow・cueDrop・cueSay・data-say-pop・rulesBattle・karenaTwinkle）が
  意図した時刻・形で映っていた。5 枚目の強調の始まりのずれは 1〜2 コマ
- .srt は旧版と 4 枚目以降で 0.01〜0.08 秒ずれる。クリップの長さが 1/30 秒単位に
  丸まるためで、字幕の時刻は出来たクリップの長さで進めるので新しい動画とは合っている。
  このままにした
- 直さなかったもの（implementer の報告に理由）: 初めて見るより前に終わった
  アニメーションを拾えない件、`playbackRate` が 1 でないアニメーションの件
- `uv run pytest` は 1.3 秒から約 11 秒に延びた（chromium と ffmpeg を起動するため）

## 残ること

- slide_backgammon の 4 枚目「世界の遊戯人口」の札は強調の枠が映らない。旧版でも
  同じでスライド側の不具合（slide_backgammon 側で扱う）

## 分担の振り返り

- **implementer** は実装の前の実測で、CSS transition が `page.clock` に従わないことと
  1 コマの時間を測り、方式を決める材料を出した。karenaTwinkle の光る数が減る
  という懸念も、測り直して誤りだと示した。**reviewer** は、テストを壊しても落ちない
  3 か所と、ffmpeg のエラー文が出ない件を見つけた。**verifier** は .srt の新旧の差を
  見つけた（実害なし）。slide_backgammon のセッションが、動きの時刻をコマ単位で確かめた
- 見込みとの食い違いは verifier のモデル（Sonnet 5 → 5.5）だけ
- 次に同じ規模で「方式を実測で決める」項目をやるなら、今回と同じく実測を
  implementer に頼み、そのまま本実装まで続けさせる（測り直しが要らない）。
  implementer が全体の 58% を占め、そのほとんどは cache_read なので、レビュー指摘の
  修正は会話が長くなった担当に続けさせず、新しく起こした担当に報告ファイルを
  読ませたほうが少なく済んだかもしれない
