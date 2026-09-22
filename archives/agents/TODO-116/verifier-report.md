# TODO-116 verifier 報告

## 1. `rg -n 'User\.md|user\.js|slides=user' --glob '!archives/**' .`

**0 件にはならない。** 実行すると 7 箇所が拾われる（`TODO.md` を除いても）:

```
$ rg -no 'User\.md|user\.js|slides=user' --glob '!archives/**' --glob '!TODO.md' .
./index.html:50:slides=user
./docs/UsersGuide.md:3:slides=user
./docs/UsersGuide.md:743:slides=user
./slides/users-guide.js:1:slides=user
./slides/readme.js:131:slides=user
./slides/readme.js:162:slides=user
./slides/readme.js:193:slides=user
```

原因を確認した。すべて `slides=user` の枝が `slides=users-guide`（新しい URL）の
**先頭部分文字列**にマッチしているだけで、実体は旧 URL `slides=user`（単独）
ではない。`-o` で一致文字列を出すと全部 `slides=user`（`users-guide` の頭）
だった。`User\.md` 単独や `user\.js` 単独に一致する箇所は無い。
つまり**旧名の残留ではない**が、依頼文・完了条件に書かれた rg コマンドを
そのまま実行すると文字どおりには 0 件にならない（パターンに単語境界が無いため）。
implementer 報告は「0 件」としているが、私が同じコマンドをそのまま再実行すると
7 件出た。パターンの単語境界の有無という設計上の限界であり、実害（旧名が
実際に残っている）は無いと判断できるが、**「0 件」という報告の文言自体は
正確ではない**。

## 2. `archives/` の変更範囲

```
$ git status --short archives/
?? archives/agents/TODO-116/
```

`archives/agents/TODO-116/`（新規）以外の変更は無い。一致。

## 3. `docs/UsersGuide.md` のリンク・アンカー

`README.md`・`docs/Developer.md`・`docs/UsersGuide.md` 自身・`CLAUDE.md`・
`slides/*.js` に出てくる `docs/UsersGuide.md#...` 形式のアンカーを全て抽出し、
`docs/UsersGuide.md` の見出し（`grep -n '^#'`）と 1 つずつ突き合わせた。
README.md に出てくる 12 個のアンカー
（`#手順` `#1-自分の作業場所を用意する` `#2-最初の-1枚を書いて再生する`
`#3-編集して確かめる` `#ai-に作ってもらう` `#ytslide-のサブコマンド`
`#テキストで書く利点` `#音が出ないとき` `#公開` `#最小の例`
`#手順` `#他のサーバーへ持っていくとき` `#読み上げの声を選ぶ`）は、
すべて `docs/UsersGuide.md` の対応する見出し
（`## 手順` `### 1. 自分の作業場所を用意する` など）の GitHub 標準スラグと
一致した。見出しの文字列自体（`# 公開` など）も変更されていないことを確認した。
一致。

## 4. `git mv` による改名（履歴の追えるか）

**問題あり。** `git status --short` で見ると:

```
 D docs/User.md      ← ステージされていない削除（作業ツリーから消えているだけ）
A  docs/UsersGuide.md ← インデックスに追加済み
 D slides/user.js
A  slides/users-guide.js
```

`git diff --cached --stat`（このままコミットした場合に入る内容）を見ると:

```
 docs/UsersGuide.md    | 743 ++++++++++++++++++++++++++++++++++++++++++++++++++
 slides/users-guide.js | 409 +++++++++++++++++++++++++++
 2 files changed, 1152 insertions(+)
```

リネームとしては認識されず、**単なる新規ファイル追加としてステージされている**。
旧ファイル（`docs/User.md`・`slides/user.js`）の削除はステージされておらず、
かつ作業ツリーからは実体が既に消えている（`ls` で `No such file or directory`）。
このままの状態で `git commit`（`git add` し直さずに）すると、
コミットには新ファイルの追加だけが入り、旧ファイルは git の管理下に
「存在するはずだが作業ツリーに無い」という不整合な状態で残ってしまう。

