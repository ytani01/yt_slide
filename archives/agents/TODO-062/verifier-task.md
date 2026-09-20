# TODO-062 verifier 依頼

## 目的

TODO-062 の実装が指示どおりか、**ブラウザで実際に描画して**確かめる。
**修正はしない。** 見つけたことは報告だけする。境界線上の判断もしない
（「実害は未確認」と添えて報告する）。

## 前提

`render()` を書かずに本文だけ（`body`）でスライドを書けるようにした。
`render()` があればそちらが優先。決めたことの全文は `TODO.md` の
TODO-062 の節にある。**まずそれを読むこと。**

変更したファイル: `player.html`、`docs/User.md`、`docs/Developer.md`、
`slides/template.js`（新規）。

## 測り方

Playwright（Python, chromium）を使う。`tools/make-video.py` の `FIT` が
操作系を隠して 1920x1080 で撮る手順になっているので、**それを流用する**。
計測用のスクリプトは 1 本だけ作り、
`archives/agents/TODO-062/shot.py` に残すこと。

`file://` で `player.html?slides=<名前>` を開く。

## 確かめること

### 1. 既存 4 本の見た目が変わっていないこと（最重要）

`git show HEAD:player.html > player-head.html` でリポジトリのルートに
変更前の `player.html` を置き、**変更前・変更後の両方**で同じスライドを
撮って**ピクセル単位で比較**する（PNG のバイト比較でよい。
差が出たら差分画像を出す）。

対象は 4 枚:

- `?slides=readme` の 1 枚目（`render()` の全面スライド）
- `?slides=readme` の 2 枚目（`render()` の見出し付きスライド）
- `?slides=claude-memo` の 2 枚目
- `?slides=developer` の 2 枚目

**期待は完全一致。** 終わったら `\rm player-head.html` で消すこと
（`rm` は `-i` にエイリアスされているので必ずバックスラッシュを付ける）。

### 2. `slides/template.js` が描けること

`?slides=template` の 1 枚目を 1920x1080 で撮る。次を**実測値で**報告する:

- 見出しが出ているか。文字列が `slide.title` と一致するか
- アイコンが出ているか。色が lime（`text-lime-400`）か
- 本文が枠の中に収まっているか（はみ出し・見切れが無いか）
- 左右の余白が `px-[3cqw]` 相当か（`getBoundingClientRect()` で測った
  実際の px 値を書くこと。1920px 幅なら 3cqw ≒ 57.6px）

### 3. 分岐の端（一時ファイルで確かめ、終わったら消す）

`slides/_verify.js` を一時的に作り、次の 3 枚を確かめる。
**確認が終わったら `\rm slides/_verify.js` で必ず消すこと。**

- `title` を空文字にした 1 枚 → 見出しが出ず、本文だけが枠に収まるか
- `icon` を省いた 1 枚 → アイコンが出ず、見出しの文字が左端から始まるか
- `render()` と `body` の両方を書いた 1 枚 → `render()` の側が出るか

### 4. `duration` と既存のテスト

- `tools/measure-duration.py --slides template --all` を実行し、出た値と
  `slides/template.js` に書いてある `duration` がずれていないか報告する
  （**書き換えない**。`--write` を付けない）。前提パッケージが無くて
  動かない場合は、その旨を報告する
- `tools/test_measure_duration.py` と `tools/test_make_video.py` を実行し、
  結果をそのまま報告する

### 5. 文書が実装と合っているか

`docs/User.md` の「`body` だけで書く」節と `docs/Developer.md` の
`slideData` の説明を読み、**書いてあるとおりに書いて動くか**を
上の確認結果と突き合わせる。食い違いだけ報告する。

## やらなくてよいこと

- コードの読み合わせだけで済ませること（**必ず実際に描画して測る**）
- 既存 4 本のレイアウトの測り直し（1 のピクセル比較で足りる）
- スマホ幅・フルスクリーン・読み上げの確認

## 画像

撮った PNG は `~/tmp/playwright-mcp/` に内容の分かる名前で保存し、
**報告にファイル名を列挙する**（管理者が利用者に見せる）。

## 報告

`archives/agents/TODO-062/verifier-report.md` に書く。
**一致したもの・問題が無かったものは 1 行ずつ、食い違いだけ詳しく書く。**
「実測した」と書くときは、必ず測った値を載せること。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
