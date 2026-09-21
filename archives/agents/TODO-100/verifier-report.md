# TODO-100 verifier report

検証環境: /net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide
（ブランチ cmd、コミットせず作業ツリーの差分のまま検証）

## 1. `ytslide init` した先で `measure --text` が測定値を返すか

Google Translate TTS への通信は可能だった（`curl --max-time 5` で
`HTTP_STATUS:200` を確認）。実際に traceback ではなく測定値が返ることを確認。

```
$ TMPDIR=/tmp/verifier-todo100.hbS3
$ cd .../yt_slide && uv run ytslide init   # $TMPDIR を cwd にして実行（init は --root を取らない）
index.html: 1 件のスライドを書いた
EXIT_INIT=0
$ ls $TMPDIR/slides
template.js   # readme.js は無い

$ uv run ytslide measure --root "$TMPDIR" --text 'TODO を見る'
下書き: 原文 8 字 / 読み 10 字 / 実測 1.464s / BASE_SPEED_MULTIPLIER=1.4 倍速 1.05s -> duration: 1
EXIT=0
```

traceback なし、EXIT=0。一致。

（補足: `init` サブコマンドに `--root` オプションは無く、カレントディレクトリを
初期化する仕様。`--root` は `measure` 側にだけある。作業では `cd "$TMPDIR" && uv run ... ytslide init` で対応した。指示文の
「`uv run ytslide init --root <dir>`」という手順そのものはこのリポジトリの
`init` の実装と食い違う。CLI 側の話でこの TODO の修正範囲外だが、指示文と
実装が合っていない点として報告する。）

## 2. 既存の pytest が全部通るか

```
$ uv run pytest -q
..........................                                               [100%]
26 passed in 0.84s
PYTEST_EXIT=0
```

一致。全 26 件通過。

## 3. 存在しないスライド一式を指したとき、traceback ではなく UsageError で止まるか

```
$ uv run ytslide measure --root "$TMPDIR" --slides nosuch --all
Usage: ytslide measure [OPTIONS] [NUMBERS]...

Error: /tmp/verifier-todo100.hbS3/slides/nosuch.js が無い
       あるのは template。--slides で指定する
EXIT=2

$ uv run ytslide measure --root "$TMPDIR" --slides nosuch 1
Usage: ytslide measure [OPTIONS] [NUMBERS]...

Error: /tmp/verifier-todo100.hbS3/slides/nosuch.js が無い
       あるのは template。--slides で指定する
EXIT=2
```

両方とも traceback なし、click の UsageError（終了コード 2）で止まる。一致。
（このガードは `cli.py` の `_no_slides_error` によるもので、`measure.py` の
今回の修正箇所とは別コード。今回の変更でこの経路が壊れていないことのみ確認した。）

## 4. リポジトリ直下（`slides/readme.js` あり）で置換表が今までどおり効くか

```
$ uv run python -c "
from ytslide import measure, paths
rules = measure.load_slides_rules('readme')
print('len=', len(rules))
print(rules[:3])
"
len= 6
[('claude-memo', 'クロード メモ', re.IGNORECASE), ('yt_slide', 'ワイティー スライド', re.IGNORECASE), ('JavaScript', 'ジャバスクリプト', re.IGNORECASE)]
```

空でない（6 件）。一致。

## 5. `docs/User.md` の記述が 1・4 の挙動と合っているか

283〜291 行目・355〜359 行目とも、実測と一致する。特に「`--slides` を
省くとスライド一式の読みは効かず、共通の置換表だけで測る」という記述を、
リポジトリ直下（`--slides` 省略 → 既定 `readme` だが `readme.js` がある）と
`$TMPDIR`（`--slides` 省略 → 既定 `readme` だが `readme.js` が無い）の
両方で `ytslide measure --text 'TODO を見る'` を実行して比較したところ、
どちらも同じ出力（`下書き: 原文 8 字 / 読み 10 字 / 実測 1.464s ...
duration: 1`）になった。リポジトリ直下では `readme.js` の置換表（6 件）が
本来「TODO」に対して当たるかどうかは、`readme.js` の中身の語に依存するため
この 1 例だけでは「効いているが偶然一致した」可能性を排除しきれていない
（`load_slides_rules('readme')` の 3 件のプレビューには `TODO` 関連の語は
出ていない）。ただし 4. で `readme` の置換表が空でないことは別途確認済みで、
`load_slides_rules` の分岐（ファイルあり/なし）自体はコードレベルで
確認できている。

