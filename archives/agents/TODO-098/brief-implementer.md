# TODO-098 implementer への依頼

## 目的

`ytslide init` が `slides/readme.js` も置くようにする。

いまの `init` が置くのは `slides/template.js` だけなので、その場で
`--slides` を省いて `ytslide measure` / `update` / `video` を叩くと、既定の
`readme`（`paths.DEFAULT_SLIDES`）を探して `slides/readme.js が無い` で
止まる。`player.html` を `?slides=` 無しで開いたときも同じ。
**既定の名前を実在させる**方針を利用者と決めた。

## 変えるもの

1. **`src/ytslide/cli.py` の `init()`** — `slides/readme.js` も置く。
   既にある `slides/template.js` の処理と同じ形（`_skip_if_exists` を通し、
   `paths.DATA / 'slides' / 'readme.js'` から読む）にする
2. **`pyproject.toml`** — `[tool.hatch.build.targets.wheel.force-include]` に
   `slides/readme.js` を足す。足さないと `uv tool install` で入れた
   `ytslide` に同梱されず、`init` が落ちる
3. **`tests/test_cli.py`** — 置かれるファイルが増えたことと、`init` の
   終わりに走る `index` の件数が 1 → 2 になることに合わせて直す。
   **`readme.js` が置かれることを確かめるアサーションを足す**
4. **`docs/User.md`** — 「リポジトリの外に自分のスライドを置く」の節。
   `ytslide init` が置くファイルの一覧と、その直前のコマンド例の出力
   （`index.html: 1 件のスライドを書いた`）を実際に合わせる。
   `--slides` を省くと `readme` が使われることが読み取れるようにする

`README.md` にも `ytslide init` の行がある。置かれるファイルまでは
書いていないはずだが、**読んで確かめ、食い違っていれば直す**。

## 保つもの

- **既にあるファイルは上書きしない**（`_skip_if_exists` の挙動）
- `init` は `--root` を持たず、カレントディレクトリだけを見る
- 他のサブコマンドの挙動・オプションは変えない
- `paths.DEFAULT_SLIDES` は `readme` のまま（既定は変えない）
- `src/ytslide/paths.py` の `DATA` の決め方は変えない。リポジトリの
  チェックアウトから動かすときはリポジトリ直下に落ちるので、
  `slides/readme.js` はそのまま読める

## やらないこと

- `readme.js` の中身の書き換え（yt_slide 自体の紹介 17 枚が入るのは承知の上）
- 既定値そのものの変更、`--slides` を必須にするといった別案
- `player.html` と `slides/*.js` の表示・読み上げまわり

## 完了条件

- `uv run pytest` が通る
- 空のディレクトリで `ytslide init` を実行すると、`slides/readme.js` と
  `slides/template.js`・`player.html`・`README.md`・`index.html` が置かれ、
  `index.html: 2 件のスライドを書いた` と出る
- 同じディレクトリでもう一度 `ytslide init` しても上書きされない
  （`すでにある: …` が出る）

## 検証方法

上の完了条件を実際に走らせて確かめる。作業用のディレクトリは
スクラッチパッド配下に作る（`/tmp` 直下やリポジトリの中を汚さない）。
**`uv run ytslide` で呼ぶ**（インストール済みのものと混ざらないように）。

`uv tool install` した状態での確認は verifier が別に行うので、ここでは不要。

## 報告

`archives/agents/TODO-098/implementer-report.md` に、変更点・検証結果・
残る懸念を書く。返事は「終わったか・報告ファイルのパス・判断が要る点」の
**5 行以内**。
