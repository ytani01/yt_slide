# TODO-134 本実装（implementer）

方式は利用者が決めたとおり、全スライドをコマ送り・30 fps・JPEG で撮る。
実装前の実測は `implementer-measure-report.md`。

## 変更点

- `src/ytslide/browser.py:88` `open_player(slides_name, install_clock=False, ...)`。
  真なら `goto` の前に `page.clock.install()`（96 行）
- `src/ytslide/video.py`
  - 1〜20 行: 冒頭の説明をコマ送りの方式に書き換えた
  - 37〜60 行: `FPS = 30`、`JPEG_QUALITY = 90`、`PLAY`（`isPlaying = true; speechRunId++`）、
    `SYNC_ANIMATIONS`（毎コマ `getAnimations()` を止めて、偽の時計の経過を currentTime に入れる。
    終わった分は `finish()`）、`LOADED`（画像と font の読み込み）
  - 130 行 `wait_loaded`: `LOADED` を実時間で最大 10 秒待つ（`wait_for_function` は rAF で見張るので、時計を止めると進まない）
  - 141 行 `record_slide`: `isPlaying = false` → `FIT` → `run_for(50)` → 読み込みを待つ → `PLAY` → `run_for(16)` →
    `ceil(秒数 × 30)` コマを、`run_for` と `SYNC_ANIMATIONS` で 1 コマずつ進め、CDP の
    `Page.captureScreenshot`（jpeg）で撮って ffmpeg の stdin に書く。
    先に `isPlaying = false` にするのは、再生中に `renderSlide()` を呼ぶと読み上げが始まり、
    終わりのタイマーで次のスライドへ進んでしまうから（`player.html` の 1275 行）
  - 191 行 `clip_writer`: `make_clip` の代わり。`-f image2pipe -framerate 30 -c:v mjpeg -i -` で
    コマを受け、音声と無音のつなぎ方・`-t 音声＋無音`・エンコードの設定は前のまま。一時ファイルは作らない
  - 229 行 `make_video`: 先に音声を取って長さを測り、その長さ＋`TAIL_SILENCE_SECONDS` 秒ぶん撮る順にした。
    ブラウザは一式で 1 回だけ開く（241 行で時計を止める）。`.srt` と `cursor` の計算は変えていない。
    進み具合の表示は `スライド N: 読み上げ音声を取得中…` と `スライド N: 11.66s（410 コマ）` にした
  - `screenshot_slides`・`make_clip` は消した（使うところはほかに無い。`pdf.py` は `FIT` だけを使う）
- `tests/test_video.py:131` `MOVING_SLIDES` と 156 行 `test_make_video_shows_motion`: performance.now と rAF で
  赤い四角を動かすスライドを、TTS を 0.5 秒の無音に差し替えて書き出し、0 秒と 1 秒のコマで 32 を超えて違う画素が
  1 万を超えることを見る。playwright・ffmpeg・chromium が無ければ skip
- `docs/UsersGuide.md:544〜565`: 出力例、方式（コマ送り・30 fps・音ズレしない）、時間の目安（動画の長さの 2 倍ほど）、
  アニメーションが映ること、`Math.random()` の動きは毎回変わること
- `docs/Developer.md:20`: `video.py` の行に、`page.clock`・再生中の状態・`getAnimations()` で合わせることを書いた
- `archives/agents/TODO-134/framestep_probe.py`: ruff の RUF007 だけ直した（`itertools.pairwise`）

`TODO.md` のチェックは入れていない（implementer の定義で `TODO.md` を触らないことになっているので、main に任せる）。

## 検証

| コマンド | 結果 |
|----------|------|
| `uv run ruff check src tests archives/agents/TODO-134` | 成功（0）。リポジトリ全体の `ruff check` は、`archives/` の古いスクリプトに前からの指摘がある |
| `uv run pytest -q` | 42 passed（0）、5.5 秒。新しいテストは skip されずに走る |
| `uv run --extra video pytest -q -rs` | 42 passed（0） |

テストが壊れたら落ちることも確かめた（確かめたあとで元に戻した）:

- 全部のコマに 1 コマ目を書く（静止画に戻すのと同じ）→ `assert 0 > 10000` で落ちる
- コマのあいだに `page.clock.run_for` を呼ばない → `assert 0 > 10000` で落ちる

## 測った値

### slide_backgammon 全 9 枚（`ytslide video --slides backgammon --root ~/work/slide_backgammon --out <scratchpad>`）

- 所要 307 秒。動画の長さは 172.60 秒（video 172.56 秒・5,176 コマ・30 fps、audio 172.59 秒）。mp4 は 12 MB。
  （音声の合計 154.49 秒 + 無音 2 秒 × 9 = 172.49 秒。ずれは各クリップの AAC の丸めで、前と同じ）
