# TODO-119 reviewer 報告

対象: `git diff`（作業ツリー）の `player.html`・`README.md`・`docs/Developer.md`。
実機・ブラウザでの実測はしていない（verifier の担当）。以下の「未確認」は
コードを読んだうえでの見立て。

要修正: 0 件 / 検討: 3 件 / 好みの範囲: 2 件

## 検討

### 1. `player.html:1548-1552` 要求が終わる前に抜けると、本物のフルスクリーンだけが残る

`requestFullscreen()` は非同期で、`document.fullscreenElement` が入るのは
`fullscreenchange` の時点。入った直後（要求の途中）に `setFullscreen(false)`
が呼ばれると、`!on && document.fullscreenElement` が偽なので
`exitFullscreen()` を呼ばない。そのあと要求が通ると、擬似はオフ・本物は
オンで食い違う。`fullscreenchange` のハンドラ（1556-1560 行）は
「本物が抜けた」側しか見ないので、この食い違いは直らない（Esc で抜けるまで
通常表示のレイアウトが全画面に出たまま）。

起こる経路: ボタンのダブルクリック・ダブルタップ、F キーの長押し
（keydown ハンドラは `e.repeat` を見ていないので、長押しで入り切りを
繰り返す。1617-1619 行）。F の長押しで入り切りが続くこと自体は変更前から
あるが、変更前はクラスの切り替えだけで食い違いようがなかった。

ループはしない（ハンドラが `setFullscreen(false)` を呼んでも、
`fullscreenElement` が空なので `exitFullscreen` を呼ばず、次の
`fullscreenchange` は起きない）。**実害は未確認。**

### 2. `player.html:10` `mobile-web-app-capable` の理由がコメントに無い・範囲の確認

コメント（8-9 行）は「iPhone の Safari は…」で 3 行をまとめているが、
`mobile-web-app-capable` は Android の Chrome 向けの名前で、iPhone には
関係しない。入れた理由が書かれていない（Chrome が
`apple-mobile-web-app-capable` だけだとコンソールに非推奨の警告を出すのを
抑えるため、なら、そう書く）。Android はもともと Fullscreen API で UI が
消えるので、manifest 無しでこの meta がホーム画面起動の見た目を変えるかは
**未確認**。TODO-119 の決定は「iPhone は meta」なので、Android 向けの行が
要るかを判断してほしい。

### 3. `README.md:33` 「iPad では消える」は iPadOS 16.4 以降に限る

TODO-119 の背景にあるとおり、iPad の Safari が接頭辞なしの
`requestFullscreen` を持つのは iPadOS 16.4 以降。それより前は
`document.documentElement.requestFullscreen` が無く擬似だけになる
（コードは `?.` で落ちずに済む）。README は無条件に「iPad では消える」と
読める。古い iPad を利用者に想定するかで書き分けが要るかどうか決まる。
`docs/Developer.md:296` の「API が無い環境（iPhone の Safari）」も同じ
（古い iPad も該当する）。

## 好みの範囲

### 4. `player.html:565` 操作ガイドの「暗幕がない場合は F または Escape」

Android では本物のフルスクリーンになったので、戻るジェスチャーでも抜けられる
（`fullscreenchange` 経由）。ガイドの出口の案内に足すかどうか。
`docs/Developer.md:330-332`（16:9 ちょうどの画面では暗幕からは抜けられない、
対応しない）も、Android では戻るジェスチャーという出口ができたことになる。
書き足さなくても誤りではない。

### 5. `player.html:1549` `requestFullscreen` が Promise を返さない古いブラウザ

`requestFullscreen?.()` は、メソッドが無ければ `.catch` まで含めて
短絡する（node で実測: `undefined` を返し例外なし）。メソッドがあって
`undefined` を返す実装（Chrome 71 未満・Firefox 64 未満）では
`.catch` で TypeError になる（node で同形を実測: `Cannot read properties of
undefined (reading 'catch')`）。クラスの切り替えは済んだあとなので擬似は
動き、コンソールにエラーが出るだけ。対象ブラウザとして考えなくてよいなら
このままでよい。

## 確認して問題が無かったもの（1 行ずつ）

- 入る（ボタン・F キー・どちらもユーザー操作内）→ クラスを付けてから要求。拒否されたら `catch` で擬似だけ残る。食い違いなし
- 抜ける（ボタン・F・暗幕のタップ）→ クラスを外して `exitFullscreen`。後から来る `fullscreenchange` は `is-fullscreen` が無いので何もしない。ループなし
- Esc（本物のフルスクリーン中）→ ブラウザが抜け、`fullscreenchange` で擬似も解除。keydown が届いても `setFullscreen(false)` は二度呼んで害がない
- Esc（擬似だけ）→ 既存の keydown の経路のまま
- API が無い iPhone → `fullscreenElement` が `undefined` でも両方の分岐が正しく動く（入る側は `?.` で短絡、抜ける側は呼ばない）
- `setupViewportScale` → クラスの変化を MutationObserver、画面サイズの変化を `resize` で拾うので、本物のフルスクリーンへの出入りでも再計算される。`capped` は `is-fullscreen` で判定しており変更の影響なし
- `body.fs-lock`・暗幕 → 狭い画面・タッチ画面だけの @media の中で、変更なし。PC で本物のフルスクリーンになっても掛からない（変更前の PC の擬似と同じ）
- 対象を `document.documentElement` にした理由（UA の `:not(:root):fullscreen` が幅・高さ 100% と `transform: none` を `!important` で入れる）は妥当で、文書の説明とも合う
- `apple-mobile-web-app-status-bar-style: black` → ステータスバーの下から描くので、`viewport-fit=cover` 無しのままで安全領域の扱いは要らない
- `docs/` と README に TODO 番号は入っていない（CLAUDE.md の決まりどおり）
- `src/`・`tests/` に fullscreen を触る箇所は無く、`ytslide video` の撮影には影響しない
- 文書の mermaid 図は実装と合っている

## 未確認のまま残るもの（verifier か実機で）

- iPhone でホーム画面から開いたとき、`<a href="index.html">` で一覧へ移ってもアプリ内に留まり、一覧から再びプレイヤーへ戻れるか（戻るボタンが無いため）
- iPhone のホーム画面起動（standalone）で、Web Speech API・音声の再生が Safari の中と同じく動くか
- 本物のフルスクリーン中に操作ガイド（`<dialog>`）を開いて Esc を押したとき、先にフルスクリーンが抜けるか、ガイドが閉じるか

## 作り込みすぎ

作り込みすぎ: なし（`mobile-web-app-capable` が要らない可能性は上の 2 に書いた）。
