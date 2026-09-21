# TODO-096. `ytslide` コマンド 1 つで扱えるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |
| 実施 | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 37,701 | 189,688 | 32% |
| implementer | Sonnet 5 | medium | 97,153 | 444,368 | 53% |
| reviewer | Sonnet 5 | high | 22,596 | 116,152 | 8% |
| verifier | Sonnet 5 | medium | 19,947 | 84,926 | 7% |
| 合計 |  |  | 177,397 | 835,134 | 概算 $14.3 |

- 3 担当ともモデルは定義のまま（上書きしていない）。effort も定義の値
- implementer は 1 人に 3 回続けて頼んだ（パッケージ化 → 文書とスライド →
  レビュー指摘の手当て）。表の値はその 3 回の合計

## きっかけ

スライドを作る側は `tools/measure-duration.py`、`tools/make-index.py`、
`tools/make-video.py` を別々に、リポジトリからの相対パスで呼んでいた。
TODO-095 でリポジトリの外にスライドを置けるようにしたので、外から使うには
スクリプトの場所を知っている必要があった。`uv tool install` で入る
1 つのコマンドにまとめる。

## やったこと

### パッケージにした

`src/ytslide/` を作り、`pyproject.toml`（hatchling + hatch-vcs）を置いた。
`~/work/tmr/` に倣い、`click_utils.py` と `mylog.py` はそちらから写した。
バージョンは git のタグから決まる。

`tools/*.py` 3 本と `tools/test_*.py` 3 本は移し、`tools/` は消した。
CLI は argparse から click に書き直し、既存のオプションは名前と意味を
そのまま移した。テストは `tests/` で pytest として走る。

| サブコマンド | 元 |
|---|---|
| `ytslide init` | 新規 |
| `ytslide measure` | `tools/measure-duration.py` |
| `ytslide index` | `tools/make-index.py` |
| `ytslide update` | 新規（`measure` → `index`） |
| `ytslide video` | `tools/make-video.py` |
| `ytslide web` | 新規（`http.server`） |

`--only` だけは打ち方が変わった（`--only 1 2` → `--only 1 --only 2`）。
click は 1 つのオプションに可変長の値を取れないため。

### 置き場所の決め方を整理した

`src/ytslide/paths.py` にまとめ、**リポジトリへ落とす後方互換の分岐は消した**
（install した `ytslide` にリポジトリは無い）。
優先順は `--root` > カレントディレクトリ。`player.html` は置き場所側に
あればそれを、無ければ同梱のものを使う。

`player.html`・`index.html`・`slides/template.js` は、ビルドのときに
`ytslide/data/` へ入る（`force-include`）。リポジトリのチェックアウトから
動かしたときは `data/` が無いので、リポジトリ直下へ落ちる。

### `init` で一式そろうようにした

TODO-095 では「書いていないファイルが出来上がるより、利用者がコピーする
ほうが分かりやすい」として自動生成を見送った。**ここではその判断を覆した。**
`init` という名前のコマンドを明示的に叩いたときに一式そろうなら、
勝手に出来上がったことにはならない。

`slides/`・`slides/template.js`・`player.html`・`README.md`・`index.html` を
置き、一覧を作るところまでやる。`index.html` の `<title>` と `<h1>` は
カレントディレクトリ名に差し替える。**既にあるファイルは上書きしない**。

### 一覧のマーカーをゆるく照合するようにした

`index.html` のマーカーのコメント文が `tools/make-index.py` から
`ytslide index` に変わるので、開始マーカーは
`<!-- BEGIN GENERATED SLIDES` で始まるコメントとして照合する。
古いコメント文を持ったままの `index.html` でも通る。

### `tools/` を指す記述を書き換えた

`AGENTS.md`・`CLAUDE.md`・`README.md`・`docs/User.md`・`docs/Developer.md`・
`index.html`・`player.html`・`slides/` の 5 本。`README.md` には
インストールの手順を足した。Playwright は `video` という extra に分け、
`ytslide video` を使うときだけ入れればよいようにした。

`CLAUDE.md` の「ビルドも依存関係のインストールも不要」は、
**プレイヤー側（`player.html` と `slides/*.js`）はそのまま、インストールが
要るのは `ytslide` だけ**という切り分けに書き直した。

