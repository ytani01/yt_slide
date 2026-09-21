# TODO-104 verifier 報告

対象: `git diff -- player.html`（`#slide-canvas { font-size: clamp(1.0rem, 2.2cqw, 1.6rem); }` を追加する 8 行のみ）。

## 検証方法

- `player.html?slides=<deck>` は `slides/${name}.js` を `document.write` で
  読み込む仕組み。`file://` では fetch できないため、変更前（`git show
  HEAD:player.html`）と変更後（作業ツリーの `player.html`）をそれぞれ
  `slides/`・`docs/` ごとコピーし、`python3 -m http.server` で
  `127.0.0.1:8801`（after）・`127.0.0.1:8802`（before）に配信した。
- 計測は Playwright（node、chromium、
  `/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright`）。
- `player.html` に `?index=` のようなスライド番号指定は無いため、
  `page.evaluate(() => renderSlide(idx, true))` を直接呼んで各スライドへ
  切り替えた（グローバル関数として公開されている）。
- 使ったスクリプトと生データは `archives/agents/TODO-104/` に置いた
  （`check1_fontsize.js`／`check2_mobile.js`／`check3_widths.js`／
  `shot_compare.js`／`noise_check.js`、結果 JSON、`sample.js`）。
  検証後、http server は停止済み。

## 1. 既存スライド 5 本（69 スライド）の `#slide-canvas` 配下の computed font-size

`claude-memo`(17)・`developer`(11)・`readme`(6)・`template`(19)・`user`(16) の
計 69 スライド、各スライドの `#slide-canvas` 配下の**全要素**の
`getComputedStyle().fontSize` を、viewport 1280x800 と 390x844 の両方で
変更前後を突き合わせた。

**結果: 0 件ではなかった。325 個の要素インスタンスで値が変わった。**
すべて `16px → 19.096px`（1280x800）/ `16px → 20.02px`（390x844）の
一方向の変化で、タグは `DIV`(309)・`A`(4)・`LI`(3)・`SPAN`(3)・`IMG`(2)・
`UL`(1)・`BLOCKQUOTE`(1)・`ASIDE`(1)・`FIGURE`(1)。**`<p>` は 1 件も
含まれていない**（依頼にあった「`<p>` 55 個は明示指定なので効かないはず」
はそのとおりだった）。

内訳は `deck`: `template` 100、`user` 88、`claude-memo` 80、`developer` 37、
`readme` 20（`out1_fontsize_1280x800.json` に全件）。

見た目への影響を、代表として `template` スライド 2（UL/LI が対象）・
スライド 5（SPAN が対象）・`readme` スライド 4（A が対象）で
スクリーンショットの画素差分（PIL、RGB 絶対差）で確かめた。

```
              bbox                         max  mean    diff>10 の画素数
template-s1   (77,197,1235,499)             57  0.200   11906
template-s4   (63,197,1235,481)            106  0.446   13947
readme-s3     (77,197,1235,487)            154  0.994   30078
```

これだけでは「変更のせいで見た目が動いた」のか「元々そのくらいは揺れる」
のか分からないので、**同一ページ（変更前）を 2 回読み込んで撮った
スクリーンショット同士**でも同じ差分を取った（`noise_check.js`）。

```
              bbox                         max  mean    diff>10 の画素数
noise(before同士) (78,197,1235,485)        109  0.385   17268
```

変更前後の差分は、変更前どうしの読み込み揺れ（フォントの subpixel
antialiasing 由来と見られる）と同程度の大きさで、それを超えていない。
対象になった要素はいずれも余白・線幅を `cqw` で指定しており `em` 依存では
なく、テキストノードを直接持つ要素も無かった（テキストは子の `<p>`/`<span
style="font-size:...">` などで別途明示されている）ため、目視でも
before/after のスクリーンショットは区別できなかった。

→ **computed font-size 自体は 325 件で変わっているが、実測した範囲では
画面上の見た目に区別できる変化は確認できなかった。** これが「見た目が
変わっていない」と言えるかどうかは、私の判断の範囲を超えるので報告に
留める。

## 2. 装飾なしの `body` がスマホ幅（390x844）で読めるようになったか

`docs/User.md` の「## 最小の例」のコードをそのまま
`slides/sample.js`（作業用コピー）として保存し、`?slides=sample` を
390x844・`deviceScaleFactor:2`・`isMobile:true`・`hasTouch:true` で開いた。

```
              #slide-canvas   <p> の         <p> の             player-viewport
              font-size       font-size      getBoundingClientRect          の transform
before        16px            16px           w316.5 h8.88px     scale(0.372917)
after         20.02px         20.02px        w316.1 h11.09px    scale(0.372917)
```

`getBoundingClientRect()` は transform 適用後（画面に実際に出る大きさ）の
値なので、変更前は文字の実高さが画面上で約 8.9px、変更後は約 11.1px
（比率はほぼ font-size の比率 16→20.02 と一致、line-height 分だけ実文字の
x-height はさらに小さい）。

スクリーンショット（`~/tmp/playwright-mcp/todo104-sample-before.png` /
`-after.png`）とその拡大切り出し（`-before-zoom.png` / `-after-zoom.png`）
を目で見た。等倍のスクリーンショットでは before/after ともに文字は
小さく、パッと見の違いは大きくない。拡大切り出しでは「本文はここに書く」
の文字が after の方が明確に大きいのが分かり、before は判読ぎりぎりの
大きさ、after はそれよりゆとりがある、という見え方だった。**「読める
ようになった」と言えるかは主観の判断を含むので、測った数値と画像を
報告に留める。**

## 3. 下限 `1.0rem` が効く帯で 16px を下回らないか

マウス想定（`isMobile:false`・`hasTouch:false`）で window 幅 760〜1300px
を 10px 刻み＋ 767/768/1023/1024/1280px を追加して、`#slide-canvas` の
computed font-size を測った（59 点、`out3_widths.json`）。

- 最小値: **16px ちょうど**（幅 768px・1024px の 2 点）
- 16px を下回った幅は **0 件**
- 767px: 20.02px、768px: 16px、1023px: 20.35px、1024px: 16px、
  1280px: 19.096px

768px・1024px の直後に下限へ張り付くこと自体は依頼で「既知」とされている
挙動で、今回はそこでも 16px 未満にはならないことを確認した。

（参考）`archives/agents/TODO-104/reviewer-report.md` によれば、reviewer は
`clamp(0.95rem, ...)`（15.2px 相当）の版でこの帯が下限に落ちることを
実測で指摘しており、現在の diff は下限を `1.0rem` に変えて締めている。
今回の実測はその変更後の値で、下限割れが解消されていることと符合する。

## 変更ファイルの確認

`git status` では `player.html` のみが変更されている（追跡外は
`archives/agents/TODO-104/` だけ）。`git diff` も TODO-104 の依頼どおり
`#slide-canvas` へのルール追加 8 行のみで、それ以外の差分は無い。
依頼の範囲と一致している。

## 確かめられなかったこと・判断できないこと

- 「見た目が変わっていないと言えるか」（1 番）と「読めるようになったと
  言えるか」（2 番）は、測った数値・画素差分・スクリーンショットは
  報告したが、**良し悪しの最終判断はしていない**（依頼どおり、判断は
  管理者に委ねる）。
- スクリーンショットの画素差分の「ノイズ相当」という比較は 1 ページ
  ぶんのサンプル（`noise_check.js` で `readme` スライド 4 のみ）でしか
  取っていない。他のスライドでも同水準か、網羅的には確かめていない。
- 実機（本物のスマホ）では見ていない。すべて Playwright の
  エミュレーションでの計測。
