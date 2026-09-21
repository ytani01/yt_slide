# TODO-096 レビュー報告

対象: `git diff HEAD` + `git status --porcelain` の `??`（`pyproject.toml`・`src/`・
`tests/`・`uv.lock`）。`uv run pytest -q` で 21 件全部通ることは確認済み（実測）。

## 要修正

### 1. `player.html:803` の読み上げ置換表が narration の変更に追随していない

- **場所**: `player.html:803`（`SPEECH_RULES`）、影響する narration は
  `slides/readme.js:216`・`slides/developer.js:55,175`・`slides/user.js:316,337`
  の計 5 箇所（`slides/user.js:156` は body 側なので読み上げには関わらない）
- **何が問題か**: `SPEECH_RULES` に
  `[/measure-duration\.py/gi, 'メジャー デュレーション ドット パイ']` が残っているが、
  narration 側の `measure-duration.py`／`tools/measure-duration.py` は今回の
  差分ですべて `ytslide measure` に書き換えられた（`grep -rn
  "measure-duration\.py" --include="*.js" .` で本文中の一致はもう 0 件）。
  結果、このルールは当たる対象が無くなり死んでいる。一方で narration に
  新しく 5 箇所入った `ytslide` には、対応する読みのルールが 1 つも無い
  （`slidesConfig.rules` にも `SPEECH_RULES` にも `ytslide` は出てこない）。
- **なぜ問題か**: `TODO`・`CLAUDE.md`・`Claude`・`player.html` など、narration
  に出てくる固有の語は必ず `SPEECH_RULES`（または `slidesConfig.rules`）に
  読みを持たせるのがこのファイルの既存の作り（`player.html:790-817` を参照）。
  `ytslide` は英語表記のまま 6 回読み上げられることになり、既存の慣習を
  踏まえると素の英単語読みでは不自然になりやすい語（`TODO`・`Claude` と同様の
  扱いが要る語）。「対で保守すべきものの片方だけが変わった」に当たる
- **実害の見込み**: **未確認。** ブラウザ・TTS を起動して実際の読み上げ音を
  聞いていない（指示どおり見た目・音声の確認はしていない）。死んだルールが
  残っていること自体は実測で確認済みだが、「ytslide」が実際にどう読まれるかは
  確認していない

### 2. `slides/template.js:485` に旧ツール名が生き残っている

- **場所**: `slides/template.js:485`（body、表示用 HTML。narration ではない）
- **何が問題か**: `秒数は <span ...>measure-duration.py</span> で測る。` が
  そのまま残っている。`grep -rn "measure-duration\.py" --include="*.md"
  --include="*.js" --include="*.html" . | grep -v archives/ | grep -v TODO.md`
  で唯一のヒット。第 2 段の依頼の対象範囲（`grep "tools/"`）には掛からない
  文字列（`tools/` を含まない）だったため素通りしたと見られる
- **なぜ問題か**: レビュー観点 5「文書とスライドの記述が、実際の CLI と
  合っているか」に反する。`measure-duration.py` という名前のファイルは
  もう存在しない（`tools/` ごと削除済み）ので、この記述は誤り
- **実害の見込み**: 実害は表示上の誤字程度で低いが、内容としては誤り。
  narration ではないので測り直しは不要

## 検討

### 3. `slides/developer.js:70-71` の表見出しとコマンドの不整合

- **場所**: `slides/developer.js:64,70-71`
- **何が問題か**: 表の見出しは「ファイル」だが、行の中身は `ytslide measure`・
  `ytslide video`（コマンド）になっている。実装担当（第 2 段）自身が
  「残る懸念」として同じ点を報告済み（`implementer-B-report.md`）
- **なぜ問題か**: 見出しと内容が一致しない。実装担当も「見出しごと直す別項目が
  要るかもしれない」と留保している通り、この差分の範囲内で直すか見送るかは
  管理者判断が要る
- **実害の見込み**: 表示上の違和感のみ。機能への影響なし

### 4. `ytslide init`・`update`・`web` に自動テストが無い