## 変更ファイルの一覧と指示範囲との一致

```
$ git status
 M docs/User.md
 M src/ytslide/measure.py
 M tests/test_measure.py
?? archives/agents/TODO-100/
```

指示にある「`src/ytslide/measure.py` の `load_slides_rules()`」「テスト」
「`docs/User.md`」の 3 ファイルのみで、指示の範囲外のファイルは変わっていない。
`archives/agents/TODO-100/` はこの報告のための新規ディレクトリ。

`git diff` で見た差分:
- `src/ytslide/measure.py`: `load_slides_rules()` に `src.exists()` の
  ガードを足しただけ。他の関数は変えていない。
- `tests/test_measure.py`: `test_prepare_without_slides_file` を 1 件追加。
  `paths.set_root(tmp_path)` で読み替え、`load_slides_rules()` が空を返すこと
  と `prepare()` が共通表だけで動くことを確認するテスト。
- `docs/User.md`: 283〜291 行目・355〜359 行目付近の文言修正のみ。

## テストの強さ（「壊すと落ちるか」）

追加テスト `test_prepare_without_slides_file` について、`load_slides_rules()`
を元の実装（`exists()` チェック無し、無条件 `read_text()`）に戻すと
落ちるかを実測した（`git stash push -- src/ytslide/measure.py` で
実装だけ戻し、確認後 `git stash pop` で戻した）。

```
$ git stash push -- src/ytslide/measure.py
Saved working directory and index state WIP on cmd: af9826f ...
$ uv run pytest tests/test_measure.py -q
......F..                                                                [100%]
=================================== FAILURES ===================================
_______________________ test_prepare_without_slides_file _______________________
...
>           assert measure.load_slides_rules(paths.DEFAULT_SLIDES) == []
src/ytslide/measure.py:59: in load_slides_rules
    (paths.SLIDES / f'{slides}.js').read_text(encoding='utf-8'))
...
E       FileNotFoundError: [Errno 2] No such file or directory: '/tmp/pytest-of-ytani/pytest-1797/test_prepare_without_slides_fi0/slides/readme.js'
1 failed, 8 passed in 0.23s
$ git stash pop
Dropped refs/stash@{0} (eb83b203797dfd474bd746747890c390a2e26c2c)
```

実装を戻すと当該テストだけが FileNotFoundError で落ちることを確認した
（他 8 件は影響なし、`tests/test_measure.py` 単体での件数）。戻したあと
`git diff --stat` で作業ツリーが元の差分（3 ファイル）に復元されていることと、
`uv run pytest -q` が再び 26 passed になることも確認した。

## 確かめられなかったこと・判断が要ること

- 5. で書いたとおり、`readme.js` の置換表がリポジトリ直下での実際の測定に
  「効いている」ことを、置換前後の値の違いという形では確認できていない
  （`TODO` という語が `readme.js` の置換表に含まれていないため、同じ入力では
  両者の出力が一致してしまう）。`load_slides_rules('readme')` が非空を返す
  ことと、`load_slides_rules()` の分岐ロジック自体は確認済みなので実害は
  未確認。より強く確かめたいなら、`readme.js` の置換表に含まれる語
  （例: `yt_slide`）を `--text` に入れて、リポジトリ直下と `$TMPDIR` とで
  出力の「読み」欄が変わることを比較する必要がある。判断が要る点として
  報告する。
- 指示文にあった `ytslide init --root <dir>` はこのリポジトリの `init` の
  実装に `--root` オプションが無いため、そのままでは実行できなかった
  （代わりに `cd <dir> && uv run ... ytslide init` で対応）。これが TODO-100
  の対応漏れなのか、指示文の誤りなのかは判断できない。
