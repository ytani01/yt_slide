# TODO-062 implementer 依頼

## 目的

スライド 1 枚ごとの見出しと本文の枠を `player.html` に持たせ、
利用者が `render()` を書かずに本文だけ（`body`）で 1 枚書けるようにする。

## 対象範囲（この 3 ファイルだけ）

1. `player.html`
2. `slides/template.js`（新規）
3. `docs/User.md`

**`slides/readme.js` / `user.js` / `developer.js` / `claude-memo.js` は
変更しない。** `CLAUDE.md`、`TODO.md`、`docs/Developer.md` も触らない。
コミットもしない（管理者が行う）。

## 1. `player.html`

`renderSlide()`（896 行あたり）の
`slideCanvas.innerHTML = slide.render();` を、`render()` があればそれを呼び、
無ければ `slide.title` から見出しを作って `slide.body` を枠で包む形にする。

クラスと寸法は既存 45 枚の実測から決めた値で、**変えないこと**:

- 外枠 `flex flex-col h-full justify-center px-[3cqw]`
- 見出し `font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]`、
  `style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);"`
- アイコンは `slide.icon` にクラス名だけ入る（例 `'fa-list-check'`）。
  `<i class="fa-solid ${slide.icon} text-lime-400"></i>` として見出しの先頭に置く。
  `icon` が無ければアイコンを出さない
- `slide.title` が空（または未定義）なら見出しごと出さず、本文だけ枠で包む

既存の書き方に合わせること:

- 定数の直書きを避ける既存の方針があるが、ここは HTML のクラス文字列なので
  そのままでよい
- コメントは既存と同じ密度で。経緯を書くなら `（TODO-062）` と番号で参照する

## 2. `slides/template.js`（新規）

`body` で書いた **1 枚だけ**のスライド一式を作る。
TODO-063 でここに 8〜10 種類のパターンを足すので、その 1 枚目になる形にする。

- `slidesConfig` は `title` と `heading` を書く（`rules` は不要）
- スライドは「箇条書き」パターン 1 枚。`title`、`icon`、`duration`、
  `narration`、`body` を持つ。`render()` は書かない
- `body` は本文だけ。外枠の `div` と `h2` は `player.html` が付けるので
  **書かない**
- 冒頭に 1〜2 行のコメント（何のファイルか、`player.html?slides=template`
  で見られること）
- `duration` は `tools/measure-duration.py --slides template --all --write`
  で実測して入れる。前提パッケージが無くて動かない場合は、
  仮の値を入れたうえで**報告にその旨を必ず書く**

## 3. `docs/User.md`

`body` / `icon` の書き方を足す。

- キーの表に `body` と `icon` の行を足す（`render()` の行は残す）
- 「`render()` の書き方」の**手前**に、`body` で書く形を短く説明する節を作る。
  `render()` があればそちらが優先されること、`title` が空なら見出しが
  出ないこと、`slides/template.js` を見ればよいことを書く
- **`render()` は今までどおり使える**と明記する（置き換えではなく追加）
- 日本語の書き方は `~/.claude/CLAUDE.md` の規約に従う。
  `docs/` は利用者向けなので **TODO 番号を書かない**

## 完了条件

- 上の 3 ファイルの変更が済んでいる
- `node --check` に相当する確認として、`node -e` で `slides/template.js` を
  読んで `slideData[0].body` が文字列であることを確かめた
- 既存 4 本の `slides/*.js` に差分が無い（`git status` で確認）

## 報告

`archives/agents/TODO-062/implementer-report.md` に書く。
変更点、確かめた内容とその結果、残る懸念に絞る。
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
