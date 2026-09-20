# TODO-062. スライドの見出しと本文の枠を `player.html` に持たせる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + verifier + reviewer |
| 実施 | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 30,138 | 121,080 | 73% |
| reviewer | Sonnet 5 | high | 15,987 | 53,788 | 11% |
| verifier | Sonnet 5 | medium | 13,404 | 50,558 | 11% |
| implementer | Sonnet 5 | medium | 5,473 | 45,513 | 6% |
| 合計 |  |  | 65,002 | 270,939 | 概算 $4.8 |

- 3 担当とも定義のモデル（`sonnet`）のまま使い、上書きしていない。
  effort も定義ファイルの値（implementer と verifier は `medium`、
  reviewer は `high`）
- main の effort は記録に残らない。Opus 5 の既定は `high`
- 集計は `--since '2026-09-20 10:11:25'`（TODO-067 のコミット直後）で切った。
  立ててから着手するまでに TODO-060・066・067・068 を挟んだため、
  番号だけでは範囲を切れない

## きっかけ

スライド 1 枚ごとの見出しは `render()` の中に手書きされていた。
`slide.title` はコントロールバーと目次にしか使われておらず、画面に出る
見出しは 4 本のスライド一式それぞれで書き直されていた。
利用者が毎回書くのは「見出しの `h2` + アイコン + 本文のレイアウト」で、
`render()` の中を全部自分で書くのは負担が大きい。

## 決めたこと

着手前に既存 4 本・45 枚を実測してから決めた。ばらついていたのは
`mb-[1.0〜1.8cqw]` と `gap-[0.8/1.0cqw]` の微差だけで、外枠・文字色・
文字サイズはほぼ揃っていた。

- **`render()` は残す。定型は置き換えではなく追加。** `render()` を書いた
  スライドは今までどおり枠を外れる。見出しの無い全面スライド（タイトル、
  章の区切り、全面の図）はそちらで書く。既存の 4 本は変更しない
- **本文は `body` に文字列で渡す。** `render()` があればそちらが優先
- **見出しのアイコンは `icon` にクラス名だけ書く**（例 `'fa-list-check'`）。
  色・文字サイズ・余白は固定し、実測した最頻値に揃える:
  - 外枠 `flex flex-col h-full justify-center px-[3cqw]`（45/45 枚が同一）
  - 見出し `font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]`、
    `font-size: clamp(1.4rem, 3.2cqw, 2.5rem)`
  - アイコン `text-lime-400`（43/45 枚）
  - 色を変えたい警告系のスライドは `render()` で書く（既存 2 枚）
- **画面の見出しは常に `slide.title`。** 目次・コントロールバーと必ず揃う。
  別にしたい枚は `render()` で書く（既存では 45 枚中 8 枚が不一致だった）
- **`title` が空なら見出しを出さず、本文だけ枠で包む。**
- **`render()` も `body` も無いときはガードを入れない。** 画面に
  `undefined` と出る。両方無いのは書き間違いなので、空文字にして
  白いスライドにするより気づきやすい

## やったこと

- `player.html` の `renderSlide()` で、`render()` があればそれを呼び、
  無ければ `title` と `icon` から見出しを作って `body` を枠で包むようにした
- `slides/template.js` を新しく作り、`body` で書いた箇条書きのスライドを
  1 枚置いた（`player.html?slides=template` で見られる）。
  TODO-063 でここにパターンを足していく
- `docs/User.md` に「`body` だけで書く」の節と、キーの表に `body` / `icon`
  の行を足した。`render()` が今までどおり使えることも明記した
- `docs/Developer.md` の `slideData` の説明を、`body` / `icon` と
  分岐を含む形に直した

既存 4 本の `slides/*.js` は変更していない。

## 確かめたこと

Playwright（chromium）で 1920x1080 に描画して確かめた。
計測スクリプトは `archives/agents/TODO-062/shot.py` に残した。

- **既存 4 本の見た目が変わっていない。** 変更前の `player.html` を
  `git show HEAD:player.html` で取り出して同じスライドを撮り、
  readme の 1・2 枚目、claude-memo の 2 枚目、developer の 2 枚目を
  ピクセル比較して**完全一致**
- `?slides=template` が描画され、見出し・アイコン（lime）・本文とも
  崩れなし。左右の余白は実測 56.16px（1920px 幅の `3cqw` 相当。
  container の content-box が 1920px ちょうどでないための差で、
  既存の `render()` スライドでも同じクラスが同じ値になる）
- 分岐の端を一時ファイルで確認: `title` が空 → 見出しが出ず本文だけ、
  `icon` 省略 → アイコンが出ず見出しの文字が左端から、
  `render()` と `body` の併記 → `render()` が出る
- `tools/test_measure_duration.py`・`tools/test_make_video.py` とも通過
- `slides/template.js` の `duration` は `tools/measure-duration.py` の
  実測値と一致

## 分担の振り返り

- **reviewer が 3 件を拾った。** `render()` も `body` も無いときに
  `undefined` と出ること、`docs/Developer.md` の `slideData` の説明が
  古くなったこと、implementer の報告にあった「冒頭文を言い換えた」が
  実際には純粋な追加で報告が不正確だったこと。いずれも verifier の
  描画確認では出ない種類で、**reviewer を先に回した判断は効いた**
- **verifier はピクセル比較で「既存が変わっていない」を出した。**
  依頼文に「変更前の `player.html` を `git show` で取り出して比較する」
  まで書いたので、静的な読み合わせに逃げずに済んだ
- **見込みと食い違わなかった**が、implementer の取り分は 6% で、
  実装そのものは 15 行ほどだった。**分けた価値は実装ではなく、
  main の文脈に差分を読み込まずに済んだこと**にある
- **次に同じ規模（1 ファイルの小さな分岐 + 新規ファイル + 文書 2 つ）を
  やるなら、同じ 3 担当で組む。** 削るなら implementer で、main が直接
  書いても $0.3 しか変わらない。ただし reviewer と verifier は残す。
  main が 73% を占めるので、減らす余地があるのは依頼文の作り込みではなく
  **main が差分を読む量**のほう

分担の理由と各担当の報告は `archives/agents/TODO-062/` にある。
