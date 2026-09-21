# TODO-107 verifier-report

## 1. 置き換え漏れ

```
grep -rn "型" README.md docs/*.md slides/*.js index.html
```

結果は 4 件のみで、依頼どおり:
- `slides/claude-memo.js` 3 件（Python の型・型検証。別の意味。対象外）
- `slides/template.js:93` の「同じ定型が並ぶ」

それ以外の「型」は残っていない。**問題なし。**

## 2. 誤った置き換え

`git diff` を全行読んだ（README.md, docs/User.md, index.html, slides/readme.js,
slides/user.js, slides/template.js）。

- 見本以外の意味の「型」を誤って置き換えた箇所は見当たらなかった。
- 「テンプレートの見本」のような重複した言い方は見当たらなかった
  （`slides/template.js` の「この見本から型をコピーして中身を差し替える」→
  「テンプレートをコピーして中身を差し替える」のように、「見本から」を
  削って重複を避けている）。
- 日本語として不自然な箇所は見当たらなかった。

**問題なし。**

## 3. duration の測り直し

`ytslide measure --slides <name> --all`（`--write` なし、timeout 600000）を
実行し、出力の `-> duration: N` と各 `.js` の `duration` を突き合わせた。

- `template`（19 枚）: 全 19 枚とも完全一致（±0 秒）
- `readme`（6 枚）: 全 6 枚とも完全一致（±0 秒）
- `user`（17 枚）: 全 17 枚とも完全一致（±0 秒。317 行目付近の
  `duration: 2` は本文中の説明文の一部でスライドの実データではないため
  比較対象から除外した）

2 秒以上ずれた枚は無し。**問題なし。**

## 4. 描画

`python3 -m http.server 8765` を起動し、Playwright（Chromium、1920x1080）で
確認した。

**判明した前提の誤り:** 依頼書にあった
`http://localhost:8765/player.html?slides=template&n=<番号>` の `n=` パラメータは
`player.html` には実装されていない（対応する query param は `slides`/`deck`
のみ。`grep -n "searchParams" player.html` で確認）。そのため最初に撮った
19 枚は全部同一のスクリーンショット（先頭スライド）になってしまった
（md5 一致で確認）。ページ内のグローバル関数 `renderSlide(index)` を
`page.evaluate` で直接呼び出す方式に切り替えて撮り直し、各スライドが
別々に描画されていることを md5 の相違で確認した。

撮影した 24 枚 + 追加 2 枚（後述）、計 26 枚:
- `template` 19 枚すべて
- `readme` の 1・3・5・6 枚目
- `user` の 10 枚目
- （追加）`user` の 5・11 枚目
  — `user.js` の diff で実際に文言が変わったスライドは「AI に作ってもらう」
  （コメント上 Slide 5）と「近い見た目をコピーする」（Slide 11）で、
  依頼にあった「10 枚目」（`render() の書き方`）は today の diff 変更対象
  ではなかった（型・テンプレートの語を含まない）。依頼どおり 10 枚目も
  撮ったが、変更箇所も併せて確認する方が確実と判断し 2 枚追加した。

全 26 枚を目視した結果:
- 文字が欠けている箇所は無し。
- 枠からはみ出している箇所は無し。
- 「テンプレート」の語が入った枚（表紙、数字を大きく見せる、時系列、
  手順（横並び）、Q&A、本文と脚注、README の 1 枚目、user の 5・11 枚目 等）
  も行があふれず収まっている。

**一致（問題なし）。** デザインの良し悪し・レイアウト寸法は評価していない。

スクリーンショットは `archives/agents/TODO-107/shot/` に保存した（26 枚）。
撮影に使った Playwright は `/tmp/verify064b/node_modules/playwright`
（既存の一時ディレクトリ）を借用した。本リポジトリには Playwright/puppeteer
は入っていない。

サーバーは `pgrep -fa "http.server 8765"` で PID (2904231) を確認してから
`kill` した。停止を確認済み。

## 5. git status

対象の 6 ファイル（README.md, docs/User.md, index.html, slides/readme.js,
slides/template.js, slides/user.js）と、未追跡の `archives/agents/TODO-107/`
以外に変更は無い。**問題なし。**

## 確かめられなかったこと・判断できないこと

- 依頼書の「`n=<番号>` で player.html を開く」という手順は、現状の
  `player.html` の実装と合っていない（そのパラメータを読む処理が無い）。
  実害は無い（`renderSlide()` 呼び出しで代替できた）が、依頼書側の記載が
  実装と食い違っている点は報告のみに留め、直していない。
- `user` の「10 枚目」という指定が、diff で実際に変わったスライド
  （5・11 枚目）と一致していない理由は分からない。数え方の勘違いか、
  意図的に「変更していない枚も無事か」を見る意図だったのか、こちらでは
  判断できない。
