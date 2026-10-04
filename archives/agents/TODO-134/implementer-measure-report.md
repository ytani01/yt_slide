# TODO-134 実装前の実測（implementer）

対象は `~/work/slide_backgammon`（HEAD 642d620。`player.html` は yt_slide と同じ）の
`slides/backgammon.js`。`ytslide.browser.serve_root` で作業場所を配り、1920×1080 で撮った。
Playwright 1.63.0（chromium headless）。試作は `archives/agents/TODO-134/framestep_probe.py`
（`uv run --extra video --with pillow python archives/agents/TODO-134/framestep_probe.py ~/work/slide_backgammon backgammon <出力先>`）。
リポジトリのファイルは変えていない（`TODO.md` の差分は main のもの）。

「変化した画素」は、2 枚の PNG で RGB のどれかが 16 を超えて違う画素の数（1920×1080 = 2,073,600 画素のうち）。

## 測った値

### 0. 偽の時計が効く範囲

`page.clock.install()` を `goto` の前に入れ、`pause_at` で止めて `run_for(1000)` すると、
`performance.now()` はちょうど 1000 ms 進み、`requestAnimationFrame` は 64 回呼ばれた
（偽の rAF は 16 ms ごと）。`setTimeout` も偽の時計で動く（render の `setTimeout` は `run_for` で走る）。

### 1. 3 枚目（historyGrow）と 4 枚目（cueDrop）: t=0 から動く

手順: `FIT(i)` → `run_for(50)`（render の `setTimeout` で `narrationClock` が起き、t = null）→
`isPlaying = true; speechRunId++` → `run_for(16)`（次の rAF で t = 0）→ 1/30 秒ずつ進める。

3 枚目の線（`#history-line` の clip-path。8.3 秒・12.5 秒から伸びる）:

| t | clip-path | 前の時刻からの変化画素 |
|---|-----------|------------------------|
| 0 | inset(0 100% 0 0)（線なし） | — |
| 8 | inset(0 100% 0 0) | 56,748（cueSay の札の強調） |
| 10 | inset(0 62.05% 0 0)（1 区間目の途中） | 15,681 |
| 15 | inset(0 0.0006% 0 0)（ほぼ全部） | 136,595 |

4 枚目の写真（`#world-photos [data-cue]` の opacity。0.3・1・1.7・2.4・3.1 秒から落ちる）:

| t | opacity（5 枚） | 前の時刻からの変化画素 |
|---|-----------------|------------------------|
| 0 | 0,0,0,0,0 | — |
| 0.5 | 0.96,0,0,0,0 | 124,618 |
| 2 | 1,1,1,0,0 | 268,424 |
| 8 | 1,1,1,1,1 | 298,724 |
| 10 | 同上 | 0 |
| 15 | 同上 | 14,972（10.1 秒の札の強調） |

見立てどおり、`isPlaying = true` と `speechRunId` の更新で t=0 から動き、偽の時計に合わせて進む。
`isMuted` は偽のまま、`playbackRate` は 1.0 のままで、`narrationClock` の速さは
`min(2.0, 1.4) / 1.4 = 1`。動画の音声は 1.4 倍速なので、t（1.0x の秒）と動画の秒が一致する。

注意: `isPlaying = true` にした直後、rAF を 1 回回す前に撮ると `draw(null)`（動き終わった形）が
映る（初回の実測でそうなった）。`run_for(16)` を挟むこと。

### 2. cueSay の transition（duration-300）は page.clock に従わない → getAnimations で揃う

4 枚目の `data-say="4"` の札（4.0 秒で強調）。1/30 秒ずつ進めて撮った。

| 方法 | t=4.15 の CSSTransition | t=4.15 の box-shadow のリング | 3.9 → 4.15 の変化画素 |
|------|------------------------|------------------------------|------------------------|
| そのまま | running、currentTime 0（実時間で進む） | 1px・alpha 0.2（強調前のまま） | 1,048 |
| 毎コマ同期 | paused、currentTime 150 | 3.33px・alpha 0.667（途中） | 8,319 |
| （参考）t=4.6 | 終わっている | 4px・alpha 0.8 | — |

そのままだと transition は実時間で進むので、撮った瞬間の実時間しだいで映り方が変わる
（コマ送りが速いと強調の瞬間が飛ぶ。初回の実測では 1 回に 250 ms 進めたため currentTime 99.9 で写っていた）。
毎コマ、`document.getAnimations()` を止めて currentTime を偽の時計の経過に合わせると、
0.15 秒後に中間の状態が撮れた。同期の JS は `framestep_probe.py` の `SYNC_JS`
（初めて見たアニメーションを pause し、見た時刻からの経過を currentTime に入れ、終わったら `finish()`）。

### 3. 2 枚目（rulesBattle）と 9 枚目（karenaTwinkle）

- rulesBattle（rAF のタイムスタンプで進む）: 0→0.5 秒で 11,510、0.5→1 秒で 11,523、1→2 秒で 14,945 画素変化。
  時計を進めれば動く。同期は要らない
- karenaTwinkle（`setTimeout` で光を選び、`element.animate()` で光らせる）:
  - そのまま: `element.animate()` は実時間で進む（t=2 で currentTime 1333・900・450。偽の時計の経過と合わない）
  - 毎コマ同期: currentTime が偽の時計の経過に合う（t=0.5 で 500）。変化画素 0→0.5 秒 575、0.5→1 秒 1,431、1→2 秒 1,655。
    `finish()` のあと `onfinish` が来て光が入れ替わり続けることも確かめた（t=5・8・10 秒でも animation があり、
    5→8 秒で 11,725 画素変化）
