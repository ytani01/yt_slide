# reviewer 報告（TODO-112）

対象: `git status --short` の全部（新規 `src/ytslide/pdf.py` を含む）。
実測には scratchpad に作った作業場所（`slides/mine.js` だけ置いたもの、
`player.html` も置いたもの）を使った。

## 問題なしの観点

- `cli.py` の `pdf` コマンド: オプションの並び・help・`set_root`・`_no_slides_error` が `video` と揃っている
- 一時ディレクトリと chromium の閉じ方: `with` の 2 段で、chromium を閉じてから一時ディレクトリを消す。例外のときも両方片付く。`writer.write` は `with` の内側にある
- `pypdf` が無いとき: chromium を起こす前に `ClickException` で止まり、入れ方が添えられる（読んで確認。実行はしていない）
- テストの強さ: `cli.py` を 3 通り壊して実測した。`--out` を `'pdf'` 固定にする → 1 件落ちる。`--slides` を既定名に固定する → 1 件落ちる。`set_root` を消す → 2 件とも落ちる。戻したあとは 37 passed
- `--root` と `player.html` を置いた作業場所: 2 ページの PDF ができ、`pdftotext` で作業場所のスライドの文字が取れた。`--out` を省いたときは、カレントディレクトリに `pdf/mine.pdf` ができた
- docs/ に TODO 番号は増えていない（`docs/Developer.md:54` の `TODO-088` は変更前からある）
- `cli.py` の CLAUDE_MD に `pdf` が入っている
- ruff: 変更したファイル（`pdf.py`・`cli.py`・`test_video.py`）はどれも 0 件。全体の 67 件はすべて `archives/agents/` の中。ただし 67 件には新しく足した `archives/agents/TODO-112/try-pdf.py` の 1 件も入っており、コミット済みの状態だけなら 66 件（変更前と後の両方を、未追跡の try-pdf.py があるまま測ったので同じ数になった）
- 範囲: 指示に無い変更は無い

## 要修正

### 1. `src/ytslide/pdf.py:31` — 作業場所に `player.html` が無いと、違うスライドで PDF を作る

- 問題: `paths.set_root()` は、作業場所に `player.html` が無いと同梱データの
  `player.html` へ落とす（`paths.py:39-40`）。`player.html` は
  `slides/${slidesName}.js` を**自分の隣から**読む（`player.html:662`）ので、
  開くのは同梱データ側の `slides/<名前>.js` になる。一方でページ数は作業場所の
  `slides/<名前>.js` から数える（`pdf.py:24-25`）
- 実測:
  - 作業場所に `slides/mine.js` だけ置く（`player.html` は置かない）→
    `ReferenceError: slideData is not defined` の Playwright のトレースバックで落ちる
  - 作業場所に `slides/readme.js`（自作の 2 枚）だけ置く →
    「2 ページ」と出て終わる。中身はリポジトリの `readme` の 1・2 枚目
    （`pdftotext` で「yt_slide / AI に書かせて、そのまま再生できる」）。
    **エラーにならずに違う PDF ができる**
- `video.screenshot_slides()`（`video.py:98`）も同じ開き方なので、video との
  食い違いは無い。**video も同じように壊れている**ことになる（video は実行して
  いない。読んで確認しただけ）
- 範囲: `ytslide init` した作業場所には `player.html` があるので起きない。
  `init` せずに `--root` を付けたとき・`slides/` だけ置いたときに起きる。
  pdf だけ直すか、video と共通のところで直すかは管理者の判断（実害の大きさは未確認）

### 2. 文書: `video`（と `check`）だけを挙げていて、`pdf` が抜けている箇所

誤りになっているもの:

- `docs/UsersGuide.md:308` — chromium を入れるコマンドのコメントが
  「ytslide video・ytslide check **だけが**使う」。`pdf` も使う
- `docs/UsersGuide.md:268` — `--root` が使えるコマンドの一覧が
  `measure`・`index`・`update`・`video`・`check`。`pdf` にも `--root` がある
- `README.md:135`（今回足した行）— 「`video` extra は `ytslide video`・
  `ytslide pdf` が使う」。`check` も `video` extra の Playwright を使う
  （`docs/UsersGuide.md:301-302`、TODO.md の決めたこと）。足した行で `check` が抜けた
- `README.md:130-131` — `# video 以外` / `# video も使う`。`pdf` も `[video]`
  が要るので、「video 以外」は pdf も使えるように読める

抜けているもの（誤りではないが、同じ一覧が他の箇所では pdf を含むようになった）:

