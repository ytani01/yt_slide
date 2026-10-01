# TODO-130 reviewer の報告

対象: 未コミットの `git diff`（README.md・docs/Developer.md・docs/UsersGuide.md・
slides/users-guide.js・src/ytslide/cli.py・tests/test_cli.py・TODO.md）。
コードは直していない。

## 要修正

### 1. docs/UsersGuide.md:57-59 — clone した場合の案内が 2. と食い違う

「リポジトリを clone して中で作る場合は、そのディレクトリを作業場所にして
次の手順から始める（`init` は不要）」のままで、次の手順は今「2. Claude Code に
作ってもらう」になった。clone したリポジトリの直下には開発者向けの `CLAUDE.md`
（`git ls-files CLAUDE.md` で追跡されている、yt_slide 自身の規約）があり、
`init` を実行しないのでスライド作成用の `CLAUDE.md`（`cli.py` の `CLAUDE_MD`）は
置かれない（`_skip_if_exists` で飛ばされるので、`init` を実行しても置かれない）。
そのため 2. の「Claude Code は先に構成案だけを出す」「`docs/UsersGuide.md` を読む」
といった前提が clone の場合には成り立たない。

- 根拠: 読んだコード（`cli.py` の `init`）と `git ls-files`。
- Claude Code が実際にどう振る舞うかは未確認（実害は未確認）。
- 変更前は clone の場合の「次の手順」が手で書く流れだったので問題にならなかった。

## 検討（任意）

### 2. docs/UsersGuide.md:91 / slides/users-guide.js:147,175 — `update` が「必ず」か「合わせたいときだけ」か

「3. 確かめる」の 4 と、スライド 5 枚目は「仕上げに `ytslide update` を実行させる」
（毎回やる書き方。`CLAUDE_MD` の進め方 7 も同じ）。一方、すぐ後の
「### 時間表示を合わせたいとき」と、変えていないスライド 7 枚目は
「時間表示を合わせたいときだけ、…update を 1回実行します」と、任意の作業として
書いている。読み手によってはどちらなのか迷う。実害は未確認。

### 3. tests/test_cli.py — 旧 `--claude` を受け付けることを確かめるテストが無い

変異で確かめた結果（スクラッチにコピーして `cli.py` を書き換え、`pytest tests/test_cli.py`）:

| 壊し方 | 落ちたテスト |
|--------|--------------|
| 既定を `default=False` に戻す | `test_init_creates_files_and_index`、`test_init_second_run_does_not_overwrite`（2件） |
| `if claude:` を `if True:` にする（`--no-claude` を無視） | `test_init_no_claude_skips_claude_md`（1件） |
| `CLAUDE.md` を `_skip_if_exists` を通さず書く（上書き） | `test_init_second_run_does_not_overwrite`（1件） |

新しい既定・`--no-claude`・上書きしない性質は、どれも壊すと落ちる。
ただし `init --claude` を叩くテストは無くなった（`test_init_second_run_does_not_overwrite`
も `['init']` に変わった）。オプションを `--no-claude` だけの `is_flag` に書き換えると、
旧 `--claude` が `No such option` になっても落ちるテストは無い。
手で叩いた結果、今の実装では `init --claude` は通り、`CLAUDE.md` が置かれる。
旧オプションを保つことが要件なら、`['init', '--claude']` を 1 行足す程度で足りる。

### 4. docs/UsersGuide.md:194-203 — 「手で書く」から「3. 確かめる」へ送る先が Claude Code 向けの箇条書き

