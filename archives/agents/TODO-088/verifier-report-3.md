# TODO-088 verifier 報告（3回目。残り2箇所の直しの確認）

計測環境は前回・前々回と同じ: Playwright headless Chromium 1280x800、
`NODE_PATH=/home/ytani/work/ytBackgammon/node_modules`、playwright 1.63.0。
計測スクリプト: `archives/agents/TODO-088/check-round3.js.txt`
（生ログ: `run3.log`）。grep の生の結果は `grep-round3.txt`。

指示どおり、コード・文書は一切変更していない。原因の切り分けや
境界線上の判断はしていない。

## diff の確認

`git diff README.md slides/developer.js` で、指示された2箇所のとおりに
直っていることを確認した（それ以外の差分は無し。README.md は前回までの
差分も含めて表示されるが、今回の指示範囲である:103-104 は
「サーバーに置かず `file://` で直接開いても、表示から読み上げまで動く」に
書き換わっていた）。

## 1. `slides/developer.js` スライド3の見た目

`file://.../player.html?slides=developer` を開き、`#next-btn` で
スライド3まで送って実測。

- 注記のテキスト: `※ file:// で直接開いても、表示から読み上げまで動く（Online Voice で確認）`
  （41字、指示どおりの文言）
- 注記のバウンディングボックス: `top 481.4 / bottom 502.25 / left 75.0 / right 891.0`
  （height 20.8px）。**1行のみ**（`scrollHeight: 642` は当初セレクタの
  バグで無関係な祖先 div を拾っていたための誤測で、修正後は
  `scrollHeight: 21` / `clientHeight: 21` で一致 = 折り返し無し）
- スライド全体の枠（`#slide-canvas`）: `top 152 / bottom 580.4 / left 49 / right 917`。
  注記のボックスはこの内側に収まっている（`fitsWithinStage: true`）
- 他の要素（2つの説明ボックス）との重なりは、座標上も
  スクリーンショット上も見当たらなかった
- スクリーンショット: `~/tmp/playwright-mcp/TODO-088-developer-3.png`。
  1280x800、不透明、欠けなし、余計なものの映り込みなし。目で見て
  注記は説明ボックスの下に1行で収まっていた

## 2. `slides/developer.js` 全体が最後まで読まれるか

全スライドを `#next-btn` で送った（スライド総数: **11**）。

- 本文が空だったスライド: **無し**（`emptySlides: []`）
- console error 0 件、pageerror 0 件、requestfailed 0 件

## 3. duration を測り直す必要があるか

スライド3の `narration`（実測で `slideData[2].narration` を直接取得）:

`player.html がローカルを指すのはスライドデータだけで、しかも相対パスです。player.html と同じ場所に slides を置けば、public_htmlの外でもそのまま動きます。ネット接続だけは必要です。`

`git diff` でも `narration` 行に変更は無く、変わったのは注記の `render`
文字列のみだった。**ナレーション文は変わっていない**ので、`duration`
の測り直しは不要という前提と一致する（実測はしていない。指示どおり
「変わっていなければ測り直し不要」に従った）。

## 4. grep の再実行

指定の grep（`archives/` と `TODO.md` を除く。`docs/Developer.md:121` と
`player.html:710` も除く）を再実行した結果、22行がヒットした
（`grep-round3.txt` に保存）。

- 「簡易サーバーを立てる必要がある」「`file://` では読み上げを試していない」
  と読める記述は、**もう見当たらなかった**
- README.md:103、slides/developer.js:105 とも、指示どおりの新しい文言に
  なっていた
- 残る `file://` 言及（README.md:26、docs/Developer.md:40/42/44/46、
  docs/User.md:317、slides/readme.js の各所）は、いずれも「動く」側の
  記述で、矛盾するものは見当たらなかった

## 確かめられなかったこと・判断できないこと

- grep でヒットした22行のうち、文言としての自然さ・重複の要否は
  判断していない（食い違いの有無のみを見た）
- Web Speech API の再測定はしていない（今回の指示範囲外）