- どちらも `Math.random` を使うので、撮るたびに絵は変わる（今の静止画と同じ）

### 4. 1 コマの時間（3 枚目、30 コマの平均）

| 処理 | 1 コマあたり |
|------|--------------|
| 時計を 1/30 秒進めて同期（`run_for` + `SYNC_JS`） | 2.4 ms |
| `page.screenshot()` PNG | 412.0 ms |
| `page.screenshot(type='jpeg', quality=90)` | 49.4 ms |
| CDP `Page.captureScreenshot`（jpeg、quality 90） | 42.8 ms |

実際に 3 枚目（18 秒、540 コマ）を CDP の JPEG で撮ると 27.1 秒（1 コマ 50 ms）、
ffmpeg（libx264）で mp4 にするのに 7.6 秒。JPEG は 1 枚 約 570 KB で、540 枚で 309 MB。

172 秒の動画の見積もり（撮る時間は 1 コマ 50 ms、エンコードは 3 枚目の実測から比例で出した）:

| | コマ数 | 撮る（JPEG） | 撮る（PNG） | エンコード | JPEG の一時ファイル |
|---|--------|-------------|------------|-----------|--------------------|
| 30 fps | 5,160 | 約 4.3 分 | 約 35 分 | 約 1.2 分 | 約 2.9 GB |
| 15 fps | 2,580 | 約 2.2 分 | 約 18 分 | 約 0.6 分 | 約 1.5 GB |

PNG は遅すぎるので JPEG（CDP 直か `page.screenshot(type='jpeg')`）にする。今の静止画方式の撮影は 9 枚で数秒。

### 5. 連番から mp4

`ffmpeg -framerate 30 -i f%05d.jpg -c:v libx264 -pix_fmt yuv420p slide3.mp4` で 1920×1080・30/1 fps・540 コマ・18.000 秒、1.8 MB。
1・9.5・15 秒のフレームを抜いて見た: どれも不透明で欠けなし。1 秒は線なし、9.5 秒は 1 区間目の途中まで線が伸びて
中央の札が金色の枠で強調、15 秒は線が右端まで伸びて右の札が強調。動いている。
（抜いたフレームは `~/tmp/playwright-mcp/todo134_slide3_frames.png` に縦に並べて置いた）

## うまくいかなかったこと

- `clock.run_for()` に小数の ms（1000/30）を渡すと `ticks_string: expected string, got number` で落ちる。
  コマの時刻を `round(k * 1000 / fps)` の整数にして差分を渡した
- 同期を撮る時刻にしか呼ばないと、transition を初めて見るのが遅れて currentTime 0 から始まる。毎コマ呼ぶ必要がある
- `page.wait_for_function` は既定で rAF を使うので、偽の時計を止めたあとは使えない（試していないが、使わずに
  Python 側で `document.images` の `complete` を見て待った）

## 方式の案（そのまま実装に使える手順）

`video.screenshot_slides` と `make_clip` を置き換える。

1. ページを作ったら `goto` の前に `page.clock.install()`。読み込み後 `page.clock.pause_at(Date.now() + 1000)`
2. スライドごとに:
   1. `page.evaluate(FIT, i)` → `page.clock.run_for(50)`
   2. 画像の読み込みを Python 側で待つ（`[...document.images].every(i => i.complete)` を実時間で見る）
   3. `isPlaying = true; speechRunId++`（読み上げは呼ばない）→ `page.clock.run_for(16)`
   4. コマ数 n = ceil((読み上げの mp3 の長さ + TAIL_SILENCE_SECONDS) × fps)。k = 0..n-1 で
      `run_for(round(k*1000/fps) - 前回)` → `SYNC_JS` → CDP `Page.captureScreenshot`（jpeg、quality 90）を書き出す
3. クリップは `-loop 1 -i slide.png` の代わりに `-framerate fps -i f%05d.jpg` にし、音声と無音のつなぎ方は今のまま
4. 音声を先に取ってから撮る順に変える（今は撮ってから音声を取る。コマ数に mp3 の長さが要る）

## 判断が要る点（利用者に聞く）

- fps（30 か 15）。172 秒で書き出しが 数秒 → 約 5.5 分（30 fps）か 約 3 分（15 fps）に延びる
- 全スライドをコマ送りにするか、動くスライドだけにするか。動くかは自動では分からない
  （候補: 最初と最後のコマを比べる、`getAnimations()` や rAF の呼び出しを見る、スライド側で印を付ける）。
  全部コマ送りにするのが一番簡単
- 一時ファイル（30 fps で約 2.9 GB）。ffmpeg の stdin に流す（`-f image2pipe`）とディスクに置かずに済む

## 残る懸念

- transition と `element.animate()` の始まりは、同期で初めて見たコマに丸まる（最大 1 コマ＝33 ms 遅れる）
- karenaTwinkle は同期ありだと同時に光る数が 2 までに見えた（同期なしでは 3）。`onfinish` の届き方の差と思うが、
  原因は調べていない（実害は未確認）
- CSS の `@keyframes`（`animate-bounce` など）も `getAnimations()` に CSSAnimation として出るので同じ同期で揃うはずだが、
  試していない。`iterations: Infinity` は endTime が Infinity なので `finish()` されない（そのままでよいはず、未確認）
- `<video>` や GIF は偽の時計にも同期にも従わない（対象外）
- Tailwind の CDN は時計を止めても効いていた（撮った画面にクラスの見た目が出ている）が、
  時計を止める前に `networkidle` まで待つ前提
