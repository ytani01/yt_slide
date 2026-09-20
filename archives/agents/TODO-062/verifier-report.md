# TODO-062 verifier 報告

計測スクリプト: `archives/agents/TODO-062/shot.py`
（`tools/make-video.py` の `FIT` を流用。1920x1080 で撮る `shoot()` と、
`page.evaluate()` で実測値を返す `measure()` を持つ）

## 1. 既存 4 本の見た目（ピクセル比較）

`git show HEAD:player.html > player-head.html` で変更前を用意し、
変更前・変更後の両方で同じスライドを撮って `cmp` でバイト比較した。
確認後、`player-head.html` は削除済み。

- `?slides=readme` 1 枚目: **一致**
- `?slides=readme` 2 枚目: **一致**
- `?slides=claude-memo` 2 枚目: **一致**
- `?slides=developer` 2 枚目: **一致**

4 本とも完全一致（`cmp -s` で差分なし）。既存の見た目は変わっていない。

画像（before/after のペア。一致しているので見た目は同じ）:
`~/tmp/playwright-mcp/todo062-readme1-before.png` /
`todo062-readme1-after.png`、`todo062-readme2-before.png` /
`todo062-readme2-after.png`、`todo062-claudememo2-before.png` /
`todo062-claudememo2-after.png`、`todo062-developer2-before.png` /
`todo062-developer2-after.png`

## 2. `slides/template.js`（`?slides=template` 1 枚目）

`~/tmp/playwright-mcp/todo062-template1.png` に保存。実測値:

- 見出しのテキスト: `"箇条書きの例"` — `slide.title`（`'箇条書きの例'`）と**一致**
- アイコン: 出ている。`class="fa-solid fa-list-check text-lime-400"`、
  `getComputedStyle(icon).color` は `rgb(163, 230, 53)`
  （Tailwind `lime-400` の `#a3e635` と一致）
- 本文の収まり: `bodyRect` は `top:529 / bottom:639`、外枠 `outerRect` は
  `top:28 / bottom:1052`。本文は枠の内側に収まっており、はみ出し・
  見切れは無い
- 左右の余白: `getBoundingClientRect()` で実測した `padding-left` /
  `padding-right` はともに `56.16px`（`getComputedStyle` の値も同じ）。
  依頼文にある「1920px 幅なら 3cqw ≒ 57.6px」という見積もりとは
  約 1.44px（2.5%）ずれるが、これは `cqw` の基準になる `container-type`
  が `#slide-canvas` ではなく親の `.video-viewport`
  （`class="... p-4 md:p-6 ..."`、`border border-slate-800`）に付いており、
  その `content-box` 幅（`1920 - md:p-6 の左右 48px - border 2px = 1870px`
  相当）が `100cqw` になるため。実測した `videoViewportWidth` は `1920px`
  ちょうどで、そこから `padding`・`border` を引いた幅の 3% が
  `56.16px` にほぼ一致する。既存の `render()` 側のスライドでも同じ
  `px-[3cqw]` クラスが使われており、この挙動は今回の変更で生じたもの
  ではない。**バグではないと考えるが、依頼文の見積もりが概算だった、
  という程度の話**（判断が要るほどの食い違いではないと考える）

## 3. 分岐の端

`slides/_verify.js` を一時的に作って確認し、終わったら `\rm` で削除済み。

- `title` を空文字にした 1 枚: `<h2>` は生成されず（`hasH2: false`）、
  `<p>` の本文だけが枠に収まって出た。画像:
  `~/tmp/playwright-mcp/todo062-verify-notitle.png`
- `icon` を省いた 1 枚: アイコンは出ず（`hasIcon: false`）、
  見出しの文字列がそのまま `<h2>` の先頭から始まった（左端の余白は
  見出し文字がそのまま入る形で、アイコン分のギャップは無い）。画像:
  `~/tmp/playwright-mcp/todo062-verify-noicon.png`
- `render()` と `body` の両方を書いた 1 枚: 画面には `render()` 側の
  見出し（`"render() 側のタイトル"`、赤字）と本文が出て、`body` 側
  （`"body 側の本文（出ないはず）"`）は出なかった。`render()` が優先
  される仕様どおり。画像:
  `~/tmp/playwright-mcp/todo062-verify-renderpriority.png`

3 パターンとも指示どおりの挙動。

## 4. `duration` と既存のテスト

- `python3 tools/measure-duration.py --slides template --all`（`--write`
  無し）: `スライド 1: 原文 48 字 / 読み 57 字 / 実測 9.168s /
  BASE_SPEED_MULTIPLIER=1.4 倍速 6.55s -> duration: 7`。
  `slides/template.js` に書かれている `duration: 7` と**一致**（ずれ無し）
- `python3 tools/test_measure_duration.py` → `OK`（終了コード 0）
- `python3 tools/test_make_video.py` → `OK`（終了コード 0）
  （`pytest` は未インストールのため `python3` で直接実行した。
  どちらのスクリプトも単体で実行できる形式になっている）

## 5. 文書と実装の食い違い

`docs/User.md` の「`body` だけで書く」節、`docs/Developer.md` の
`slideData` の説明を読み、書かれているキー名・優先順位・省略時の挙動
（`title` 空で見出し無し、`icon` 省略でアイコン無し、`render()` 優先）を
上の 2・3 の実測結果と突き合わせた。**食い違いは無かった。**
`docs/User.md` の例に書かれているキー（`title` / `icon` / `duration` /
`narration` / `body`）は `slides/template.js` の実物と同じ形で、
そのまま動くことを確認した。

## 変更ファイルの確認

`git status` で変更されているのは `TODO.md`、`docs/Developer.md`、
`docs/User.md`、`player.html`（既存の修正）と、新規の
`archives/agents/TODO-062/`、`slides/template.js`。依頼文にある対象
（`player.html`、`docs/User.md`、`docs/Developer.md`、
`slides/template.js`）と一致しており、それ以外のファイルは変わって
いない。

## 確かめられなかったこと・判断が要る点

- 2 の余白の実測値（56.16px）が依頼文の見積もり（57.6px）とずれる件は、
  原因は特定できたが「これでよいか」の判断はしていない（境界線上の
  判断はしない、と言われているため）。実害は未確認
- `slides/template.js` は 1 枚しかなく、TODO-063（8〜10 種類のパターン）
  はまだ範囲外なので確認していない