- **場所**: `tests/`（該当ファイル無し）
- **何が問題か**: `src/ytslide/cli.py` の `init`／`update`／`web` サブコマンドを
  直接叩く pytest が無い。`measure`／`index`／`video` は各モジュールの関数を
  経由したテストがあるが、`init` の「既存ファイルを壊さないか」「2 回目は
  上書きしない」は、実装報告書に書かれた手動実行の結果でしか確かめられていない
- **なぜ問題か**: 旧 `tools/*.py` にはそもそも `init` 相当の機能が無かったので
  「薄くなった」わけではないが、新規に追加した挙動（レビュー観点 3 が名指しした
  部分）に対する自動テストが 0 件なのは、レビュー観点 8「テストが要る変更に
  テストが足りているか」に照らすと薄い
- **実害の見込み**: 未確認。手動実行では `implementer-A-report.md` の
  「完了条件の実行結果」3 番どおりに動いている

### 5. `--only 1 --only 2`（`multiple=True`）の恒久的なテストが無い

- **場所**: `src/ytslide/cli.py:157`、`tests/test_video.py`
- **何が問題か**: `implementer-A-report.md` は「`CliRunner` で実測済み」と
  書いているが、その確認は `tests/test_video.py` には残っていない
  （`grep -rn only tests/` はヒット無し）。承認済みの仕様変更
  （`--only 1 2` → `--only 1 --only 2`）の挙動を確かめる自動テストが無い
- **なぜ問題か**: オプションの受け方を変えた箇所なので、退行があっても
  `uv run pytest` では検知できない
- **実害の見込み**: 未確認。オプション定義（`type=int, multiple=True`）を
  読む限り click の標準的な使い方で、動くとは思われる

## 問題が無かった観点

- **オプションの名前・意味**: `measure`・`index`・`video` の主要オプション
  （`--text`・`--all`・`--write`・`--slides`・`-n/--repeat`・`--root`・`--out`）は
  `git show HEAD:tools/*.py` の argparse と突き合わせて、名前・意味とも一致
- **`paths.py` の置き場所解決**: `DATA` の同梱データ判定（`ytslide/data/` が
  無ければリポジトリ直下へ落とす）、`--root` 指定時／未指定時の
  `ROOT`/`SLIDES`/`PLAYER_HTML`/`INDEX_HTML` の決め方は、決定事項どおり
  「後方互換のリポジトリへの分岐を無くし、カレントディレクトリのみ」に
  なっている。`tests/test_measure.py::test_find_root_and_player_html` で
  実測されている
- **マーカー正規表現**: `index.py:23` の `BEGIN_MARKER_RE`
  （非貪欲・`re.S` は `replace_marker_block` 側で結合時に付与）を実際の
  `index.html` に対して実行し、意図どおり 1 箇所だけにマッチすることを
  確認した（実測。`python3 -c` で `index.html` に対して直接検証）。
  `tests/test_index.py::test_replace_marker_block_reads_old_comment_text` で
  旧コメント文との互換も確認されている
- **`ytslide init` の既存ファイル保護**: `_skip_if_exists()`（`cli.py:30`）で
  ファイルごとに独立して存在チェックしており、途中で失敗しても
  再実行で欠けた分だけ補える作り。破壊的な上書きは無い
- **テストの厚さ（`measure`／`index`／`video` の既存分）**: `git show
  HEAD:tools/test_*.py` と `tests/test_*.py` を突き合わせ、assert が
  1 件も落ちていないことを確認した
- **`CLAUDE.md` への `docs/` の写し**: 増えていない。「プレイヤー側は
  インストール不要・`ytslide` はインストールが要る」という切り分けは
  `CLAUDE.md`・`README.md`・`docs/User.md`・`docs/Developer.md`・`AGENTS.md`
  で揃っている
- **範囲**: `grep -rn "tools/" ... | grep -v archives/` の結果は `TODO.md`
  のみ（項目の記述として残るのが自然なので問題なし）。それ以外に指示に
  無い変更は見当たらなかった（`slides/developer.js` の narration が
  `grep "tools/"` の対象範囲を超えて書き換えられた点は実装担当自身が
  「残る懸念」として明記済み。上の「検討 3」参照）
