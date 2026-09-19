# TODO-066 reviewer 報告

## 要修正

### 1. `CLAUDE.md:10` の「テストは 1 本だけ」が事実と食い違う

> テストは `tools/test_measure_duration.py` の 1 本だけ。

今回 `tools/test_make_video.py` を新設したため、テストは 2 本になった。
`grep -n "test_measure_duration\|テストは" CLAUDE.md` で確認（他に該当行なし）。
`implementer-brief.md` の対象範囲に `CLAUDE.md` が入っていなかったための
見落としと見られるが、`CLAUDE.md` の「構成」節が現状と食い違っているのは
事実。**根拠: `CLAUDE.md:10` を実読、`tools/` に実際に 2 本のテストファイルが
あることを `ls` で確認。**

## 検討（実害は未確認）

### 2. `.srt` の時刻と実際の MP4 のクリップ長がわずかにずれる作りになっている

`.srt` の `cursor` は `duration + TAIL_SILENCE_SECONDS`（`duration` は
`ffprobe` で測った sped mp3 の秒数）を積み上げて作る（`make-video.py:193-194`）。
一方、実際の MP4 クリップの長さは `make_clip()` が `ffmpeg` で静止画+音声+無音を
エンコードして作ったもので、音声のフレーム境界への丸めなどにより
`duration + TAIL_SILENCE_SECONDS` と厳密には一致しない。

implementer-report.md に記載の実測値がこれを裏付けている。2 枚のクリップ
（11.66s + 2s + 12.14s + 2s = 27.80s 相当の計算値）に対し、実際の `ffprobe`
での MP4 の長さは 27.883s で、83ms のずれがある（1 枚あたり約 40ms）。
`concat_clips()` は `-c copy` で単純結合するだけなので、`.srt` はこの
「計算上の秒数」を積み上げ続ける一方、実際の映像はクリップごとの実エンコード長を
積み上げる。**スライド枚数が増えるほど、`.srt` と実際の映像の間のずれが
線形に溜まる作りになっている。**（`claude-memo` は 17 枚あるので、単純計算では
最大 1 枚あたり ~40ms × 17 ≈ 680ms 程度まで広がりうる。実測はしていない。）

依頼文の「ずれが溜まる作りになっていないか」に該当する。1 枚あたり数十 ms
なので実害としては軽微と見られるが、実際に `claude-memo` のような多枚数の
一式で通しで検証していないため、実害は未確認。
**根拠: `make-video.py:174-194`, `make_clip()`（同 136-148）を実読、
implementer-report.md の実測値（27.80s 計算 vs 27.883s 実測）を根拠に算出。**

### 3. TTS 分割（180 字超）の経路が curl+ffmpeg concat まで含めて一度も実行されていない

`fetch_speech()` の `len(parts) > 1` の分岐（複数 mp3 を `curl` で個別に取り、
`ffmpeg concat` で 1 本につなぐ）は、`tools/test_make_video.py` では
`split_for_tts()` 単体（ネットワーク・ffmpeg 無し）しかテストしておらず、
implementer の実行検証も `--only 1 2`（`readme` の 1・2 枚目）のみ。

4 本のスライド一式すべてのナレーションを `prepare()` に通して文字数を数えたところ
（実測: このレビューで実行）、`TTS_MAX_CHARS`（180）を超えるものは 1 件も無かった。

```
readme / user / developer / claude-memo のいずれも 180 字超の narration は無し
```

つまり `fetch_speech()` の複数チャンク経路（複数 `curl` 呼び出し＋
`ffmpeg concat -c copy`）は、現行のどのスライド一式でも実際には通っていない。
将来ナレーションが伸びて初めて踏まれる経路のため、実害は未確認。
**根拠: `tools/make-video.py:77-91`（fetch_speech）を実読、
`measure-duration.py` の `prepare()`/`narrations()` を使って 4 本の一式の
全ナレーションの文字数をこの場で実測。**

### 4. README.md と docs/User.md で「動画に書き出す」の動機説明が食い違う

- `README.md:86`: 「メール添付、オフラインの上映」
- `docs/User.md:154-155`: 「メール添付、YouTube、オフラインの上映」

`TODO.md` の TODO-066 節の元の文言は「メール添付、YouTube、オフラインの上映」
（YouTube を含む）。`README.md`側だけ YouTube が抜けている。機能に影響は無いが、
同じ主張が 2 か所にあり内容が食い違っている。
**根拠: `README.md:86`、`docs/User.md:154-155`、`TODO.md` の TODO-066 節を実読。**

## 好みの範囲

### 5. 検証で生成した `video/readme.mp4` / `video/readme.srt` が作業ツリーに残っている

`.gitignore` で追跡対象外になっており、`git status --ignored` でも `!! video/`
としか出ないため commit 事故の実害は無い。implementer 自身も「判断が要る点」で
片付けるかどうか未指示と報告済み。**根拠: `ls -la video/` と
`git status --short --ignored` を実行して確認。**

## 問題の無かった観点（1 行）

- `tts_url()` 切り出しと `measure()` の URL 組み立ては、切り詰め位置・組み立て方とも
  旧コードと同一（diff を実読して確認、`text[:TTS_MAX_CHARS]` の位置は同じ）。
- `split_for_tts()` の境界（180 字ちょうど・181 字・区切り無しの長文・区切り記号の
  連続）は、実際に関数を呼んで確かめ、いずれも内容の欠落無くルール通りに分割された。
- `.srt` の本文は `prepare()` を掛ける前の `narration` を使っており、依頼文どおり。
- `README.md` / `docs/User.md` のオプション名・既定値（`--slides` 既定
  `DEFAULT_SLIDES`、`--out` 既定 `video`、`--only`）は実装のコードと一致。
- 対象範囲外の `player.html` / `slides/*.js` は変更されていない。
- `measure-duration.py` の `tts_url()` 以外の関数は無変更（diff で確認）。
- 依頼文の完了条件（テスト実行結果、`ffprobe` での確認）は implementer-report.md に
  実行結果が貼られている。
