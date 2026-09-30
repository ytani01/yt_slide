# TODO-118 reviewer 報告

対象: `git diff -- player.html`（keydown ハンドラ、1567〜1570 行）。

## 要修正

### player.html:545 操作ガイドの説明文が新しい挙動と合わない

- 問題: `<p>Space・矢印・Home・End・F・M は、ボタンや選択欄、チャプター一覧の検索欄を操作していないときに使えます。</p>`
  が残っている。変更後はボタンにフォーカスがあっても矢印・Home・End・F・M は効き、
  ボタン上で効かないのは Space だけ。
- 根拠: 差分の 1569〜1570 行と、下の実測（`#next-btn` 上の → で進む、`#fullscreen-btn` 上の F で切り替わる）。
  利用者に見せる文言なので、変更と同じ項目で直すもの。

## 検討

なし。

## 好みの範囲

### player.html:1570 Space の判定が 2 回書かれている

- `(e.key === ' ' || e.code === 'Space') && e.target.closest('button')` と、直後の
  Space 分岐の条件が同じ。Space 分岐の先頭に `if (e.target.closest('button')) return;`
  を置けば判定は 1 回で済む。行数は変わらないので、どちらでもよい。

## 観点ごとの結果

- 分岐の意味: 要件どおり。入力欄は全キー譲る、ボタンは Space だけ譲る、`a` は止めない、
  Escape とモーダル中（`guide.open`）の扱いは差分の外で変わっていない。
- 以前は止まっていて今は動く組み合わせ（Playwright / chromium、1280×800、`?slides=readme` で実測）:
  - `#next-btn` + → : currentIndex 0→1、1 回だけ進む
  - `#fullscreen-btn` + F : 擬似フルスクリーンに入る（二重に切り替わらない）。続く Escape で解除
  - `#last-btn` + Home : currentIndex 0、scrollY 0（ページのスクロールは起きない。preventDefault が効く）
  - ヘッダーの `a`（index.html へ）+ Space : isPlaying false→true、遷移しない
  - F・M・矢印・Home・End はボタンの既定動作（Space・Enter でのクリック）を起こさないので、二重に動く経路は無い
- 以前どおり譲るもの（実測）: `#play-btn` + Space は 1 回押すごとに 1 回だけ切り替わる（false→true→false）。
  `#next-btn` + Enter はボタンのクリックとして 1 回進む（1→2）。
- ボタン以外のフォーカス可能要素: player.html の `a` はヘッダーの一覧リンクと、読み込み失敗時の「一覧へ戻る」
  （このときはハンドラが登録される前に throw するので関係なし）。スライド本文のリンク
  （readme・users-guide・template の `<a ... target="_blank">`）は Space で再生切り替えになるが、Enter は
  プレイヤーが扱わないので開ける。チャプター一覧の項目は `button` なので Space・Enter で選べる。
  `select` 3 つと検索欄は従来どおり全キー譲る。奪われて困るものは見つからなかった。
  スライド本文のリンク上の Space は実測していない（ヘッダーの `a` と同じ経路を通る）。
- TODO-076 で守ったもの: 「ボタンの Space が再生に化けない」「モーダル中は抑止」「Escape はボタン上でも
  フルスクリーンを抜ける」の 3 つとも保たれている。操作ガイドボタンの Space・Enter で開く経路も
  ボタンの既定動作のまま。
- 実測で分かっている罠（CLAUDE.md / docs/Developer.md）: 該当なし。
- docs/UsersGuide.md・docs/Developer.md: 直すべき記述なし（642 行の「検索欄では Space や矢印が渡らない」は今も正しい）。
- テスト: player.html には自動テストが無く、tests/ は ytslide 側だけ。確認は verifier の実測に任せる形で足りる。
- コメント: 「なぜ」（リンクはフォーカスが残っても止めない、TODO-118）が書いてある。問題なし。
- 範囲: player.html の変更は keydown ハンドラの 4 行だけ。指示外の変更なし。
- TODO.md: 箇条書きは「Space・Enter だけブラウザに任せ」、実装は Space だけ return。Enter はプレイヤーが
  扱わないので結果は同じ（実測で確認）。食い違いではないが、文言を合わせるかは管理者の判断。

## 作り込みすぎ

作り込みすぎ: なし（上の「好みの範囲」の 1 件は行数が減らない）。

## 範囲外（1 行だけ）

- 修飾キーを見ていないため、Alt+← （ブラウザの「戻る」）や Ctrl+F も奪う。これまでは body 上だけだったのが、
  ボタン・リンク上にも広がった。実害は未確認。

## 2 回目

対象: 545 行の文の書き直しと、keydown の先頭に足した修飾キーの return（1561〜1562 行）の 2 点だけ。

要修正: なし。検討: なし。

### 修飾キーの return で効かなくなるもの

Playwright / chromium、1280×800、`?slides=readme` で実測した。

- Ctrl+Escape（Alt・Meta も同じ経路）で擬似フルスクリーンが解除されなくなった。
  実測: F で入る → Control+Escape では入ったまま → Escape だけで解除。
  修飾キーを付けずに Escape を押せば抜けられるので、困る操作ではないと見る。好みの範囲。
- Ctrl+→ で進まなくなった（実測: idx 0 のまま。→ だけなら 1 へ進む）。要件どおりで、
  ブラウザの操作（単語の移動、Alt+← の「戻る」、Mac の Cmd+← など）に譲られる。
- Shift+F は今までどおり擬似フルスクリーンに入る（実測）。
- Windows の AltGr は ctrlKey と altKey が両方立つが、プレイヤーが扱うキー（Space・矢印・Home・End・F・M）を
  AltGr で入力する配列は知られていないので影響は無いと見る。未確認。
- Chromebook の Search+← （Home 相当）などで metaKey が立ったまま届くと Home/End が効かなくなる。未確認。

### 545 行の文

新しい挙動（ボタンの上で効かないのは Space だけ。Space はボタンを押す操作になる）と合っている。
矢印などの説明で選択欄と検索欄だけを挙げているのも、入力欄はすべてのキーを任せるという実装と合う。

### 好みの範囲（1 行）

- player.html:1559 の「ボタンの Space を再生操作で奪わない。」は、`guide.open` の行に付いたまま残っている
  （差分より前からある）。同じ内容が 1567〜1568 行のコメントにもあるので、消してよい。

作り込みすぎ: なし。
