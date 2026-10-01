# TODO-126 reviewer 報告

対象: `git diff player.html`（`formatSlideNum()` の追加と、2 か所の `padStart(2, '0')` の置き換え）

## 要修正

なし。

## 検討

なし。

## 好みの範囲

- `player.html:435` / 初期 HTML の `<span id="slide-num">01</span>` が 2 桁のまま残っている /
  `startApp()` の `renderSlide()` がすぐ上書きするので、表示に出るのは JS が走る前だけ。
  9 枚以下のスライドで一瞬「01」が出るかどうかは未確認（実害は未確認）。空にするか
  `1` にすれば新しい規則と揃う。

## 問題なしの観点

- `slideData` の確定: `slides/<名前>.js` は `document.write` で再生エンジンより前に同期で読まれ
  （`player.html:662`）、未定義なら `player.html:668` で止まる。`slideData` は各 `slides/*.js` で
  `const` 宣言され、ページ内で再代入・差し替えする経路は無い（スライド一式の切り替えは
  `?slides=` でのページ遷移のみ）。呼び出し元の `renderSlide()` と `initPlaylist()` は
  どちらも `startApp()` 以降なので、呼ばれる時点で必ず確定している。
- 0 枚のとき: `String(0).length` は 1 で例外にならず、`renderSlide()` は範囲外で早期 return する。
- 取りこぼし: `rg -n "currentIndex \+ 1|idx \+ 1|slide-num" player.html src docs` の残りは
  `renderSlide` の引数（`1029`・`1504`・`1714`）、URL ハッシュ `#N`（`1269`。1 始まりの数で
  書く仕様）、操作バーの `control-title-preview`（`1257`。「1. 題名」形式で TODO の対象外）、
  `video.py:37`（枠の番号を非表示にするだけ）。番号を 2 桁で出す箇所は他に無い。
- 文書: `docs/Developer.md:273` は「`SLIDE nn / NN`」で桁数を固定していない。
  `docs/UsersGuide.md:349` の「`SLIDE 01 / 17`」は 17 枚の例なので新しい規則でも 2 桁で正しい。
  `slides/users-guide.js:239` の「SLIDE 01 / 16」も 16 枚で 2 桁なので矛盾しない。
  2 桁固定と読める記述は残っていない。
- テスト: `tests/` はプレイヤーの表示を検査していない（`test_browser.py` も CLI 側の 3 件のみ）。
  既存の作りに沿えば表示の確認は verifier の実測で足りる。
- 範囲: 差分は `player.html` の 3 か所のみで、指示外の変更は無い。
- 規約・書式: インデント・命名（`formatTime` と並ぶ位置と名前）は既存に沿っている。
- コメント: 例（1 / 5、01 / 17、001 / 120）で意図が分かり、十分。

## 作り込みすぎ

作り込みすぎ: なし（3 行の関数を 2 か所から呼ぶだけ。Lean already. Ship.）
