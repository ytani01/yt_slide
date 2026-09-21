# TODO-095 verifier 報告

一時ディレクトリ（`mktemp -d`。作業後に削除済み）で `docs/User.md`
「リポジトリの外に自分のスライドを置く」の手順を上から順に実際に動かし、
探し方の優先順・テスト・エラーの出方・後方互換を確かめた。

## 1. `docs/User.md` の手順どおりの実行

- `mkdir -p .../my-slides/slides`、`player.html`・`index.html` を
  コピー、`slides/mine.js` を `template.js` から最小限に削って作成。
- `(cd .../my-slides && .../tools/measure-duration.py --slides mine --all)`
  → 成功。出力:
  `スライド 1: 原文 17 字 / 読み 17 字 / 実測 3.024s / BASE_SPEED_MULTIPLIER=1.4 倍速 2.16s -> duration: 2`
  （exit 0）
- `.../tools/make-index.py --root .../my-slides` は
  **直接実行すると `許可がありません` で失敗した（exit 126）**。
  `tools/make-index.py` が実行属性 (`+x`) を持っていない
  （`stat` で `644`。`git show HEAD:tools/make-index.py` でも同じで、
  `git diff --summary` にモード変更は出ない＝この状態はリポジトリに
  コミット済みで TODO-095 の変更が原因ではない。`make-video.py`・
  `measure-duration.py` は `755` で shebang どおり直接実行できる）。
  `docs/User.md:393` の例
  `$ ~/yt_slide/tools/make-index.py --root ~/my-slides` は、この
  パーミッションのままだと**書いてあるとおりに実行すると失敗する**。
  `python3 tools/make-index.py --root ...` で呼べば成功する
  （下記2で確認）。手順の文言自体は今回の担当の変更範囲外の話だが、
  実際に手順どおり試すと落ちる点として報告する。

## 2. 探し方の優先順

- cwd を作業ディレクトリにして `--root` 無しで
  `measure-duration.py --slides mine --all` → 上記1のとおり成功
  （cwd の `slides/` を見た）。
- リポジトリのトップ（cwd）から
  `measure-duration.py --root <外部ディレクトリ> --slides mine --all`
  → 同じ結果で成功（`--root` の先を見た）。
- `python3 tools/make-index.py --root <外部ディレクトリ>` →
  `index.html: 1 件のスライドを書いた`。外部ディレクトリの `index.html`
  に `slides=mine` へのリンクが実際に書き込まれたことを `grep` で確認。
- リポジトリのトップで `--root` 無しの
  `python3 tools/make-index.py` → `index.html: 5 件のスライドを書いた`
  （exit 0）。実行前後で `git diff --stat index.html` は**空**
  （後方互換。リポジトリの `index.html` は変わらなかった）。

## 3. テスト 3 本

いずれも終了コード 0。

```
$ python3 tools/test_measure_duration.py
OK
$ python3 tools/test_make_index.py
OK
$ python3 tools/test_make_video.py
OK
```

## 4. `make-index.py --root` のエラーの出方

3 通りとも Traceback ではなく argparse のエラー（exit 2）で止まった。

```
=== (a) index.html の無いディレクトリ ===
usage: make-index.py [-h] [--root ROOT]
make-index.py: error: /tmp/.../no-index/index.html が無い。リポジトリの index.html をコピーしてから実行する
EXIT: 2

=== (b) 存在しないパス ===
usage: make-index.py [-h] [--root ROOT]
make-index.py: error: /tmp/.../does-not-exist/index.html が無い。リポジトリの index.html をコピーしてから実行する
EXIT: 2

=== (c) ディレクトリでないファイル ===
usage: make-index.py [-h] [--root ROOT]
make-index.py: error: /tmp/.../plainfile/index.html が無い。リポジトリの index.html をコピーしてから実行する
EXIT: 2
```

## 5. リポジトリトップでの後方互換

`git diff --stat index.html` が実行前後とも空。差分無しを確認済み
（4 と同じ実行で確認）。

## 変更ファイルの一覧と指示の範囲

`git status --short`:

```
 M docs/User.md
 M tools/make-index.py
 M tools/make-video.py
 M tools/measure-duration.py
 M tools/test_make_index.py
 M tools/test_make_video.py
 M tools/test_measure_duration.py
?? archives/agents/TODO-095/
```

implementer 報告に書かれた変更範囲と一致。指示に無いファイルの変更は無い。

## 確かめられなかったこと・判断が要る点

- `make-video.py` の実際の動画書き出しは、指示どおり実行していない
  （Playwright・ffmpeg 不要と指定されていたため）。
- `tools/make-index.py` の実行属性が無い件（上記1・4項）は、
  今回のリグレッションかどうか判断できない。`git diff --summary` に
  モード変更が出ないのでコミット済みの既存状態と見られるが、
  `docs/User.md` の手順どおりに直接実行すると失敗する実害は確認した。
  直すかどうかは管理者の判断に委ねる。実害は「手順を一字一句どおり
  実行すると失敗する」という点のみで、`python3` 経由なら動く。
