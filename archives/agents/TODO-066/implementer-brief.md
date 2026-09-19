# TODO-066 implementer への依頼

## 目的

スライド一式を MP4 と `.srt` に書き出すツール `tools/make-video.py` を作る。
**成果物はツール。** 書き出した動画そのものは成果物ではなく、リポジトリにも入れない。

`TODO.md` の TODO-066 の節を先に読むこと（決めたこと・承知していることが書いてある）。

## 対象範囲（触ってよいファイル）

- `tools/make-video.py`（新規）
- `tools/test_make_video.py`（新規。ネットワーク・ffmpeg 無しで通ること）
- `tools/measure-duration.py`（TTS の URL 組み立てを `tts_url(text)` に切り出す**だけ**。
  他の関数の中身・引数・挙動は変えない）
- `.gitignore`（書き出し先 `/video/` を足す）
- `README.md`、`docs/User.md`（使い方を足す）

`player.html`、`slides/*.js` は**変えない**。

## 決まっていること（相談不要）

### 共通処理の共有（TODO.md の「決めること（着手時）」の答え）

`tools/test_measure_duration.py` と同じ `importlib.util.spec_from_file_location`
で `measure-duration.py` を読み込んで使う。**新しい共通モジュールは作らない。**
再利用するもの: `prepare()`、`narrations()`、`SLIDES`、`DEFAULT_SLIDES`、
`TTS_MAX_CHARS`、`BASE_SPEED_MULTIPLIER`。
TTS の URL 組み立てだけ `measure-duration.py` に `tts_url(text)` として切り出し、
`measure()` とこのツールの両方から呼ぶ（同じ URL が 2 箇所に残るのを避けるため）。

### コマンド

    tools/make-video.py --slides readme          # video/readme.mp4 と video/readme.srt
    tools/make-video.py --slides readme --only 1 2   # 1 枚目と 2 枚目だけ（確認用）

- `--slides <名前>`（既定は `DEFAULT_SLIDES`）
- `--out <ディレクトリ>`（既定 `video/`）
- `--only <番号...>`（省略時は全部）

### 作り方

1. `slides/<名前>.js` から `narrations()` でナレーションを並び順に取る
2. Playwright（Python、chromium）で各スライドの PNG を 1920×1080 で撮る。
   **下の実測済みコードをそのまま使う**（1 ページ開いて `renderSlide(i)` を
   呼び直す。枚ごとに開き直さない。1 枚あたり数秒）
3. 読み上げ文は `prepare(narration, 名前)`。`TTS_MAX_CHARS`（180）を超えるものは
   `。、！？` の位置で 180 文字以下に分けて 1 つずつ取り、連結する
   （**切り捨てない**。`claude-memo.js` の最長は 176 文字で余裕が無い）
4. mp3 は `curl` で取る。`ffmpeg` の `atempo=1.4`（`BASE_SPEED_MULTIPLIER`）を掛け、
   掛けた後の長さを `ffprobe` で測る
5. 1 枚ぶんのクリップ = PNG の静止画 + その音声 + 末尾に 2 秒の無音
   （`player.html` の待ちの既定が 2 秒。定数に名前を付けて書く）
6. 連結して MP4（h264 / yuv420p / 1920×1080、音声 aac）
7. `.srt` は 1 枚 1 件。開始は累積時刻、終了は開始 + 音声の長さ（末尾の待ちは入れない）。
   本文は**置換前**のナレーション（`prepare()` を掛ける前のもの）

### 撮影部分（実測済み。これで撮れることは確認してある）

```python
FIT = """(i) => {
  renderSlide(i);
  document.querySelectorAll('body > *').forEach(e => e.style.display = 'none');
  const v = document.getElementById('player-viewport');
  document.body.appendChild(v);
  Object.assign(v.style, {position:'fixed', inset:'0', width:'1920px', height:'1080px',
                          borderRadius:'0', border:'none', margin:'0', display:'flex'});
  v.querySelector('#slide-num').closest('div.flex').style.display = 'none';
  document.getElementById('tap-feedback-icon').parentElement.style.display = 'none';
}"""

page = browser.new_page(viewport={'width': 1920, 'height': 1080})
page.goto((root / 'player.html').as_uri() + f'?slides={name}')
page.wait_for_load_state('networkidle')   # tailwind と Font Awesome を CDN から読むので要る
page.evaluate(FIT, i)                      # i は 0 始まり
page.screenshot(path=...)
```

2 枚目以降も同じページで `page.evaluate(FIT, i)` を呼べばよい。

## 保つもの

- `measure-duration.py` の既存の挙動とコマンドラインは変えない。
  `tools/test_measure_duration.py` が通ったままであること
- 書き方はリポジトリの既存コードに合わせる。日本語の docstring、定数に名前を付ける
  （`tools/measure-duration.py` の書き方をそのまま真似ればよい）

## 完了条件

- `tools/make-video.py --slides readme` で `video/readme.mp4` と `video/readme.srt` が出る
- `python3 tools/test_make_video.py` と `python3 tools/test_measure_duration.py` が通る
- `README.md` と `docs/User.md` に、書いたとおりに実行できる使い方がある
- `.gitignore` に `/video/` がある
- 書き出した動画・PNG・mp3 を `git add` しない

## 検証方法（自分でやること）

`tools/make-video.py --slides readme --only 1 2` を実際に走らせ、
`ffprobe` で出来た MP4 の長さ・解像度・音声の有無を確かめる。
**「動くはず」で報告しない。実行した出力を報告に貼る。**

## 報告

`archives/agents/TODO-066/implementer-report.md` に書く。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