ナレーションを変えた 6 枚（`readme` 8 枚目、`developer` 2・6 枚目、
`user` 5・12・13 枚目）は `ytslide measure -n 3 --write` で測り直した。
`ytslide` の読み（`ワイティー スライド`）を `player.html` の `SPEECH_RULES` に
足し、当たる対象が無くなった `measure-duration.py` のルールは消した。

## 確かめたこと

- `uv run pytest -q` → 24 件すべて通る。`uv run ruff check src tests` も通る
  （`video.py` の `%` 書式だけは、中身が JS で `{` を含むため
  `# noqa: UP031` を理由付きで置いた）
- `init` の 2 件と一覧の差し替えのテストは、実装をわざと壊すと落ちることを
  見てから戻した
- `uv tool install '.[video]' --force` が通り、6 つのサブコマンドの
  `--help` が出る
- 空のディレクトリで `ytslide init` → 4 つのファイルが出来て、一覧に
  `template` が 1 件、`<title>` と `<h1>` がディレクトリ名になる。
  2 回目は既存ファイルの中身が変わらない（`md5sum` で照合）
- リポジトリ直下で `ytslide index` を実行しても `index.html` が変わらない
- `README.md` と `docs/User.md` に書いたコマンド例を、書いてあるとおりに
  叩いて再現した
- `prepare()` で、`developer` 2 枚目と `user` 12 枚目のナレーションが
  「ワイティー スライド」に置き換わる。`measure-duration` の読みは残っていない
- Playwright（chromium）で `player.html?slides=developer` と `index.html` を
  開き、コンソールにエラーが出ず、スライドが描かれていることを見た

`index.html` を `file://` で開くと `README.md` の fetch がコンソールエラーに
なるが、これは TODO-093 で入れたときからの挙動（`catch` で握って README を
隠す作り）で、今回の変更とは関わりがない。`ytslide web` で開けば出ない。

## 分担の振り返り

**各担当が何を見つけたか。**

- **implementer** — `--only` を click で受けられないことを自分で見つけ、
  `multiple=True` に変えて報告した。移したテストの assert を落とさずに
  pytest へ書き直した
- **reviewer** — いちばん効いた。**ナレーションの `measure-duration.py` を
  `ytslide measure` に書き換えた一方で、`player.html` の読み上げ置換表が
  追随していない**ことを見つけた。古いルールは当たる対象を失って死に、
  新しく出てきた `ytslide` には読みが無かった。テストが通ることを見ても
  拾えない種類の食い違いで、「対で保守するものの片方だけが変わった」に当たる。
  `grep "tools/"` に掛からなかった `template.js` の `measure-duration.py` も
  拾った（依頼で渡した grep の網羅性が足りていなかった）
- **verifier** — 指摘したものは無し。実行した確認はすべて一致した。
  `file://` の fetch エラーだけを、切り分けずに「判断が要る点」として上げた
  （依頼どおりの振る舞い）

**見込みと食い違ったのはなぜか。** 担当の構成は見込みどおり。
料金は implementer が 53% を占めた。3 回に分けて頼んだうちの第 2 段
（文書とスライド 11 ファイル）がいちばん重い。

**次に同じ規模の項目をやるなら。**

- **implementer を立て直さず、同じ担当に 3 回続けて頼んだのは効いた。**
  第 2 段で文書に書くコマンドの綴りを調べ直す必要が無く、第 3 段の
  レビュー指摘の手当ても、どこを触ったか分かっている状態から始められた。
  同じ構成なら次も続けて頼む
- **対象範囲を grep で渡すときは、grep の網羅性を自分で疑うこと。**
  `grep "tools/"` で渡したせいで、`tools/` を含まない `measure-duration.py`
  だけの記述が 1 件素通りした。改名を含む項目では、**旧名が単体で出てくる形**
  （`grep "measure-duration"`）も渡す
- **文言を変える項目では、読み上げ置換表を依頼文で名指しする。**
  ナレーションに新しい固有名詞が入るなら `SPEECH_RULES` の手当てが要る、
  と最初の依頼に 1 行入れておけば、reviewer の指摘を待たずに済んだ
- 分担の比率としては妥当。reviewer と verifier で 15% は、
  reviewer が拾ったものの重さに見合っている
