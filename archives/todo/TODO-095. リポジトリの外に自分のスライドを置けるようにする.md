# TODO-095. リポジトリの外に自分のスライドを置けるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |
| 実施 | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 15,710 | 35,062 | 40% |
| implementer | Sonnet 5 | medium | 28,449 | 160,625 | 33% |
| reviewer | Sonnet 5 | high | 21,203 | 77,389 | 19% |
| verifier | Sonnet 5 | medium | 7,959 | 45,462 | 8% |
| 合計 |  |  | 73,321 | 318,538 | 概算 $4.4 |

- 3 担当とも定義（`~/.claude/agents/`）のモデル・effort のまま。上書きしていない

## きっかけ

一般の利用者は `git clone` したあと、**リポジトリの外に**自分のスライド用の
ディレクトリを作り、そこに `player.html` のコピーと `index.html`、`slides/` を
置いて使うことになる。この使い方が文書に無く、ツールも対応していなかった。

着手時に実測したところ、外のディレクトリに `slides/mine.js` を置いてそこを
カレントディレクトリにしても、`tools/measure-duration.py --slides mine --all` は
`…/yt_slide/slides/mine.js が無い` で落ちた（exit 2）。3 本とも
`ROOT = pathlib.Path(__file__).resolve().parent.parent` 固定だったため。

## やったこと

### スライドを探す場所を変えられるようにした

`tools/measure-duration.py`・`make-index.py`・`make-video.py` の 3 本で、
探す場所を次の優先順で決めるようにした。

1. `--root <パス>` が渡されていればそこ
2. カレントディレクトリに `slides/` があればカレントディレクトリ
3. どちらでもなければ、従来どおりリポジトリ（スクリプトの親の親）

`ROOT` / `SLIDES` / `PLAYER_HTML` は、もとはモジュールレベルの定数で
インポート時に決まっていた。引数を読んだあとに決まる形へ直した。
探し方の関数は `measure-duration.py` に 1 つ置き、他の 2 本はそれを使う。

`player.html` は、決まった場所にあればそれ、無ければリポジトリのものを使う。
作業ディレクトリ側の `player.html` はコピーなので、古いまま放っておくと
実際の再生と測定がずれる。あるほうを優先した。

### `make-index.py` を他の 2 本と対称にした

`--root` で指した場所に `index.html` が無いとき、未処理の
`FileNotFoundError` で落ちていた。存在しないパスやディレクトリでないものを
渡したときも同様だった。`measure-duration.py` と `make-video.py` が
`parser.error()` で扱っているのに合わせた。

`index.html` を自動で作る案は採らなかった。書いていないファイルが
出来上がるより、利用者がコピーするほうが分かりやすい。

### 文書

`docs/User.md` に「リポジトリの外に自分のスライドを置く」の節を足した。
`player.html` と `index.html` をコピーすること、作業ディレクトリを
カレントディレクトリにすれば `--root` が要らないこと、別の場所から呼ぶなら
`--root` を渡すことを書いた。`index.html` は同じディレクトリの `README.md` を
読んで表示するが、無ければその欄を出さないだけなので `README.md` は
コピーしなくてよい。

### 実行属性

`tools/make-index.py` と `tools/test_make_index.py` だけ 644 で、他の 4 本は
755 だった。文書に足した例は直接実行する形なので、そのままでは
`許可がありません`（exit 126）になる。755 に揃えた。

## 確かめたこと

verifier に依頼した（報告は
[archives/agents/TODO-095/verifier-report.md](../agents/TODO-095/verifier-report.md)）。

- `docs/User.md` の新しい節のコマンドを上から順に実行し、`make-index.py --root`
  まで通ること
- 探し方の優先順が実際にそのとおりであること（作業ディレクトリを
  カレントディレクトリにした場合、`--root` を渡した場合、リポジトリのトップで
  `--root` 無しの場合）
- テスト 3 本が通ること（いずれも exit 0）
- `--root` に `index.html` の無いディレクトリ・存在しないパス・ファイルを
  渡したとき、Traceback ではなく argparse のエラー（exit 2）で止まること
- リポジトリのトップで `--root` 無しに実行しても `index.html` が変わらないこと

実行属性を直したあと、外のディレクトリで `make-index.py --root` を直接実行して
`exit=0` になることと、テスト 3 本が通ることを main が確かめた。

## やらなかったこと

- **`make-video.py --out` の既定 `video` が cwd 相対のままである件。**
  `--root` で外を指しても、書き出し先は呼び出し側のカレントディレクトリに
  できる。推奨する使い方（作業ディレクトリへ `cd` してから呼ぶ）では
  困らないので、今回は触らないことにした
- **Pyright の `None` 関連の警告**（`measure-duration.py` と `make-index.py`）。
  モジュールレベルで `None` を置き、直後に探し方の関数を呼んで埋める作りに
  したため出ている。reviewer が全スクリプトとテストを動かしても `None` 由来の
  例外は起きず、Pyright が `global` 経由の書き換えを追えないための誤検出と
  判断した。型注釈で黙らせる変更はしていない

## 分担の振り返り

- **reviewer が要修正 2 件を実測で見つけた。** 文書の手順どおりに進めると
  `make-index.py --root` が `FileNotFoundError` で落ちること、
  `make-index.py`・`make-video.py` の `--root` 配線は壊してもテストが
  通ってしまうこと。後者は「テストを足した」という報告だけでは分からず、
  **実際に壊して落ちるか試した**から出てきた
- **verifier は、文書の例が直接実行の形なのに `make-index.py` が 644 である
  ことを見つけた。** 手順を上から順に実行させたから出た。読み合わせでは
  出ない
- 見込み（implementer + reviewer + verifier）と食い違わなかった。
  3 本のスクリプトと文書とテストにまたがる項目なので、実装を分けたのは
  妥当だった
- **次に同じ規模の項目をやるなら、implementer への最初の依頼に
  「足したテストを、実装をわざと壊して落ちるか確かめる」を入れる。**
  今回は reviewer に見つけてもらってから implementer に差し戻したので、
  同じ担当を 2 往復させた。最初から入れておけば 1 往復で済んだ
- **verifier には最初から「文書のコマンドを上から順に実行する」と書いた**。
  これは効いた。次も同じ書き方をする
