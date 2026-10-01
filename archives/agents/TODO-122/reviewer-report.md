# TODO-122 reviewer 報告

対象: `git diff`（12 ファイル）と未追跡の `src/ytslide/browser.py`・`tests/test_browser.py`。
要修正 0 件、検討 5 件、好みの範囲 2 件。

## 実測したこと

- `PLAYWRIGHT_BROWSERS_PATH=<空のディレクトリ> uv run ytslide check --slides template`
  → `Error: chromium を起動できない: BrowserType.launch: Executable doesn't exist at …/chrome-headless-shell`
  と入れ方 3 行を出し、exit=1。サーバーのスレッドも残らず終わった
- `~/.local/share/uv/tools/ytslide/bin/` に `playwright` はあるが、`~/.local/bin/` には
  `ytslide` しかリンクされない（`uv-receipt.toml` の entrypoints も `ytslide` だけ）。
  「`uv tool install` では `playwright` が PATH に出ない」は正しい。
  この機械では PATH 上の `playwright` は npm 版（mise）で、旧手順の
  `playwright install chromium` は別物を叩いていた
- `uv tool` の環境の `sys.executable` は `~/.local/share/uv/tools/ytslide/bin/python`。
  UsersGuide の `"$(uv tool dir)/ytslide/bin/python"` と同じパスになる
- `CLAUDE_MD` と TODO.md の案を `diff` → 違いは手順 2 の Playwright の一文だけ
- `ytslide index --slides foo` → `Error: No such option '--slides'.`
- ミュータント 2 つ（scratchpad のコピーで実施）が `tests/test_browser.py` を通った（下の検討 2）

## 検討

### 1. `src/ytslide/cli.py:73`（CLAUDE_MD「決まりごと」の最後の行）

- **問題**: 「`ytslide` のコマンドは、この作業場所で `--slides <名前>` を付けて実行する」と
  書いてあるが、`ytslide index`（同じ節の 1 行目で使えと言っている）、`init`、`web` には
  `--slides` が無い。`ytslide index --slides foo` は `No such option '--slides'` で落ちる（実測）
- **困る条件**: Claude Code がこの文を字面どおりに守り、`index` に `--slides` を付けたとき。
  TODO.md の案にも同じ文があるので、案どおりではある。実害は未確認
  （エラーを見て付け直す可能性が高い）

### 2. `tests/test_browser.py:49` と `:15-51` 全体（テストの強さ）

- **問題**: 次の 2 つの壊し方をしても `test_browser.py` は 2 件とも通る（実測）
  - `browser.py:36` の 1 行目だけを取る処理を `first = str(e)` に変える。
    assert が `"… at /x\n" in msg` なので、後ろに `more` が続いても通る。
    `assert 'more' not in msg` のような否定が無い
  - `browser.py:41-42` の `finally: browser.close()` を消す。正常に起動した経路を
    通るテストが無い（`test_check` も `check.check()` を差し替えていて `chromium()` を通らない）
- **困る条件**: 1 行目に切る理由（Playwright の長い枠付きの案内に、PATH 上の別の
  `playwright install` が出る）が、リファクタリングで黙って消えうる。`close()` の
  消失は後始末の退行だが、`sync_playwright` の終了で結局閉じるので実害は未確認

### 3. `src/ytslide/browser.py:14-20`（chromium だけが無いときの案内）

- **問題**: chromium の起動に失敗したときも、パッケージの入れ方
  （`uv tool install 'git+…[video]'` と `'.[video]'`）を含む 3 行全部を出す。
  このときパッケージは入っているので、要るのは 3 行目だけ
- **もう 1 点（未確認）**: `except Error` は起動失敗をすべて同じ「chromium を入れる」案内に
  する。chromium はあるが OS のライブラリが足りない場合（Playwright が
  `Host system is missing dependencies` を出す場合）も `install chromium` を案内することになる。
  1 行目のエラー文は出るので原因は読めるはず。メッセージの実際の形は確かめていない
- **困る条件**: 利用者や Claude Code が 1 行目の `uv tool install` を実行し直す。
  既に入っている tool に同じ指定で `uv tool install` したときの挙動（何もしないか）は未確認

### 4. `pyproject.toml:33` / `docs/UsersGuide.md:8,18,292,608,616`（同梱した UsersGuide の相対リンク）

- **問題**: `docs/UsersGuide.md` は `init` で作業場所に置かれるようになったが、中に
  `Developer.md`・`../README.md#インストール` への相対リンクが 5 か所ある。
  作業場所には `README.md` も `docs/Developer.md` も置かれない
  （`test_init_creates_files_and_index` が `README.md` が無いことを assert している）
- **あわせて**: `docs/Developer.md` には「`docs/UsersGuide.md` は同梱され `init` で配られる」
  ことが書かれていない。UsersGuide を直す人が、作業場所で読まれる前提
  （相対リンクが切れる）に気づく手がかりが無い