- `.srt` の開始時刻は、次のクリップの開始＝前のクリップの終了＋2 秒前後（例: 0〜5.798、7.800〜21.020、23.033〜…）
- 3 枚目（23.033 秒から）: 1・10・15 秒のコマで、1→10 秒が 85,830 画素、10→15 秒が 151,684 画素変化。
  目で見ても、線なし → 中央の点まで線が伸びて中央の札を強調 → 右端まで伸びて右の札を強調。
  線が x=400 に届くのはクリップの 8.433 秒（伸び始めは 8.3 秒の設定。1〜2 コマの差）、x=700 は 9.200 秒
- 4 枚目（42.579 秒から）: 0.5・2・8 秒のコマで、0.5→2 秒が 275,474 画素、2→8 秒が 295,731 画素変化。
  目で見ても、写真 1 枚・「0.1億」→ 写真 3 枚・「1.1億」→ 写真 5 枚・「3億」。どのコマも不透明で欠けは無い

### 動かないスライド（yt_slide の readme、`--only 1 --only 2`）

- 所要 48 秒、43.99 秒の動画。クリップの長さは 20.81 秒（音声 18.81 秒 + 無音 2 秒）で、2 枚目の字幕の開始も 20.810 秒
- 前の方式（`FIT` のあと `page.screenshot` の PNG）と、新しい動画の途中のコマ（1 枚目の 10 秒、2 枚目の 31 秒）を比べて、
  48 を超えて違う画素は 0（16 を超えるのは 1,399・1,300 画素で、JPEG と H.264 の圧縮による差）。並べて目で見ても同じ

### `animate-bounce`（scratchpad の一時スライドで確かめた）

0・0.25・0.5・1.0・1.5 秒のコマを 0 秒と比べると、変化画素は 0・2,614・17,577・0・17,577。
1 秒周期で動き、偽の時計どおりに戻るので、CSS の `@keyframes` も揃う（UsersGuide に「映る」と書いた根拠）。

### karenaTwinkle で光る数が減って見えた件

減っていなかった。10 秒間に同時に光っている数（`getAnimations().length`）を数えた:

| | 1 個 | 2 個 | 3 個 | 10 秒に作った数 / 終わった数 |
|---|------|------|------|------------------------------|
| 実時間（時計を止めない、0.1 秒ごとに 100 回） | 17% | 50% | 33% | 18 / 15 |
| コマ送り＋同期（300 コマ） | 20% | 47% | 33% | 16 / 14 |

分布は同じで、`finish()` のあとの `onfinish` も届いている（作った数と終わった数が揃って増える）。
前の報告の「2 まで」は、t=0.5・1・2 秒の 3 点だけを見たためのばらつき。直す必要は無いと考える。

## 残る懸念

- 書き出しは動画の長さの約 1.8 倍かかる（172 秒で 307 秒）。UsersGuide には「2 倍ほど」と書いた。遅い端末では延びる
- `wait_loaded` は 10 秒待っても読み込みが終わらなければ、そのまま撮り始める（エラーにしない。前の方式も待っていなかった）
- ffmpeg が途中で落ちると、Python 側は `BrokenPipeError` になり、ffmpeg のエラー文は出ない（引数の誤りなどでしか起きない想定。実害は未確認）
- transition と `element.animate()` の始まりは、初めて見たコマに丸まる（最大 1 コマ＝33 ms 遅れる）
- 新しいテストは chromium と ffmpeg を起動するので、`uv run pytest` が 1.3 秒から 5.5 秒になった
- `<video>` 要素や GIF は偽の時計に従わないはず（試していない）。UsersGuide には書いていない
- `uv run pytest`（`--extra video` なし）で新しいテストが skip されなかった。`.venv` に playwright が残っているためで、
  playwright が無い環境では skip される

---

# レビュー指摘の修正（reviewer-report.md を受けて）

## 変更点

- 要修正
  - `tests/test_video.py:1-6` docstring を、ffmpeg・chromium を起動するテストがあることに合わせた
  - `docs/Developer.md:25` `tests/test_video.py` の行に、コマ送りの書き出しのテストと ffmpeg のエラーのテストを書き足した
- ffmpeg が落ちたとき
  - `src/ytslide/video.py:190 clip_writer`: stderr を `tempfile.TemporaryFile()` で受ける（207 行。パイプが詰まる心配が無くなる）。
    `with subprocess.Popen(...)` にした（ResourceWarning も消える）。書き込みが `BrokenPipeError` になったら、
    ffmpeg の終了を待ち、エラー文を持った `CalledProcessError` にする。stdin を閉じるときの `BrokenPipeError` は抑える
    （219 行。抑えないと元の例外が `BrokenPipeError` に化ける）
  - `src/ytslide/cli.py:250` `video` コマンドで `CalledProcessError` を捕まえ、`ffmpeg が失敗した（終了コード N）:` と
    エラー文の末尾 5 行を `ClickException` で出す（atempo・連結・ffprobe・curl の失敗も同じ形で出る。curl は
    エラー文を捕まえていないので、端末にそのまま出る）
