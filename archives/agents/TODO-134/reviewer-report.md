# TODO-134 レビュー（reviewer）

対象: `git diff -- src tests docs`（未コミット）。コードは変えていない。
実測は scratchpad の一時スクリプトで行った（リポジトリには残していない）。

## 要修正

- **tests/test_video.py:1-4** / 冒頭の docstring が「ネットワーク・ffmpeg・Playwright は使わない」のまま。
  追加した `test_make_video_shows_motion`（156 行〜）は ffmpeg と Playwright（chromium）を起動する。
  同じファイルの中で説明と中身が食い違う
- **docs/Developer.md:25** / `tests/test_video.py` の説明が「分割や字幕の組み立て、`video`・`pdf` の
  引数の受け渡し」のまま。コマ送りで動きが映るかを見るテストが加わったのに書かれていない
  （20 行の `video.py` の行は更新したが、対になるテストの行が残っている）

## 検討

- **src/ytslide/video.py:197-217（clip_writer）** / ffmpeg が先に落ちると、利用者に見えるのは
  `BrokenPipeError` で、ffmpeg のエラー文は捨てられる。実測: mp3 のパスを存在しないものにし、
  1 コマ目を書く前に 0.5 秒置いて（`record_slide` の FIT・読み込み待ちに相当）1.5 MB の JPEG を書くと
  `BrokenPipeError`、`stderr` は空。待たずに小さいデータを書くと `CalledProcessError`（`stderr` に
  `Error opening input` が入る）になり、どちらになるかはタイミングで変わる。
  なお `CalledProcessError` のほうも `cli.py` で捕まえていないので、`stderr` は表示されない
  （これは変更前の `subprocess.run(check=True, capture_output=True)` と同じ）。
  `libx264` の無い ffmpeg など、利用者の環境で起こりうる失敗で原因が分からない。実害は未確認
- **src/ytslide/video.py:207-209** / `stderr=PIPE` を、stdin に書いているあいだ読まない。ffmpeg が
  pipe の容量（64 KB）を超えて stderr に書くと、ffmpeg は stderr で、Python は stdin への書き込みで
  互いに止まる。`-loglevel error` なので普通は起きない。実害は未確認
- **src/ytslide/video.py:45-58（SYNC_ANIMATIONS）** / 初めて見たコマより前に実時間で終わった
  アニメーションは拾えない。FIT から最初の SYNC までは実時間で進む（`wait_loaded` は最大 10 秒）。
  その間に終わった `fill` なしの CSS アニメーション（入場の fade など）は `getAnimations()` から消えていて
  映らない。`fill: forwards` のものは 0 から再生し直す。ローカルの HTTP なので普通は数十 ms で済む。
  実害は未確認
- **docs/UsersGuide.md:557** / 「動画の長さの 2 倍ほど（3 分の動画で 5 分ほど）」の括弧内が 2 倍になって
  いない（3 分の 2 倍は 6 分）。実測は 1.8 倍（172 秒で 307 秒、implementer-report）。
  `video.py:15` は「2 倍近く」。どちらかにそろえる
- **docs/UsersGuide.md:561-564** / 「アニメーションも動画に映る」と言い切っているが、`<video>` 要素・
  GIF・SVG の `<animate>`（SMIL）は `page.clock` にも `getAnimations()` にも従わないはず（implementer が
  「試していない」と報告。reviewer も未確認）。同じ節の「ナレーションに合わせて動かすもの」は
  UsersGuide のどこにも説明が無い（`isPlaying`・`speechRunId` を見るスライドのこと。
  `rg -n 'ナレーションに合わせ' docs` で 563 行だけ）。作る人が自分のスライドが当てはまるか判断できない
