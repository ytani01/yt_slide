# TODO-115 verifier report

## 対象範囲の確認
`git diff HEAD` の変更ファイルは `index.html`・`docs/User.md` のみ。
指示の対象範囲と一致。

## 1. index.html に README 埋め込みの残骸が無いか
`rg -n -i 'readme|marked' index.html` の結果:

```
26:                <a href="player.html?slides=readme" class="block rounded-xl bg-slate-900 border border-slate-700 p-4 hover:border-lime-400">
27:                    <span class="font-bold"><i class="fa-solid fa-book-open text-lime-400 mr-2"></i>readme</span>
```

`player.html?slides=readme` の一覧項目 2 行だけで、`marked` スクリプトタグや
`#readme-body` の CSS、`fetch('README.md')` のスクリプトなど残骸は無い。
一致。

## 2. 一覧ページの表示（Playwright / chromium で実測）
`python3 -m http.server 8933` でこのディレクトリを配信し、Playwright
（chromium, headless）で `http://localhost:8933/index.html` を開いて確認。

- 見出し: `h1` の innerText は `yt_slide` — 一致
- `<li>` の件数: `main ul > li` を数えて **5 件** — 一致
- `player.html?slides=user` のリンク: `a[href="player.html?slides=user"]` が
  1 件存在し、クリック後の URL は
  `http://localhost:8933/player.html?slides=user#1`、
  ページタイトルは `player.html で自分のスライドを作る - 使い方` に
  遷移した。プレイヤーが開くことを確認。
- コンソール出力: `pageerror` および `console type=error` は無し。
  出力されたのは以下の warning 2 件のみ（Tailwind の CDN 利用に関する
  ものでこの変更とは無関係、変更前から出るはずのもの。今回は変更前との
  比較はしていない）:
  ```
  warning: cdn.tailwindcss.com should not be used in production. ...
  warning: cdn.tailwindcss.com should not be used in production. ...
  ```

## 3. pytest
- `uv run pytest tests/test_index.py -v` → **6 passed**（全て PASSED）。
- `uv run pytest`（全体）→ **25 passed, 1 failed**。
  失敗は `tests/test_measure.py::test_all_slides_rules_load` で、
  `common_rules` の件数が `25 == 23` で不一致というもの。
  この変更（作業ツリーの diff）を `git stash` で退避して同じテストを
  実行しても同じ失敗が再現したため、**今回の index.html / docs/User.md の
  変更とは無関係の既存の失敗**と判断できる（実測で確認済み）。

  ```
  >       assert len(common_rules) == 23, common_rules
  E       AssertionError: [...]
  E       assert 25 == 23
  ```

## 4. docs/User.md に README 埋め込みに関する記述が残っていないか
`rg -n 'README' docs/User.md` の結果、5 件ヒットしたが、いずれも
「README のインストール手順に従う」旨の案内で、「README.md を置けば
一覧ページに表示される」という記述は無くなっている（該当行は diff で
削除済み）。一致。

```
18:[README の「インストール」](../README.md#インストール)に従って `ytslide` を入れる。
46:後で `ytslide` のコマンドを使いたくなったら、README の手順でインストールし、
227:インストールは [README の「インストール」](../README.md#インストール)にある。
535:- `docs/`・`archives/`・`README.md`・`TODO.md` は**要らない**。
537:  入れる。[README の「インストール」](../README.md#インストール)）。
```

## 確かめられなかったこと・判断が要る点
- `tests/test_measure.py::test_all_slides_rules_load` の失敗は既存のもので
  今回の変更とは無関係と判断したが、直接の原因（`common_rules` が
  23 でなく 25 になっている理由）までは調べていない。実害・対応要否の
  判断は管理者に委ねる。
- レイアウト・配色・README.md 本文の確認は依頼の対象外のため行っていない。
