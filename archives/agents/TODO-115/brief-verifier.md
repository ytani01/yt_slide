# TODO-115 verifier への依頼

## 目的
`index.html` から README.md 埋め込みを削った変更が、指示どおりで、
一覧ページの表示と `ytslide index` の生成を壊していないことを確かめる。

## 対象範囲
`git diff HEAD` の差分（`index.html`・`docs/User.md`）。

## 確かめること
1. `index.html` に README 埋め込みの残骸が無い。
   `rg -n -i 'readme|marked' index.html` で出るのは
   `player.html?slides=readme` の一覧項目だけであること。
2. 一覧ページが表示できる。`python3 -m http.server` でこのディレクトリを配信し、
   Playwright（`node` でも可）で `index.html` を開いて、
   - 見出し「yt_slide」と 5 件の `<li>` が出る
   - `player.html?slides=user` のリンクを踏むとプレイヤーが開く
   - コンソールにエラーが出ていない
   を確かめる。**測った値（件数・URL・コンソール出力）を報告に載せること。**
3. `pytest` が通る（特に `tests/test_index.py`。`ytslide index` が
   GENERATED SLIDES ブロックを書き換えても壊れないこと）。
4. `docs/User.md` に、README を置けば一覧ページに出るという記述が
   残っていない（`rg -n 'README' docs/User.md`）。

## やらなくてよいこと
- レイアウトやデザインの良し悪しの評価
- 配色・余白の測り直し
- README.md 本文の内容の確認

## 完了条件
上の 1〜4 の結果を `archives/agents/TODO-115/verifier-report.md` に書く。
一致したものは 1 行、食い違いだけ詳しく。**コードは直さない。**
境界線上の判断もしない。気づいたことは「実害は未確認」と添えて報告するだけ。

## 返事
5 行以内で「終わったか・報告ファイルのパス・判断が要る点」のみ。
