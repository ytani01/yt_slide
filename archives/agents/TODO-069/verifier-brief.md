# TODO-069 verifier への依頼

## 目的

`slides/user.js` の巻末に足したアイコン一覧 3 枚（スライド 12〜14）が、
**実際に意図どおり描画されるか**を確かめる。名前の間違いは例外を出さず、
アイコンが消えるだけなので、必ず実測する。

## 対象

- `slides/user.js` の `ICON_GROUPS`、`iconTable()`、Slide 12〜14
- `docs/User.md` の「付録 アイコン名の例」の表

## 確かめること

1. **30 件のアイコンが全部描画されるか。**
   スライド 12〜14 を表示し、`#slide-canvas` の各 `<i class="fa-solid ...">` に
   ついて `getComputedStyle(el, '::before').content` を取る。
   クラス名が FontAwesome に無いと CSS の規則が当たらず `none` か `normal` に
   なる。**1 件ずつクラス名と `content` の値を出し、`none`/`normal` のものを
   報告する。** 見出しの `fa-icons` も対象（3 枚とも）。
   併せて `getComputedStyle(el).fontFamily` が
   `"Font Awesome 6 Free"` を含むことも見る。
2. **枠からはみ出さないか。** 3 枚それぞれで `#slide-canvas` の
   `scrollHeight - clientHeight` と `scrollWidth - clientWidth`、
   本文の外接矩形が canvas の矩形の内側か。
3. **2 箇所の一覧が一致するか。** `slides/user.js` の `ICON_GROUPS` と
   `docs/User.md` の付録の表を突き合わせ、**用途名・クラス名・並び順・件数**が
   同じか。食い違いだけ詳しく、一致したものは 1 行でよい。
4. **`duration` が書き戻されているか。** スライド 12〜14 の `duration` が
   それぞれ 8 / 8 / 12 になっているか（`tools/measure-duration.py` で実測済み）。
5. ブラウザのコンソールエラー・`pageerror` の件数。

## 手段

- リポジトリのルートで `python3 -m http.server <空きポート>` を立て、
  HTTP で配信する（**終わったら止める**）。`file://` では動かない。
- Playwright（chromium）で `player.html?slides=user` を 1920x1080 で開き、
  `page.evaluate` から `renderSlide(i, true)` を呼んで 12〜14 を順に出す。
  `archives/agents/TODO-063/measure.py` が同じことをやっているので**流用する**
  （新しく組み直さない）。
- スクリーンショットを 3 枚、`archives/agents/TODO-069/shots/slide-12.png`
  〜 `slide-14.png` に保存する。

## やらないこと

- **コードを直さない。** 見つけたことは報告だけ。直すかどうかは main が決める。
- 原因の切り分けや、境界線上の判断もしない。「実害は未確認」と添えて報告する。
- スライド 1〜11 の測り直しは不要。文面や言い回しの善し悪しも見なくてよい。

## 報告

`archives/agents/TODO-069/verifier-report.md` に書く。
**実測した値を必ず載せる**（値の無い「実測した」は実測と見なさない）。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