- **tests/test_video.py:131-194** / 壊しても落ちない箇所がある（読んで判断。実行していない）
  - `SYNC_ANIMATIONS` を消しても通る。テストのスライドは `style.transform` を rAF で書き換えるだけで
    transition も `animate()` も無く、`getAnimations()` が空。しかも同期が無くても実時間で動くので
    「0 秒と 1 秒で違う」では見分けられない。見るなら、決まった時刻での位置（例: 1 秒の linear の
    `animate()` で 0.5 秒のコマが中間）を確かめる形になる
  - `PLAY`（`isPlaying`・`speechRunId`）と、`record_slide` の先頭の `isPlaying = false` は、どちらを
    消しても通る（スライドが 1 枚で、`isPlaying` を見ていない）
  - クリップの長さ（音声＋無音 2 秒）とコマ数の丸めを見ていない。ffprobe で長さを 1 回見るだけで
    `math.ceil` を `int` にした退行などが落ちる
- **src/ytslide/browser.py:91・src/ytslide/video.py:4** / `TODO-134` を書き足した。プロジェクトの
  `CLAUDE.md` は「番号で参照してよいのはこのファイルと `archives/` の中だけ」とある。一方で `src/` には
  前から `TODO-122`・`TODO-128` などが 10 か所ある（`rg -n 'TODO-' src`）。規約の読み方の判断が要る

## 好みの範囲

- **src/ytslide/video.py:56** / `a.currentTime = elapsed` は `playbackRate` が 1 でないアニメーション
  （`updatePlaybackRate()`・`reverse()`）で速さが変わる。55 行の `endTime` との比較も負の速さでは
  合わない。使うスライドがあるかは未確認
- **src/ytslide/video.py:208-213** / 例外のときに `proc.stdin`・`proc.stderr` を閉じないので
  `ResourceWarning: unclosed file` が出る（`python -W always` で実測）。`with subprocess.Popen(...) as proc:`
  にすれば閉じる

## 問題の無かった観点

- player.html の再生ロジックとの整合: `PLAY` は `playPresentation()`→`speakCurrentNarration()`→`stopSpeech()` の
  `isPlaying = true`・`speechRunId++` と同じ。`renderSlide()` の前に `isPlaying = false` にする理由
  （1275 行で読み上げが始まる）も正しい。`playbackLoop` を起こさないので `currentSlideElapsedTime` は進まないが、
  スライドから使われていない
- 「再生前の形（draw(null)）→ PLAY で 0 秒の形」の切り替えで、transition 付きの要素に実再生には無い
  逆向きの遷移が映るかを測った（再生前は opacity 1、再生中は 1.5 秒まで 0、`transition: opacity 1s`）。
  0.1〜1.4 秒のコマは背景のまま（R の平均 14）で、出なかった
- 音ズレ・`.srt`: 実測でクリップは映像 3.067 秒（92 コマ）・音声 3.082 秒、`.srt` の終了は音声の長さ
  （1.059 秒）。映像が音声より 1 コマ弱短いのは `-t` と AAC の端数で、変更前と同じ。`cursor` は
  `probe_duration(clip)` のままで溜まらない
- 一時ファイル: JPEG は stdin に流すのでディスクに置かない。`TemporaryDirectory` は `open_player` の外側で、
  抜ける順も正しい。例外のときは ffmpeg を kill・wait しており、残らないことを `pgrep` で確かめた
- browser.py: `install_clock` の既定は偽で、`check.py:17`・`pdf.py:25` の呼び方は変わらない。
  `cli.py:290` は `PlayerHandler` だけを使う。`pdf.py` が使う `FIT` は変わっていない
- docs に TODO 番号は無い。Developer.md:20・video.py 冒頭・UsersGuide の方式の説明（30 fps、無音 2 秒、
  時計を止めてコマ送り）はコードと合っている。UsersGuide の出力例の「11.66s（410 コマ）」は
  `ceil((11.66+2)*30)=410` で合う。`README.md` に静止画の記述は残っていない
- `ruff check src tests` は通る

## 作り込みすぎ

- `src/ytslide/video.py:154,158-164: shrink: ループ前の SYNC と if k: の分岐。毎コマ run_for(target - elapsed)（k=0 は 0）→ SYNC にまとめれば 2 行減る（run_for(0) が通るかは未確認）.`

net: -2 lines possible.
