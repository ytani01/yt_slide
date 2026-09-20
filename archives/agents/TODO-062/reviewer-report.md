# TODO-062 reviewer 報告

対象: `player.html`、`docs/User.md`、`slides/template.js`（新規）。
`TODO.md` の差分と `archives/` は対象外。

## 問題無しと確認できた観点（依頼の番号で）

1. **既存 4 本・全スライドの経路。** `node` の `vm` で 4 本を評価し、
   `slideData` の全要素（readme 10・user 11・developer 11・claude-memo 17、
   計 49 枚）が `typeof render === 'function'` であることを実測で確認した。
   `player.html:908` の分岐は `render` があれば必ずそれを呼ぶので、既存の
   経路・見た目は変わらない。
   （`TODO.md` は「45 枚」と書いているが実測は 49 枚だった。`TODO.md` は
   対象外の差分なのでここでは指摘に留める。実害は無い。）
2. **title/icon/body の欠落・空。** `player.html:911-916` を読み、
   `title` が空文字/`undefined` なら三項演算子で `heading` が `''` になり
   見出しが出ないこと、`icon` が無ければアイコン `<i>` が出ないことを
   コードで確認した。`node` で実際に文字列を組んで、決めた値
   （`font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]`、
   `clamp(1.4rem, 3.2cqw, 2.5rem)`、外枠 `flex flex-col h-full justify-center
   px-[3cqw]`、アイコン `fa-solid ${icon} text-lime-400`）と
   バイト単位で一致する出力になることを実測した。`TODO.md` の実測値と
   一字一句合っている。
3. 上記の実測で確認済み（2 と同じ）。
4. **`innerHTML` への直挿入。** `body` は `render()` と同じく、開発者が
   `slides/*.js` に書く文字列であり、既存の `render()` も同様に
   `innerHTML` へ生の文字列を渡している。危険が増えている点は無い。
6. **日本語の書き方。** `docs/User.md` の追加分・`player.html` の追加
   コメントを読んだ。造語や直訳調は無く、`docs/User.md` に TODO 番号も
   無い（`player.html` のコメントの `（TODO-062）` は implementer-task が
   明示的に許可した書き方）。
7. **`slides/template.js` と `docs/User.md` の一致。** キーの並び
   （`title`/`icon`/`duration`/`narration`/`body`）、`rules` を書かない点、
   `render()` を書かない点が両方で一致している。

## 検討（要修正ではないが報告する）

- **`player.html:917`: `slide.body` が `undefined` の場合、出力に文字列
  `"undefined"` がそのまま入る。** `render()` も `body` も無いスライドを
  渡すと `${heading}${slide.body}` が `undefined` を innerHTML に書き込む
  ことを `node` で実測した（`<div>undefined</div>` を確認）。決めたことは
  「`render()` が無ければ `body` を包む」であり、両方無いケースは
  `TODO.md`・依頼のどちらにも規定が無い。既存 4 本・`template.js` は
  全て `render` か `body` を持つため今回は実害無し。境界線上の判断（ガード
  を入れるべきか）は管理者判断とする。
- **`docs/Developer.md:58` が古いままになっている。** `slideData` の
  各要素を `{ title, duration, narration, render() }` とだけ書いており、
  今回追加した `body`/`icon` が載っていない。実装依頼で
  「`docs/Developer.md` も触らない」と明記されていたための意図的な除外
  だが、「対で保守すべきものの片方だけが変わった」状態になっている。
  実害は無い（`User.md` へ誘導する一文がある）が、放置すると
  `player.html` を直す開発者向けの説明が実態と食い違う。TODO-063 か
  別項目での更新を検討してよい。
- **implementer 報告の「`render()` の書き方」冒頭文を言い換えた、という
  記述はやや不正確。** `git diff docs/User.md` を見ると、既存の書き出し
  文はそのまま残っており、その手前に新しい 2 行が追加されただけ
  （置き換えではなく純粋な追加）。依頼どおり「今までどおり使える」も
  明記されており、元の意味が変わった箇所は無い。報告の書き方の問題で、
  実装そのものに問題は無い。

## 好みの範囲

- `player.html:908-909` の新しい分岐コメントは日本語だが、直前の
  `renderSlide()` 内の他コメントは英語（`Render main slide HTML` など）。
  ファイル全体では日本語コメントも既にあるため規約違反ではないが、
  すぐ近傍とは言語が揃っていない。
