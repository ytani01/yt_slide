# TODO-116 implementer への依頼

## 目的

`docs/User.md` を `docs/UsersGuide.md` に、`slides/user.js` を
`slides/users-guide.js` に改名し、参照をすべて追従させる。
スライド名（URL の `?slides=` の値、一覧の表示名）も `user` → `users-guide`。

## 対象範囲

`rg -n 'User\.md|user\.js|slides=user' --glob '!archives/**' .` で出る箇所が対象。
`rg -n "'user'|\"user\"" tests/` も見ること（テスト内のスライド名）。

**`archives/` は一切変更しない**（当時の記録なので直さない）。

## やること

1. `git mv docs/User.md docs/UsersGuide.md`、`git mv slides/user.js slides/users-guide.js`
2. 文書のリンクを直す（`README.md`・`CLAUDE.md`・`docs/Developer.md`・
   `docs/UsersGuide.md` 自身）。**見出しのアンカーは変えない**
   （`docs/User.md#公開` → `docs/UsersGuide.md#公開`）
3. スライド内の参照を直す（`slides/readme.js`・`slides/template.js`・
   `slides/developer.js`・`slides/users-guide.js`）。
   GitHub の raw / blob URL、表示テキスト、**ナレーション文**も含む。
   ナレーションでは `User.md` を「ユーザーズガイド」と読ませるのではなく、
   `UsersGuide.md` のまま書く（読み上げの調整は今回やらない）
4. スライド名を直す（`index.html` のカード、`slides/readme.js` の一覧と
   `player.html?slides=user` のリンク・コマンド例、`README.md` の表）
5. `tests/test_index.py`・`tests/test_measure.py` のスライド名
6. 文の整形: 行が長くなりすぎる `.md` は周囲の折り返し幅に合わせる

## 保つもの

- 見出しのアンカー、本文の内容、スライドの見た目と構成
- `player.html` 自体は触らない（`user gesture` などの無関係な `user` を直さない）

## 完了条件

- `rg -n 'User\.md|user\.js|slides=user' --glob '!archives/**' .` が 0 件
- `uv run pytest -q`（または `python3 -m pytest -q`）が通る

## 報告

`archives/agents/TODO-116/implementer-report.md` に、変更したファイルと
判断が要った点を書く。返事は 5 行以内（終わったか・報告のパス・判断が要る点）。
