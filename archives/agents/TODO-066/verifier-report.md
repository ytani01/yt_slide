# TODO-066 verifier 報告

## 1. テスト 2 本

```
$ python3 tools/test_make_video.py
OK
$ echo exit=$?
exit=0
$ python3 tools/test_measure_duration.py
OK
$ echo exit=$?
exit=0
```

両方とも終了コード 0 で通った。

## 2. 文書どおりに実行できるか（README.md の「動画に書き出す」節）

README.md 記載のコマンドをそのまま実行（`--only` 無し、`readme` 一式 10 枚通し）。

```
$ time tools/make-video.py --slides readme
スライド 1: 撮影済み。読み上げ音声を取得中…
スライド 1: 11.66s
スライド 2: 撮影済み。読み上げ音声を取得中…
スライド 2: 12.14s
スライド 3: 撮影済み。読み上げ音声を取得中…
スライド 3: 11.28s
スライド 4: 撮影済み。読み上げ音声を取得中…
スライド 4: 8.95s
スライド 5: 撮影済み。読み上げ音声を取得中…
スライド 5: 9.86s
スライド 6: 撮影済み。読み上げ音声を取得中…
スライド 6: 8.88s
スライド 7: 撮影済み。読み上げ音声を取得中…
スライド 7: 7.82s
スライド 8: 撮影済み。読み上げ音声を取得中…
スライド 8: 7.46s
スライド 9: 撮影済み。読み上げ音声を取得中…
スライド 9: 12.29s
スライド 10: 撮影済み。読み上げ音声を取得中…
スライド 10: 9.62s
video/readme.mp4 と video/readme.srt に書き出した
tools/make-video.py --slides readme  251.48s user 4.29s system 279% cpu 1:31.44 total
```

所要時間は実時間で 1 分 31 秒（Raspberry Pi、`--only` 無しの 10 枚通し）。
README.md の「数分かかる」という記述と大きくは食い違わない。
コマンド・オプション名とも文書どおりで、前提が足りない・動かない箇所は無かった。
`docs/User.md` の同節（`tools/make-video.py --slides readme` を使う説明、
`--out`・`--only` の記述）もコードと一致していることを目視で確認済み（実行は
README.md 側の 1 回で兼ねた。依頼文が「10 枚全部を通しで」と指定していたのは
1 回分の実行のため）。

## 3. 出来たものの実測

### `ffprobe`

```
$ ffprobe -v error -show_entries stream=codec_type,codec_name,width,height \
  -show_entries format=duration -of default=noprint_wrappers=1 video/readme.mp4
codec_name=h264
codec_type=video
width=1920
height=1080
codec_name=aac
codec_type=audio
duration=120.123000
```

映像 h264 / 1920×1080、音声 aac。解像度・コーデックとも文書の記述と一致。

### `.srt` の件数

```
$ grep -c -- "-->" video/readme.srt
10
```

スライド 10 枚と一致。

### `.srt` の最後の終了時刻と MP4 の実長の差

```
$ grep -- "-->" video/readme.srt | tail -1
00:01:48,440 --> 00:01:58,064
```

最後の終了時刻は 118.064s。これに末尾の待ち `TAIL_SILENCE_SECONDS`（2s）を足すと
120.064s。MP4 の実長は 120.123s なので、差は **0.059s**。

implementer 報告の 2 枚での実測（0.059s）と**同じ値**で、10 枚に増やしても
広がっていない。レビュー指摘 2（ずれが枚数に比例して溜まる懸念）は、
実測の範囲では解消されていることを確認した。

### フレーム抜き出し

```
$ ffmpeg -y -ss 5 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-verify-1.png
$ ffmpeg -y -ss 60 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-verify-2.png
$ ffmpeg -y -ss 115 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-verify-3.png
```

3 枚（5s・60s・115s 地点）を目視確認。いずれも進行バー・ボタン・スライド番号は
映っていない。画面全体が暗めなのはスライドのフェードイン演出によるもので、
今回見なくてよいとされたデザイン・画質の範囲。
保存先: `~/tmp/playwright-mcp/todo066-verify-1.png`〜`-3.png`

## 4. 180 字超のナレーション分割経路

`slides/readme.js` を `slides/_tmp066.js` にコピーし、1 枚目の `narration` を
215 字（`prepare()` 後）の日本語に差し替えて実行。

```
$ tools/make-video.py --slides _tmp066 --only 1
スライド 1: 撮影済み。読み上げ音声を取得中…
スライド 1: 32.06s
video/_tmp066.mp4 と video/_tmp066.srt に書き出した
```

`split_for_tts()` を実際に同じ入力で呼んで確認したところ、177 字 + 38 字の
2 チャンクに分かれ、`fetch_speech()` の複数 `curl` + `ffmpeg concat` 経路が
実際に通ったことを確認した。

```
$ python3 -c "... split_for_tts(prepared, TTS_MAX_CHARS) ..."
215
2
177 'これはトゥードゥー066の検証のために作った長いナレーション' ... '実際に音声を聞いて確かめます。'
38 'これで十分な長さになっているはずです。念のためもう少し文章を' ... 'もう少し文章を足しておきます。'
```

