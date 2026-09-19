# TODO-066 implementer 報告

## 変更したファイル

- `tools/make-video.py`（新規）— MP4 と `.srt` を書き出すツール本体
- `tools/test_make_video.py`（新規）— `split_for_tts()` / `srt_timestamp()` /
  `build_srt()` の自己テスト。ネットワーク・ffmpeg・Playwright は使わない
- `tools/measure-duration.py:97-101` — TTS の URL 組み立てを `tts_url(text)` に
  切り出した。`measure()`（`tools/measure-duration.py:117-119`）はそれを呼ぶだけに変更。
  他の関数の中身・引数・挙動は変えていない
- `.gitignore:7-13` — `/video/` を追加
- `README.md:64-77`（ファイル構成の表に行追加）、`README.md:79-89`
  （「## 動画に書き出す」節を新設）
- `docs/User.md:152-176`（「## 動画に書き出す」節を「## 公開」の前に新設）

## 実装の内容（依頼文どおり）

- `slides/<名前>.js` から `narrations()` でナレーションを取得
- Playwright（chromium）で 1 ページを開いたまま `page.evaluate(FIT, i)` を
  枚ごとに呼び直して PNG を撮影（依頼文の実測済みコードをそのまま使用）
- 読み上げ文は `prepare()` を通し、`TTS_MAX_CHARS`（180）超は
  `split_for_tts()` で `。、！？` の位置で分割、`curl` で個別に mp3 を取り
  `ffmpeg concat` で連結（切り捨てない）
- `ffmpeg atempo=1.4`（`BASE_SPEED_MULTIPLIER`）を掛けた後、`ffprobe` で
  実際の長さを測定
- 1 枚 = 静止画 + 音声 + 末尾 `TAIL_SILENCE_SECONDS`（=2、player.html の
  待ちの既定に合わせて定数化）の無音（`anullsrc`）
- 連結して MP4（h264 / yuv420p / 1920×1080 / aac）
- `.srt` は 1 枚 1 件、開始は累積時刻、終了は開始+音声長（無音は含めない）、
  本文は `prepare()` を掛ける前のナレーション

## 検証結果

### `python3 tools/test_make_video.py`
```
OK
```

### `python3 tools/test_measure_duration.py`
```
OK
```
（`tts_url()` 切り出し後も通ることを確認）

### 実行: `tools/make-video.py --slides readme --only 1 2`
```
スライド 1: 撮影済み。読み上げ音声を取得中…
スライド 1: 11.66s
スライド 2: 撮影済み。読み上げ音声を取得中…
スライド 2: 12.14s
video/readme.mp4 と video/readme.srt に書き出した
```

### `ffprobe` で出来た MP4 を確認
```
$ ffprobe -v error -show_entries stream=codec_type,codec_name,width,height \
  -show_entries format=duration -of default=noprint_wrappers=1 video/readme.mp4
codec_name=h264
codec_type=video
width=1920
height=1080
codec_name=aac
codec_type=audio
duration=27.883000
```
音声・映像とも存在し、解像度 1920×1080、長さは 11.66+2+12.14+2=27.80s の
実測（27.883s、concat の丸めで数十ms のずれ）と符合。

フレーム数でも確認:
```
$ ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,nb_frames \
  -of default=noprint_wrappers=1 video/readme.mp4
avg_frame_rate=25/1
nb_frames=696
```
25fps × 27.88s ≈ 697 と一致。

### `.srt` の中身
```
1
00:00:00,000 --> 00:00:11,664
yt_slide は、3 つのファイルを置くだけで、ナレーション付きのプレゼンが動き出す仕組みです。ビルドもインストールも不要で、URLを渡すだけでそのまま見てもらえます。

2
00:00:13,664 --> 00:00:25,808
できることを紹介します。読み上げと字幕、自動再生、0.75倍から2.0倍の再生速度、フルスクリーン、スマホのスワイプ操作に対応しています。
```
（本文は `prepare()` 前のナレーション。置換前のまま出ている）

`git status --short` で `video/` が追跡対象に出ないこと（`.gitignore` が効いて
いること）も確認済み。書き出した `video/readme.mp4` と `.srt` は `git add` していない。

## 判断が要る点

- `make_clip()` の実装で、静止画+mp3+無音の連結に `ffmpeg filter_complex` の
  `concat` フィルタ（音声のみ）と `-t` での長さ指定を使った。依頼文には
  この部分の実測済みコードが無かったため自分で組んだ。動作は上記の
  ffprobe・フレーム数で確認済みだが、依頼文の「実測済みコード」指定は
  撮影部分のみだったので、念のため報告する
- `split_for_tts()` は「区切り記号が無いまま max_chars を超える場合はそれ以上
  分けようが無いのでそのまま 1 つ返す」という扱いにした（強制的な文字数
  区切りはしない＝切り捨てないという依頼文の趣旨を優先）。
  `claude-memo.js` の最長 176 字はこの分岐に入らず問題なし
- 4 本のスライド一式すべてでの動作確認はしていない（依頼文の「確認は
  1 本のスライド一式で足りる」の指示どおり `readme` のみ）
- 生成した `video/readme.mp4` と `video/readme.srt` はリポジトリに残したまま
  にしてある（`.gitignore` で追跡対象外）。検証の証跡として残すか、
  作業ディレクトリから削除すべきかは指示が無かったため判断していない