- `README.md:138` — 「`video` と `check` で使う chromium は別に入れる」
- `docs/UsersGuide.md:202` — 「`ytslide check` と `video` は Playwright（chromium）を使う」
- `docs/UsersGuide.md:313` — 「Playwright か chromium が無いまま `check`・`video` を実行すると」
- `docs/Developer.md:22` — `browser.py` の説明が「`check`・`video` が使う」
- `README.md:124-125` — 「動画に書き出す場合は `ytslide` CLI を使う」

根拠: `rg -n "video" README.md docs/` の結果を 1 件ずつ読んだ。

## 検討

### 3. `src/ytslide/pdf.py:24-25` — ページ数を `measure.narrations()` の正規表現で数えている

- `measure.narrations()` は `narration: '…',\n` の形だけを拾う（`measure.py:124`）。
  この形でないスライドはページから消え、何も警告しない
- 実測: 1 行に `{ title: …, narration: 'いち。', duration: 1 }` と書いた
  2 枚の一式で「0 ページ」の PDF を書き出し、成功のメッセージが出た
  （`pdfinfo` は `Invalid page count 0`）
- 今ある `slides/*.js` 5 本は、`narration:` の行数と数えた数が一致した。
  作業場所で別の書き方をする人がいるかどうか、実害は未確認
- video も同じ数え方だが、video は読み上げ文そのものが要るので数える意味がある。
  PDF は読み上げ文を使わないので、ページで読み込んだ一式の枚数と食い違いうる
  （1 とも絡む）

### 4. `src/ytslide/pdf.py:30-33` — スライドが読み込めないとき、Playwright のトレースバックがそのまま出る

- 実測: 1 の前半のケースで `playwright._impl._errors.Error: Page.evaluate:
  ReferenceError: slideData is not defined` と数十行のトレースバックが出た。
  `check` は構文エラーを利用者向けの文で出すが、`pdf` は出さない
- video も同じ（読んで確認しただけ）。`check` を先に勧める文書の流れがあるので、
  直す必要があるかは判断が分かれる

### 5. `.gitignore` に `/pdf/` が無い

- `/video/` はある。UsersGuide の動画の節は「`video/` は `.gitignore` に入って
  いる」と書いているが、PDF の節には書き出し先の扱いが無い
- リポジトリで `ytslide pdf` を既定の `--out` のまま実行すると、未追跡の `pdf/` が残る
  （implementer は `--out /tmp/...` で試したので出ていない）

### 6. テスト

- `make_pdf()` の `pypdf` が無いときの分岐にテストが無い。
  `tests/test_browser.py` と同じ形（`sys.modules` に `None` を入れる）なら、
  Playwright なしで確かめられる
- `docs/Developer.md:25` の `tests/test_video.py` の説明が「`video.py` の分割や
  字幕の組み立て」のまま。`pdf` コマンドのテストもここに入った

### 7. `src/ytslide/browser.py:1` — docstring が「`check` と `video` が使う chromium」

- `pdf` も使うようになった。`docs/Developer.md:22`（2 に挙げた）と同じ内容で、
  直すなら両方

## 好みの範囲

- `docs/UsersGuide.md:179`（flowchart の「必要なら ytslide video」）、`:193`
  （「動画にするなら `ytslide video`」）、`:264`（「「公開」か「動画に書き出す」へ
  進む」）は PDF に触れていない。PDF の節へのリンクを足すかどうか

## 作り込みすぎ

- `pdf.py:L9-10,L29,L36-40`: shrink（検討）。1 ページずつ一時ファイルに書いて読み直しているが、
  `page.pdf()` は `path` を省くと bytes を返す。
  `writer.append(io.BytesIO(page.pdf(width=…, height=…, print_background=True, margin=…)))`
  で `tempfile`・`pathlib`・一時ディレクトリが要らなくなる（pypdf 6.19.0 で
  `PdfWriter.append(io.BytesIO(...))` が通ることを実測した）
- `pdf.py:L41-42`: shrink（好みの範囲）。`with open(out_pdf, 'wb') as f: writer.write(f)` は
  `writer.write(out_pdf)` の 1 行で済む（パスを渡して書けることを実測した）

net: -5 lines possible.

## 範囲外（変更前からあるもの。参考）

- `docs/Developer.md:37` — 「テストは `tests/` の 4本」。実際は 6 本（CLAUDE.md は 6 本）
- `docs/Developer.md:54` — docs/ に `TODO-088` がある（CLAUDE.md は docs/ に TODO 番号を書かない決まり）