「[3. 確かめる](#3-確かめる)の手順で `player.html?slides=sample` を開き」とあるが、
3. の箇条書きは「Claude Code がブラウザを操作できれば」「`ytslide update` を実行させる」
と Claude Code を前提にしている。手で書く人に要るのは箇条書きの後の「自分で開くときは、…」
の段落だけ。ZIP から来た人（CLI が無い）は 4 の `ytslide update` も実行できない。
大きな食い違いではないので任意。

### 5. README.md:91-104 — 手でコピーするのが「早い」の直後に「標準は Claude Code」

「近いテンプレートをまるごとコピーして…差し替えるのが早い。」（変えていない段落）の
すぐ後に「**標準のやり方は、Claude Code に書かせること。**」が来る。どちらを勧めて
いるのか一瞬迷う。段落の順を入れ替える、前の段落を「手で書くなら」と始める、などで
解ける。任意。

### 6. docs/UsersGuide.md:635-644 — 「AI に書かせられる」が他の AI の渡し方だけを説明している

変えていない段落が「渡すのは template.js・UsersGuide.md・原稿の 3つ」と、
「他の AI に作ってもらう」のやり方を書いている。リンク先は 2 つに直してあるので
間違いではないが、Claude Code が標準になった今は「渡す」必要が無いことと合わない。任意。

## 好みの範囲

- docs/UsersGuide.md:269-270 — 「## `ytslide` のサブコマンド」の前に空行が 2 行ある
  （`+` で 1 行足した上に既存の空行）。
- docs/UsersGuide.md:87 — 「できなければ自分で開いて見る（次の段落）」は、実際には
  箇条書き 4 項目の後の段落を指す。「下の段落」のほうが正確。

## 問題が無かった観点

- `cli.py` の init: `--claude/--no-claude`、`default=True` で意図どおり。`CLAUDE.md` の
  書き込みは `_skip_if_exists` を通ったままで、既存の `CLAUDE.md` を上書きしない
  （手で既存ファイルを置いて `init` を叩き、「すでにある: CLAUDE.md」と中身が残ることを確認）。
  `--no-claude` で置かれないこと、旧 `--claude` で置かれることも手で確認。`ruff check` は通る。
- 生成する `CLAUDE.md` の文面（「`ytslide init` で生成した」）も合わせてある。
  `rg -n -e '--claude' --glob '!archives'` で残っているのは `TODO.md` と `cli.py` の定義だけ。
- アンカー: README.md と docs/*.md の `](...#...)` 39 件を GitHub の見出しアンカー規則
  （小文字化、記号を除き、空白を `-`、重複に `-1`）で突き合わせ、すべて実在する見出しを指す。
  旧アンカー（`#ai-に作ってもらう`・`#claude-code-で作る`・`#2-最初の-1枚を書いて再生する`・
  `#3-編集して確かめる`）を指す箇所は archives 以外に残っていない。
- UsersGuide の移動で落ちた情報: 削除行は「CLI を入れずに試す」「手で書く」「他の AI に
  作ってもらう」「3. 確かめる」に移っている。ZIP の「次の手順へ進む」は
  「[手で書く](#手で書く)へ進む」に直してある。落ちたのは「`UsersGuide.md` は AI に書式を
  読ませるときに使う」「一覧の更新、時間の測定、HTTP での確認は、必要なときだけ行う」
  「後で一覧の生成や時間の測定も使うなら、次の CLI の手順で始める」の 3 文で、
  いずれも新しい流れでは要らないか、節の見出し（「〜したいとき」）が代わりを務めている。
- slides/users-guide.js 3〜6枚目: 準備（init で `CLAUDE.md` も置かれる、`--no-claude`）→
  Claude Code に作ってもらう（依頼文・構成案・check）→ 確かめる → 別のやり方、の順で
  UsersGuide の 1.〜3. と「別のやり方」に合っている（`update` の扱いは上の 2）。
- docs/Developer.md のテスト表の説明は変更に合っている。
- 規約: docs/・README・スライドに TODO 番号は増えていない。造語や直訳調の文は見当たらない。
  変更はすべて TODO-130 のチェック項目の範囲内。
- コメント: `cli.py` の `CLAUDE_MD` の上のコメントは「なぜ文字列で持つか」を保っている。

## 作り込みすぎ

作り込みすぎ: なし（コードの変更はオプション定義の 1 行と文言だけ）。