`git diff --stat HEAD`（作業ツリー全体と HEAD の比較）だけを見ると
`docs/{User.md => UsersGuide.md}` のようにリネーム風に表示されるが、
これは git のリネーム検出（内容類似度によるヒューリスティック）が
働いているだけで、実際のインデックスの状態（上記）とは別。
「`git mv` で行われ、履歴が追える」状態には**現時点ではなっていない**。
`git add -A`（または `git add docs/ slides/`）で削除も含めてステージし直せば
解消するはずだが、それは直す作業なので行っていない。

## 5. pytest

```
$ uv run pytest -q
..............F...........                                               [100%]
1 failed, 25 passed in 1.26s
```

失敗は `tests/test_measure.py::test_all_slides_rules_load` の
`assert len(common_rules) == 23` に対し実際は `25`。

改名前（`git stash -u` で今回の全変更を退避し、HEAD の状態に戻して）
同じテストを実行したところ、**同じ失敗が同じ内容で再現した**:

```
$ git stash -u
$ uv run pytest -q tests/test_measure.py
.....F...                                                                [100%]
1 failed, 8 passed in 0.15s
AssertionError: ... assert 25 == 23
```

（`stash pop` で復元済み。復元後の `git status` は事前と一致することを確認した。）
今回の改名が原因ではなく、改名前から存在する既存の失敗であることを実際に
確かめた。implementer 報告の記述と一致する。

## 6. `player.html?slides=users-guide` の実再生確認

ローカルで `python3 -m http.server 8791` を起動し、`/tmp/verify064b`
（既存の playwright 環境、他タスクの verifier が入れたもの）を使って
Playwright（chromium, headless）で確認した。

- `http://localhost:8791/player.html?slides=users-guide`
  - HTTP 200、コンソールエラー・ページエラーとも 0 件
  - 1 枚目（`player.html で自分のスライドを作る`、`SLIDE 01 / 17`）が
    描画されている
  - スクリーンショット: `/home/ytani/tmp/playwright-mcp/todo116-users-guide.png`
- `http://localhost:8791/player.html?slides=user`（旧 URL）
  - コンソールに `Failed to load resource: 404`、ページ内エラー
    `Error: slides not found: user`
  - 画面には「スライドのデータ slides/user.js を読み込めませんでした。」と
    表示され、「無い」扱いになっている（壊れてはいるが、それが期待どおり）
  - スクリーンショット: `/home/ytani/tmp/playwright-mcp/todo116-user-old.png`

両方とも意図どおり。HTTP サーバーは確認後に停止した（`ss -ltnp` でポート
8791 が空いていることを確認済み）。

## 変更ファイル一覧と指示範囲の一致

`git status --short` で見えるファイルは implementer 報告に列挙されたものと
一致（`CLAUDE.md`・`README.md`・`docs/Developer.md`・`docs/User.md`（削除）・
`docs/UsersGuide.md`（追加）・`index.html`・`slides/developer.js`・
`slides/readme.js`・`slides/template.js`・`slides/user.js`（削除）・
`slides/users-guide.js`（追加）・`tests/test_index.py`・
`tests/test_measure.py`）。指示に無いファイルの変更は見当たらない。
`tests/test_index.py`・`tests/test_measure.py` の diff もスライド名の
文字列 1 箇所ずつのみで、他の変更は無い。

## 確かめられなかったこと・判断できないこと

- 上記 4 の「ステージの状態」は事実として報告するが、**これを implementer の
  やり直しが要る不備として扱うかどうかの判断はしていない**（コードを
  直さない担当のため）。`git add -A` 等で解消できる見込みだが、それも
  含めて管理者の判断に委ねる
- 上記 1 の「rg で 0 件にならない」件も、実害は無いと考えられるが、
  完了条件の文言をどう扱うか（達成とみなすか、文言を直すか）は
  管理者の判断