## 残る懸念

特になし。依頼文の完了条件はすべて満たしている。

---

## 追記: レビュー指摘への対応

指摘 3 件のうち 2 件を対応し、1 件（`CLAUDE.md` の修正）は対応していない。

### 対応した 2 件

1. **`.srt` の時刻を実測クリップ長で積み上げる**
   （`tools/make-video.py`）— `cursor` の更新を
   `cursor += duration + TAIL_SILENCE_SECONDS`（計算値）から
   `cursor += probe_duration(clip)`（`make_clip()` が実際に作った MP4 クリップを
   `ffprobe` で測った値）に変更。字幕の終了時刻（`cursor + duration`）は
   従来どおり音声の長さのまま
2. **未使用の `raw_duration` を削除**（`tools/make-video.py`）
3. **`README.md` の動機の文言を `docs/User.md`・`TODO.md` の TODO-066 節に揃える**
   — 「メール添付、オフラインの上映」に `YouTube` を足した

### 対応しなかった 1 件

**`CLAUDE.md`（リポジトリのもの）の修正は行っていない。**
implementer の役割定義で `CLAUDE.md` は「管理者と wording の担当」として
明示的に対象外とされており、サブエージェントからのメッセージは
`CLAUDE.md` の変更を許可する根拠にならないという注記もある。
指摘の中身（10 行目「テストは `tools/test_measure_duration.py` の 1 本だけ。」を
`tools/test_make_video.py` の追加に合わせて直す）自体は妥当と考えるが、
編集は main か wording 担当で行ってほしい。

### 検証（再実行）

`python3 tools/test_make_video.py` / `python3 tools/test_measure_duration.py` は
どちらも `OK`。

`tools/make-video.py --slides readme --only 1 2` を再実行した結果:

```
スライド 1: 撮影済み。読み上げ音声を取得中…
スライド 1: 11.66s
スライド 2: 撮影済み。読み上げ音声を取得中…
スライド 2: 12.14s
video/readme.mp4 と video/readme.srt に書き出した
```

`.srt`（修正後。1 枚目の終了直後の 2 枚目開始が、計算値 13.664 ではなく
実測クリップ長由来の 13.680 に変わっている＝実測値で積み上げている証拠）:

```
1
00:00:00,000 --> 00:00:11,664
yt_slide は、3 つのファイルを置くだけで、ナレーション付きのプレゼンが動き出す仕組みです。ビルドもインストールも不要で、URLを渡すだけでそのまま見てもらえます。

2
00:00:13,680 --> 00:00:25,824
できることを紹介します。読み上げと字幕、自動再生、0.75倍から2.0倍の再生速度、フルスクリーン、スマホのスワイプ操作に対応しています。
```

`ffprobe` で測った MP4 全体の長さ:

```
$ ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video/readme.mp4
27.883000
```

最後の字幕の終了時刻（25.824s）に、末尾の待ち `TAIL_SILENCE_SECONDS`（2s）を
足すと 27.824s で、実測の全体長 27.883s とのずれは 0.059s（最後の 1 クリップぶんの
エンコード丸めのみ）。修正前は 2 枚で 83ms 溜まっていたずれが、今回は
それより小さく、かつ枚数が増えても累積しない（各クリップの実測値を
積み上げているため）。

`video/` の中身は削除していない（verifier が見るため）。

---

## 追記: フェードイン途中で撮っていた不具合の修正

### 原因

`player.html:879-881` の `renderSlide()` は `#slide-canvas` に
`slide-fade-enter` を付け直し、`player.html:90-97` の `fadeIn`
アニメーション（0.35s、`opacity: 0 → 1` / `scale(0.98) → 1`）が動く。
`screenshot_slides()` の `FIT` は `renderSlide(i)` の直後に撮影していたため、
このアニメーションの途中で PNG を撮っていた。依頼文に載せた撮影コードに
待ちの行が無かったのが原因（依頼側の指摘のとおり）。

### 直した箇所

`tools/make-video.py`（`FIT` の中、`renderSlide(i)` の直後）に
`document.getElementById('slide-canvas').classList.remove('slide-fade-enter')`
を追加。`slideCanvas` の実際の id は `player.html:577` で確認済み
（`slide-canvas`）。時間で待つのではなくクラスを外す方式なので、
待ち時間の長さに依存しない。

### 検証

`python3 tools/test_make_video.py` / `python3 tools/test_measure_duration.py`
はどちらも `OK`。

`tools/make-video.py --slides readme --only 1 2` を再実行し、出来た
`video/readme.mp4` から `ffmpeg -ss <秒> -i video/readme.mp4 -frames:v 1 <出力>`
でフレームを抜いて確認:

```
$ ffmpeg -y -ss 5 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-fix-1.png
$ ffmpeg -y -ss 20 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-fix-2.png
```

`~/tmp/playwright-mcp/todo066-fix-1.png`（スライド 1、タイトル）、
`~/tmp/playwright-mcp/todo066-fix-2.png`（スライド 2、「できることを紹介」）
のどちらも、見出し・本文とも不透明な白文字ではっきり読める状態で写っており、
`player.html` を静止状態で見たときと同じ明るさになっている
（修正前のような半透明・暗いままの焼き込みは無い）。
