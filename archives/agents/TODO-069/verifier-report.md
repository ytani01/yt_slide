# TODO-069 verifier 報告

## 手段

- リポジトリルートで `python3 -m http.server 8792` を起動、終了後に停止済み（確認済み）。
- Playwright（chromium、1920x1080）で `player.html?slides=user` を開き、
  `page.evaluate` から `renderSlide(11/12/13, true)` を順に呼んでスライド 12〜14 を表示。
  `archives/agents/TODO-063/measure.py` を流用し、アイコンの `::before` の `content` と
  `fontFamily` を取る処理を足した。
  スクリプトは `/tmp/claude-649/.../scratchpad/measure069.py`（セッション限りの一時領域。
  必要なら本文の値で再現できるので、archives には正式版としては置いていない）。
- スクリーンショットは `archives/agents/TODO-069/shots/slide-12.png` 〜 `slide-14.png` に保存済み。

## 1. 30 件 + 見出し 3 件のアイコンが全部描画されるか

**全 33 件（見出し `fa-icons` 3 件 + 本文アイコン 30 件）すべて `content` が
非空、`fontFamily` に `"Font Awesome 6 Free"` を含んでいた。** `none`/`normal` は 0 件。

実測値（`content` は Unicode 私用領域の文字。ターミナルでは空白に見えるがコードポイントは
入っている。`repr()` で確認済み）:

スライド 12（アイコン名の例 1）: 見出し `fa-icons` → `content='""'`
| クラス名 | content |
|---|---|
| fa-list-check | "" |
| fa-list-ol | "" |
| fa-table-list | "" |
| fa-triangle-exclamation | "" |
| fa-circle-exclamation | "" |
| fa-ban | "" |
| fa-circle-info | "" |
| fa-flag-checkered | "" |
| fa-arrow-right | "" |
| fa-circle-check | "" |

スライド 13（アイコン名の例 2）: 見出し `fa-icons` → `content='""'`
| クラス名 | content |
|---|---|
| fa-code | "" |
| fa-terminal | "" |
| fa-file-code | "" |
| fa-folder-open | "" |
| fa-file-lines | "" |
| fa-book | "" |
| fa-clock | "" |
| fa-stopwatch | "" |
| fa-gauge-high | "" |
| fa-chart-simple | "" |

スライド 14（アイコン名の例 3）: 見出し `fa-icons` → `content='""'`
| クラス名 | content |
|---|---|
| fa-users | "" |
| fa-comments | "" |
| fa-robot | "" |
| fa-diagram-project | "" |
| fa-table | "" |
| fa-gear | "" |
| fa-sliders | "" |
| fa-lightbulb | "" |
| fa-star | "" |
| fa-wand-magic-sparkles | "" |

いずれも `fontFamily` は `"Font Awesome 6 Free"`（3 枚とも全アイコンで確認）。

### 補足: 計測スクリプトの不具合に気づいて直した点

最初 `canvas.querySelectorAll('.grid i')`（`canvas` = `#slide-canvas`）で本文アイコンを
数えたところ、各スライドで 11 件（本来 10 件のはずが 1 件多い）になった。
調べると、`.grid i` という CSS セレクタは「`i` の祖先のどこかに `class="grid"` を持つ
要素があればよい」という意味で、`#slide-canvas` の**外側**にあるページ全体レイアウトの
`<div class="grid grid-cols-1 lg:grid-cols-4 ...">` も祖先に含まれてしまい、見出しの
`fa-icons` アイコンまで誤って本文アイコンとして数えていた。
`document.querySelectorAll('#slide-canvas .grid-cols-3 i')` の形（`#slide-canvas` を
起点にした完全なセレクタ）に直したところ、各スライドとも本文 10 件・見出し 1 件の
計 11 件で辻褄が合った。**これは計測側の誤りで、`slides/user.js` 側の問題ではない。**

## 2. 枠からはみ出さないか

3 枚とも `scrollHeight - clientHeight = 0`、`scrollWidth - clientWidth = 0`。
本文の外接矩形は canvas の矩形の内側（誤差 0.5px 未満で確認）。

| スライド | canvasRect | contentBounds | 内側か |
|---|---|---|---|
| 12 | left371.52 top153.24 right1234.48 bottom579.13 | left371.52 top157.22 right1234.48 bottom575.15 | はい |
| 13 | left371.52 top153.24 right1234.48 bottom579.13 | left371.52 top157.22 right1234.48 bottom575.15 | はい |
| 14 | left371.96 top153.46 right1234.04 bottom578.91 | left371.96 top157.44 right1234.04 bottom574.94 | はい |

## 3. `slides/user.js` の `ICON_GROUPS` と `docs/User.md` 付録の表の一致

用途名・クラス名・並び順・件数、すべて一致（9 グループ、計 30 件）。差分なし。

## 4. `duration` が書き戻されているか

`slideData` から直接取得: スライド 12 → `duration: 8`、13 → `8`、14 → `12`。
依頼どおり（`tools/measure-duration.py` の実測値と一致）。

## 5. コンソールエラー・pageerror

`console` の `error` タイプ、`pageerror` ともに **0 件**。

## 変更ファイルと指示の範囲

`git status --porcelain`:
```
 M docs/User.md
 M slides/user.js
?? archives/agents/TODO-069/
```
`git diff --stat`:
```
 docs/User.md   | 35 ++++++++++++++++++++++++++++++++++
 slides/user.js | 59 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 94 insertions(+)
```
依頼の対象範囲（`slides/user.js` の `ICON_GROUPS`・`iconTable()`・Slide 12〜14、
`docs/User.md` の付録）と一致。範囲外のファイルの変更なし。

## 確かめられなかったこと・判断できないこと

- **画面のスクリーンショットは目視で細部まで確認していない。** `content` の
  コードポイントと `fontFamily` は実測したが、アイコンの見た目（形が正しいか）は
  ファイルとして保存しただけで、目視レビューは行っていない。必要なら添付する。
- 文面や言い回しの善し悪しは依頼どおり見ていない。
- スライド 1〜11 は依頼どおり測り直していない。
