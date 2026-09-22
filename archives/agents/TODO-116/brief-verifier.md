# TODO-116 verifier への依頼

実装が指示どおりか確かめる。**直さない。** 見つけたことは報告するだけ。
境界線上の判断もしない（「実害は未確認」と添えて報告する）。

依頼の内容は `archives/agents/TODO-116/brief-implementer.md`、
実装の報告は `archives/agents/TODO-116/implementer-report.md` にある。

## 確かめること

1. `rg -n 'User\.md|user\.js|slides=user' --glob '!archives/**' .` が 0 件
2. `archives/` が 1 文字も変わっていない（`git status --short archives/` で、
   `archives/agents/TODO-116/` 以外の変更が無いこと）
3. `docs/UsersGuide.md` の中のリンク・自己参照が新名になっていること。
   **見出しのアンカーが変わっていないこと**（`README.md` の
   `docs/UsersGuide.md#...` のアンカーが `docs/UsersGuide.md` の見出しに
   実在するか、1 つずつ突き合わせる）
4. `git diff --stat` と `git log` から、改名が `git mv` でされている
   （履歴が追える）こと
5. `python3 -m pytest -q`（または `uv run pytest -q`）の結果。
   `tests/test_measure.py::test_all_slides_rules_load` の失敗は
   **改名前（`git stash` せず `git show HEAD:...` を使うなどして）でも
   起きるのかを実際に確かめる**。今回の変更が原因かどうかを事実で示す
6. `player.html?slides=users-guide` が実際に再生できること。
   ローカルで HTTP サーバーを立てて Playwright（`node` でも可）で開き、
   1 枚目が描画され、コンソールエラーが出ないことを確かめる。
   **スクリーンショットを撮り、パスを報告に書く**。
   併せて `player.html?slides=user` が「無い」扱いになるかも見る
   （古い URL が残っていないかの確認。壊れていても直さない）

デザインの良し悪しは評価しない。レイアウトの測り直しも要らない。
一致したものは 1 行、食い違いだけ詳しく書く。

## 報告

`archives/agents/TODO-116/verifier-report.md`。
返事は 5 行以内（終わったか・報告のパス・判断が要る点）。