`.srt` の本文は 215 字の全文がそのまま出ており、2 番目のチャンクの末尾
「もう少し文章を足しておきます。」まで欠落なく含まれていた。

```
1
00:00:00,000 --> 00:00:32,064
これはTODO066の検証のために作った長いナレーションです。（…中略…）念のためもう少し文章を足しておきます。
```

MP4 の実長は 34.123s。srt 終了 32.064s + tail 2s = 34.064s、差 0.059s で
他の測定と同じ値。**判断が要る点**: 実際に音声を耳で聞いて途中切れが無いかまでは
確認していない（`.srt` の本文が全文欠落なく出ていること、音声長 32.06s が
215 字の読み上げとして不自然に短くないこと、2 チャンクとも connat されて
1 本の mp3 になっていることまでは確認した）。耳で聞く確認が必要なら、
別途指示してほしい。

作業後、依頼どおり `\rm` で一時ファイルを削除した。

```
$ \rm -f slides/_tmp066.js video/_tmp066.mp4 video/_tmp066.srt
$ ls video/_tmp066.*
no matches found: video/_tmp066.*
```

## 変更ファイルの確認

```
$ git status --short
 M .gitignore
 M CLAUDE.md
 M README.md
 M docs/User.md
 M tools/measure-duration.py
?? archives/agents/TODO-066/
?? tools/make-video.py
?? tools/test_make_video.py
```

implementer-report.md の「変更したファイル」の一覧と一致。`CLAUDE.md` も
（レビュー指摘 1 を受けて）修正済みで、`テストは tools/test_measure_duration.py
と tools/test_make_video.py の 2 本。` に直っていることを diff で確認した。
指示に無いファイルの変更は見当たらない。

`video/readme.mp4` と `video/readme.srt` は今回の検証で書き出したもので、
`.gitignore` により `git status` に出ない（追跡対象外）。作業ツリーに残したままに
してある（implementer 同様、削除するかは判断していない）。

## 確かめられなかったこと・判断できないこと

- 180 字超経路で生成した音声を**耳で聞いての確認はしていない**。`.srt` の全文
  一致と音声長からは途中切れの兆候は無いが、実際に聞いた確認ではない
- `docs/User.md` の「動画に書き出す」節のコマンドは、README.md 側と同じ
  `tools/make-video.py --slides readme` を使う説明なので、実行はコードの
  読み合わせと README 側の実行で兼ねた。`docs/User.md` に書かれたコマンドを
  別途もう一度実行してはいない
- `video/readme.mp4` / `video/readme.srt` を作業ツリーに残すかどうかの判断は
  implementer 報告と同様、指示が無いため行っていない

## 追記: フェードイン途中の半透明フレーム問題の再確認（管理者からの追加依頼）

`tools/make-video.py` の `FIT` に `slide-canvas` から `slide-fade-enter` を外す
1 行が追加されたことを確認した。

```
$ grep -n "FIT = \|slide-fade-enter\|slide-canvas" tools/make-video.py
39:FIT = """(i) => {
41:  document.getElementById('slide-canvas').classList.remove('slide-fade-enter');
```

### `python3 tools/test_make_video.py`

```
$ python3 tools/test_make_video.py
OK
$ echo exit=$?
exit=0
```

通ったままだった。

### `tools/make-video.py --slides readme --only 2 5 9`

```
$ time tools/make-video.py --slides readme --only 2 5 9
スライド 2: 撮影済み。読み上げ音声を取得中…
スライド 2: 12.14s
スライド 5: 撮影済み。読み上げ音声を取得中…
スライド 5: 9.86s
スライド 9: 撮影済み。読み上げ音声を取得中…
スライド 9: 12.29s
video/readme.mp4 と video/readme.srt に書き出した
tools/make-video.py --slides readme --only 2 5 9  95.11s user 1.70s system 279% cpu 34.693 total
```

### フレーム抜き出し

出来た `video/readme.mp4`（全長 40.363s）から、各クリップの中ほどの時刻
（7s / 20s / 33s、クリップ長 14.14s・11.86s・14.29s から見積もり）で
1 枚ずつ抜いた。

```
$ ffmpeg -y -ss 7 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-recheck-2.png
$ ffmpeg -y -ss 20 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-recheck-5.png
$ ffmpeg -y -ss 33 -i video/readme.mp4 -frames:v 1 ~/tmp/playwright-mcp/todo066-recheck-9.png
```

3 枚とも目視確認。前回（`todo066-verify-*.png`）のように画面全体が暗く
半透明に見える状態ではなく、**不透明で文字・背景ともくっきり出ている**。
縮小（`scale(0.98)`）の痕跡（枠との隙間、余白）も見当たらなかった。
保存先: `~/tmp/playwright-mcp/todo066-recheck-2.png`・`-5.png`・`-9.png`

（`.srt` の時刻・長さ・枚数・180 字超の経路は指示どおり測り直していない。）