- テスト（`tests/test_video.py`）
  - 133 行 `test_video_command_shows_ffmpeg_error`: `make_video` を、エラー文付きの `CalledProcessError` を投げるものに
    差し替え、終了コード 1 とエラー文の末尾が表示されることを見る（外部のプログラムは起動しない）
  - 160 行 `test_clip_writer_reports_ffmpeg_error`: mp3 が無い状態で本物の JPEG を書き続け、`BrokenPipeError` ではなく
    `CalledProcessError` になり、stderr に mp3 のパスが入ることを見る（起動するのは ffmpeg だけ。0.1 秒）
  - 187・239 行 `test_make_video_frame_step`: 前の `test_make_video_shows_motion` を置き換えた。書き出すのは 1 回だけ（2 枚）
    - 1 枚目: `element.animate()`（linear、2 秒）。動き始めたら実時間を 0.3 秒ほど費やす。0 秒・1 秒のコマで、
      緑の目印からの動きが 0（誤差 0.03 まで）・0.5（誤差 0.04 まで）であることを見る
    - 2 枚目: `isPlaying`・`speechRunId` を見て動く四角（再生前は動き終わった位置）。0 秒・1 秒で 0・0.5 であることを見る。
      `fallbackAudioElement` ができたら（読み上げが始まったら）四角を隠す
    - 2 枚目の字幕の開始が、1 枚目の音声＋2 秒と等しいこと（誤差 0.05 秒まで）。映像のコマ数が
      Σ(音声＋2 秒)×30 から「クリップの数」引いた値以上、Σ(音声＋2 秒)×30 以下であること
- `src/ytslide/video.py:157` 作り込みすぎの指摘のとおり、ループ前の同期と `if k:` をまとめた（`run_for(0)` が通ることはテストで確かめた）
- `docs/UsersGuide.md:557` 「（3 分の動画で 6 分ほど）」に直した。561〜562 行は「JavaScript と CSS のアニメーション
  （`animate-bounce` など）は動画に映る。`<video>`・GIF・SVG の `<animate>` は映らないことがある」にし、
  「ナレーションに合わせて動かすもの」の文を外した

## 消して落ちることの確認（1 つずつ壊し、確かめたら戻した）

| 壊したところ | 結果 |
|--------------|------|
| `SYNC_ANIMATIONS` を `() => {}` に | 3 回とも落ちた（0 秒で 0.267・0.259 進んでいる、または 1 秒で 0.716） |
| `PLAY` を `() => {}` に | 落ちた（2 枚目の 0 秒が 1.0） |
| `renderSlide()` の前の `isPlaying = false` を消す | 落ちた（2 枚目の四角が見つからない＝読み上げが始まった） |
| 撮る長さから末尾の無音を外す | 落ちた（コマ数 22、期待 140.82） |
| `clip_writer` の `BrokenPipeError` をそのまま投げる | 落ちた（`BrokenPipeError`） |

壊さない状態では、`SYNC_ANIMATIONS` の検査は 0.0・0.499 と 0.0・0.496〜0.504 で通った。

**最初の版で失敗したこと**: busy loop を `animate()` の直後に置くと、時刻合わせを消しても通った（開始時刻が決まるのは
次のフレームなので、その前に時間を使っても動きは進まない）。`a.ready.then` の中に移して直した。

**レビューの見立てと違った点**: 「`math.ceil` を `int` にした退行」は、テストでは捕まえられない（実害も無い）。
ffmpeg の `-t` は、終わりが `-t` を超えるコマを落とす。だから出力のコマ数は、切り上げでも切り捨てでも
`floor((音声＋2 秒)×30)` で同じになる（実測: 1 クリップ 71 コマ撮って 70 コマが残った）。代わりに、無音の分を撮り忘れる退行を捕まえる形にした。

## 検証

| コマンド | 結果 |
|----------|------|
| `uv run ruff check src tests` | 成功（0） |
| `uv run pytest -q` | 44 passed（0）、10.7 秒 |

## 直さなかったもの

- `SYNC_ANIMATIONS` は、初めて見るより前に実時間で終わったアニメーションを拾えない: ローカルの HTTP で読み込み待ちは普通数十 ms で、拾うには `FIT` の前からアニメーションを横取りする仕組みが要り、割に合わない
- `playbackRate` が 1 でないアニメーション（`updatePlaybackRate()`・`reverse()`）: 使っているスライドが無く、使われたら直す
- `src` の TODO 番号: 指示どおりそのまま（既存の書き方に合わせた）

## 残る懸念

- `test_make_video_frame_step` は 1 枚目で実時間を 0.3 秒ほど費やすので、`uv run pytest` 全体は 10.7 秒になった（変更前は 1.3 秒）
- busy loop の長さ（`1e9` 回）は、この端末で 0.3 秒ほど。とても速い端末では、時刻合わせを消したときの検出の余裕が減る
  （許容は 0.03 で、この端末では消すと 0.26 前後になる）
