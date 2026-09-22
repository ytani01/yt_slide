# TODO-116 implementer 報告

## 変更したファイル

- `docs/User.md` → `docs/UsersGuide.md`（`git mv`）
- `slides/user.js` → `slides/users-guide.js`（`git mv`）
- `docs/Developer.md`
  - `docs/Developer.md:6,17,78,186` リンク先を `UsersGuide.md` に直す
  - `docs/Developer.md:15` スライド名の列挙 `` `user` `` → `` `users-guide` ``
- `slides/developer.js:33` ナレーション中の `User.md` → `UsersGuide.md`
- `slides/template.js:234,236` GitHub blob URL・表示テキストを `UsersGuide.md` に
- `slides/users-guide.js`（改名後）全体の `User.md` 参照（コメント・ナレーション・
  表示テキスト・URL・`slides=user`）を `UsersGuide.md`／`slides=users-guide` に
- `slides/readme.js`
  - `:131,162,193` `player.html?slides=user` → `?slides=users-guide`
  - `:164` カードの表示テキスト「スライドの作り方（user）」→「（users-guide）」
  - `:179` ナレーション文中の「作り方を説明するuser」→「users-guide」
  - `:193` 表内のリンク文字列 `user` → `users-guide`、`docs/User.md` → `docs/UsersGuide.md`
- `docs/UsersGuide.md`（改名後）自身のリンク・URL（`:3,96,97,99,118,554,743`）を
  `UsersGuide.md`／`slides=users-guide` に直す
- `README.md`
  - 本文中の `docs/User.md#...` アンカー付きリンクをすべて `docs/UsersGuide.md#...` に
    （見出しのアンカー文字列自体は変更していない）
  - `:59` 表のスライド名 `` `user` `` → `` `users-guide` ``
- `CLAUDE.md:32` リンクを `docs/UsersGuide.md` に
- `index.html:50,51` カードの href と表示テキストを `slides=users-guide`／`users-guide` に
- `tests/test_index.py:59`、`tests/test_measure.py:103` スライド名 `'user'` →
  `'users-guide'`

`archives/` 配下は一切変更していない。

## 判断が要った点

- `docs/Developer.md:15` の表（`slides/<名前>.js` の一覧）と
  `slides/readme.js` のナレーション文・表内リンクは、依頼文の
  `rg` パターン（`User\.md|user\.js|slides=user`）には掛からないが、
  スライド名 `user` を指す箇所だったため対象に含めて直した
  （依頼の「4. スライド名を直す」に該当すると判断）。
- 見出しのアンカー文字列（`#公開` など）は一切変更していない。

## 検証

- `rg -n 'User\.md|user\.js|slides=user' --glob '!archives/**' --glob '!TODO.md' .`
  → 0 件（`TODO.md` は今回の担当範囲外なので除外。中身は TODO-116 自身の
  作業記録と、他の未着手項目 `TODO.md:16` の記述で、旧ファイル名を指しており
  main／wording の担当）
- `uv run pytest -q` → `1 failed, 25 passed`。
  失敗は `tests/test_measure.py::test_all_slides_rules_load` の
  `assert len(common_rules) == 23`（実際は 25）で、`git stash` して
  改名前の develop の状態で同テストを流しても同じ失敗が再現した
  （改名前から存在する既存の失敗で、今回の変更とは無関係）。

## 残る懸念

- 上記の既存テスト失敗（`common_rules` の件数不一致）は本タスクの範囲外。
  対応が必要なら別項目として起票が要る。
- 行の折り返し幅の見直し（依頼の 6.）は、`UsersGuide.md` に置き換わった行の
  長さを確認したが、いずれも各ファイルに既存する行の長さの範囲内
  （README.md は最大 129 文字、docs/UsersGuide.md は表など最大 323 文字の
  行が元々ある）だったため、追加の折り返し直しは行っていない。
