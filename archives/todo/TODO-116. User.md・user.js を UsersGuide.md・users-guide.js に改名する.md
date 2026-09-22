# TODO-116. `User.md`・`user.js` を `UsersGuide.md`・`users-guide.js` に改名する

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | implementer + verifier |
| 実施 | Opus 5 / effort high | implementer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 10,480 | 27,481 | 65% |
| verifier | Sonnet 5 | medium | 13,432 | 48,420 | 19% |
| implementer | Sonnet 5 | medium | 7,846 | 48,752 | 16% |
| 合計 |  |  | 31,758 | 124,653 | 概算 $2.4 |

- implementer・verifier とも定義（`~/.claude/agents/`）のまま。上書きしていない
- main は利用者の設定が Opus 5 / effort high だった（見込みは Sonnet 5 / medium）

## きっかけ

`user` という名前では「利用者向けの説明」なのか「利用者が作る手順」なのかが
読み取れなかった。`UsersGuide.md` / `users-guide` なら、スライド作成者向けの
ガイドだと名前で分かる。

## やったこと

- `docs/User.md` → `docs/UsersGuide.md`、`slides/user.js` → `slides/users-guide.js`
- 文書のリンクを直した（`README.md` 16 箇所・`CLAUDE.md`・`docs/Developer.md`・
  `docs/UsersGuide.md` 自身）。**見出しのアンカーは変えていない**ので、
  直したのはファイル名の部分だけ
- スライド内の参照を直した（`slides/readme.js`・`slides/template.js`・
  `slides/developer.js`・`slides/users-guide.js`）。GitHub の blob / raw URL、
  表示テキスト、ナレーション文を含む
- スライド名を `user` → `users-guide` に変えた。ファイル名がそのまま URL に
  なるため、`player.html?slides=user` は `?slides=users-guide` になる。
  一覧の表示名（`index.html` のカード、`slides/readme.js` の一覧、
  `README.md` の表）も揃えた
- `tests/test_index.py`・`tests/test_measure.py` のスライド名

`archives/` は変えていない。当時の記録であり、現行仕様ではないため。

## 確かめたこと

- `docs/UsersGuide.md` を指すアンカー 12 個を、`docs/UsersGuide.md` の見出しと
  1 つずつ突き合わせた。すべて一致
- ローカルの HTTP サーバーと Playwright（chromium, headless）で
  `player.html?slides=users-guide` を開き、1 枚目（`SLIDE 01 / 17`）が
  描画され、コンソールエラーが 0 件であることを確認した。
  旧 URL `?slides=user` は `slides not found: user` の案内が出る
  （スクリーンショット: `~/tmp/playwright-mcp/todo116-users-guide.png`、
  `todo116-user-old.png`）
- `pytest` は 25 passed / 1 failed。失敗は
  `tests/test_measure.py::test_all_slides_rules_load`（`common_rules` が
  25 に対し期待値 23）で、**改名前の状態でも同じ失敗が再現する**ことを
  `git stash -u` で実際に確かめた。この改名とは無関係

## 残ること

- 上記の `test_all_slides_rules_load` の失敗は、この項目より前から存在する。
  別の項目として扱う

## 分担の振り返り

- **implementer** は改名と参照の追従をひととおり済ませたが、`git mv` を
  使わず新ファイルの追加＋旧ファイルの削除という形にしたため、
  インデックスに削除がステージされていなかった。そのままコミットすると
  旧ファイルが git 管理下に残る状態だった（main が `git add -A` で解消。
  リネームとして記録された）
- **verifier** がそのステージの不整合を見つけた。加えて、依頼文に書いた
  完了条件の `rg` が原理的に 0 件にならないこと（`slides=user` が
  `slides=users-guide` に部分一致する）を、`-o` で一致文字列を出して
  示した。既存のテスト失敗も `git stash -u` で改名前と比べて切り分けた。
  依頼どおり、どれも報告だけで直していない
- 見込み（implementer + verifier）と食い違いは無かった。reviewer は
  入れていない。分岐や条件式が変わらない改名であり、実際に必要な指摘は
  すべて verifier が拾えた
- **次に同じ規模（機械的な改名 + 参照の追従）をやるなら、同じ組み方でよい。**
  ただし 2 点を依頼文に足す:
  (1) 「改名は `git mv` で行い、`git status --short` に `R` が出ることを
  確認する」と実装側の完了条件に書く（今回の手戻りはこれで防げた）
  (2) 完了条件に `rg` のパターンを書くときは、新名が旧名を含む場合に
  部分一致することを先に確かめる。今回は `-w` や
  `'slides=user\b(?!s)'`（`-P`）が要った。
  main が完了条件を書く時点の見落としで、担当の問題ではない