- **困る条件**: 作業場所で UsersGuide を開いた人や Claude Code が、インストール手順への
  リンクを辿れない。実害は未確認

### 5. `src/ytslide/cli.py:79-87`（CLAUDE_MD の手順 2・3・7）

- **問題**: 依存が無いときの扱いを書いているのは Playwright（手順 2）だけ。手順 3 の
  `measure` と手順 7 の `update` は `curl`・`ffprobe` とネット接続が要るが、無いときに
  どうするかの記述が無い。`measure.py:97-99` は `subprocess.run(['curl', …], check=True)` で、
  `ClickException` に包んでいない（既存の挙動）
- **困る条件**: `ffprobe` の無い環境で Claude Code が traceback を見て、自分で入れようと
  したり手順を飛ばしたりする。TODO の範囲外かもしれないので判断は管理者に任せる。実害は未確認

## 好みの範囲

- `docs/UsersGuide.md:147` — `https://docs.claude.com/ja/docs/claude-code/overview` は
  `https://code.claude.com/docs/ja/overview` へリダイレクトされる（`curl -L` で 200）。
  リダイレクト先の URL を直接書くほうがよい
- UsersGuide「Claude Code で作る」の冒頭で `measure` も自分で実行すると書いているが、
  手順 1〜6 と mermaid の図には `measure` が出てこない（CLAUDE_MD には手順 3 としてある）。
  図と本文は互いに合っている

## 問題なしの観点

- `browser.chromium()` の例外の範囲: import は `ImportError`、起動は `playwright.sync_api.Error` だけを捕まえている。広すぎ・狭すぎは無い（上の検討 3 の案内の文面は別）
- `contextmanager` の後始末: `ClickException` は `with sync_playwright()` の中で投げるので Playwright は止まり、`yield` 中の例外でも `browser.close()` が走る。`check.py` は旧コードで `close()` が `finally` に無かったので、むしろ良くなった
- `sys.executable -m playwright install chromium`: `uv tool install` の環境で正しいパスになる（実測）
- `init --claude` の分岐・既にあれば上書きしない: 実装・テストとも TODO どおり
- `_copy_data` に寄せたことでの変化: `slides/` は `template.js` を書くときだけ作るようになったが、`template.js` があれば `slides/` もあるので挙動は変わらない。「すでにある: <名前>」の出方も同じ
- `CLAUDE_MD` と TODO.md の案: 違いは意図した手順 2 の一文だけ（`diff` で確認）
- `CLAUDE_MD` と CLI の挙動: `check` は Playwright か chromium が無いと止まる（実測）。`player.html?slides=<名前>#N` は `startIndexFromHash()`（`player.html:1697`）で N 枚目を開く。`rules` は長い語を先に、は UsersGuide「読みを直す」と一致
- `tests/test_cli.py`: `if claude:` を外す・`_skip_if_exists` を外す・UsersGuide のコピーを消す・`force-include` の行を消す、のどれでも落ちる構成になっている（読んで確認。実行したミュータントは browser.py の 2 つだけ）
- 文書どうし: README・UsersGuide「1.」・サブコマンドの表・「測定と動画に要るパッケージ」・Developer.md・CLAUDE.md（テスト 6 本）が、`init` が置くもの・`--claude`・chromium の入れ方で食い違っていない。リンク先の見出し（`#claude-code-で作る`・`#測定と動画に要るパッケージ`・`#読みを直す`）は存在する
- mermaid の図と本文の手順 1〜6: 合っている（承認 → 書く → check → 見た目 → 読み → 番号で直し → check に戻る / update → video）
- `slides/users-guide.js` の 6 枚目: 本文（`init --claude`、CLAUDE.md の決まりごと、構成案 → 書く → check → 見た目、読みは自分で聞く・番号で直す・`update`）は UsersGuide の節と食い違いなし。後ろの `// Slide N` の付け直しも揃っている。番号で users-guide の枚を指す参照は他に無い
- 範囲: 指示に無い変更は無い（`video.py`・`check.py` の置き換えは TODO の「警告を出す」の項目の内）
- コメント: `CLAUDE_MD` の上のコメント、`browser.py` の docstring とも「なぜ」を書いている

## 作り込みすぎ

- `src/ytslide/browser.py:L14-20`: shrink: 引数の無い `install_hint()` を 2 か所から呼んでいる。`sys.executable` は実行中に変わらないので、モジュール定数 `INSTALL_HINT = (…)` で足りる。重大度: 好みの範囲
- それ以外（`_copy_data`、`test_init_data_is_packaged`）は行数を減らしているか、壊れたら落ちる最小限の確認で、削れるものは無い

net: -2 lines possible.
