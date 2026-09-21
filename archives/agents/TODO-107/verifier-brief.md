# TODO-107 verifier への依頼

## 目的

スライドの見本の呼び方を「型」から「テンプレート」に変えた。その置き換えが
漏れなく・誤りなく行われ、ナレーションを変えた枚の `duration` が実測と
合っていて、書き換えた枚が正しく描画されることを確かめる。

## 対象範囲

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
未コミットの差分（`git diff`）。対象ファイル:
`README.md`, `docs/User.md`, `index.html`,
`slides/readme.js`, `slides/template.js`, `slides/user.js`

`archives/` は対象外（現行仕様ではないので触っていない）。
`TODO.md` もまだ更新していない。

## 確かめること

1. **置き換え漏れ。**
   `grep -rn "型" README.md docs/*.md slides/*.js index.html` を走らせ、
   残っているものが次の 4 件だけであることを確かめる。
   それ以外が残っていたら報告する。
   - `slides/template.js` の「同じ定型が並ぶ」
   - `slides/claude-memo.js` の 3 件（Python の型・型検証。別の意味）

2. **誤った置き換え。** `git diff` の各行を読み、
   - 見本以外の意味の「型」を置き換えてしまっていないか
   - 「テンプレートの見本」のような重複した言い方が残っていないか
   - 日本語として不自然になっていないか
   を報告する。**直さない。**

3. **`duration` の測り直し。**
   `ytslide measure --slides template --all`、
   `ytslide measure --slides readme --all`、
   `ytslide measure --slides user --all` を `--write` なしで走らせ、
   出力の `-> duration: N` と、各 `.js` に書かれている `duration` が
   一致することを確かめる（測定はばらつくので ±1 秒は一致とみなし、
   2 秒以上ずれた枚だけ報告する）。Bash の timeout は 600000 を指定する。

4. **描画。** 書き換えた枚が player.html で崩れずに出ることを実際に見る。
   - `python3 -m http.server 8765` を `run_in_background` で立て、
     Playwright（`npx playwright` が入っていなければ `node` + puppeteer、
     どちらも無ければその旨を報告）で
     `http://localhost:8765/player.html?slides=template&n=<番号>` を
     1920x1080 で開き、19 枚すべてのスクリーンショットを
     `archives/agents/TODO-107/shot/` に撮る。
   - **見るのは「文字が欠けていないか」「枠からはみ出していないか」
     「『テンプレート』の語が表示に入った枚で行があふれていないか」。**
     デザインの良し悪しは評価しない。レイアウトの寸法も測り直さない。
   - `readme` の 1・3・5・6 枚目、`user` の 10 枚目も同じように撮って見る。
   - 一致したものは 1 行、食い違いだけ詳しく書く。
   - 終わったらサーバーの PID を `pgrep` で確かめてから kill する。

5. `git status` で、上の 6 ファイルと
   `archives/agents/TODO-107/` 以外が変わっていないことを確かめる。

## やらないこと

- **何も直さない。** 見つけたことは報告だけ。
- 境界線上の判断もしない。「実害は未確認」と添えて報告する。
- コミットしない。

## 報告

`archives/agents/TODO-107/verifier-report.md` に書く。
返事は 5 行以内（通ったか・報告ファイルのパス・判断が要る点）。
