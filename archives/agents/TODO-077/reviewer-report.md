# TODO-077 reviewer report

対象: `git diff -- player.html docs/User.md`（未コミット）。
参照した規約: `CLAUDE.md`、`docs/Developer.md`（レイアウト・擬似フルスクリーン節）。
コードは直していない。

## 検討

- **`player.html:1436-1442` Escape が検索欄にフォーカスがあっても
  フルスクリーンを閉じる。**
  `document.addEventListener('keydown', ...)` の Escape 分岐
  （1438〜1441 行）は `e.target` を見ずに、擬似フルスクリーン中なら
  無条件で `setFullscreen(false)` を呼ぶ。`input, textarea, select, ...`
  を除外する `e.target.closest(...)` のガード（1442 行）は Escape の
  **後**にある。擬似フルスクリーン中に検索欄へ入力していて、絞り込みを
  Escape で消すつもりで押すと、同時にフルスクリーンも終了する。
  この分岐自体は今回の差分より前から存在し（diff に含まれない）、
  今回追加された `#playlist-search` が初めてこの経路に乗る要素になった。
  擬似フルスクリーン中に検索欄が操作可能かは `docs/Developer.md` の
  「擬似フルスクリーン」節を見ても明記が無く、**実害は未確認**。

- **`docs/User.md:23` 「欄の × または Escape で絞り込みを解除する」が
  ブラウザ依存の可能性。** 実装コメント（`player.html:491-492`）は
  「解除の × と Escape はブラウザに任せる」としており、
  `type="search"` のネイティブな解除動作（クリアボタンの表示、
  Escape でのクリア）に依存している。Chromium 系では動くことが多いが、
  他のブラウザで同じ挙動になるかは**未確認**（このセッションでは
  実際のブラウザ描画を確認していない）。verifier の検証計画
  （`TODO.md` の TODO-077 節）は Playwright での 1280×800 とタッチ設定の
  390×844 のみを挙げており、使用エンジンやブラウザの種類までは
  指定されていない。× ボタンが出ない・Escape で消えないブラウザがあると、
  文書の記述と食い違う。

- **操作ガイド（`#operation-guide`、`player.html` 内）の文言が
  検索欄を反映していない。** 「Space・矢印・Home・End・F・M は、
  ボタンや選択欄を操作していないときに使えます」（該当行の直前に
  `<p>` あり）は、キーボード操作が効かない対象を「ボタンや選択欄」と
  列挙している。今回加わった `#playlist-search` はテキスト入力欄で
  どちらにも当てはまらず、列挙から漏れている。動作自体は
  `e.target.closest('button, input, ...')` で正しく除外されているので
  実害は無いが、ガイドの説明文が実態を言い切れていない。
  TODO-077 のチェック項目に操作ガイドの更新は無く、範囲外と見ることも
  できる（判断は main に委ねる）。

- **`player.html:483` 新しく挟んだラッパー `<div class="p-4 flex
  flex-col h-full lg:absolute lg:inset-0">` のインデントが揃っていない。**
  ファイル全体は 4 スペース刻みでネストを深くする書式で統一されている
  （例: 482 行 `#sidebar` が 12 スペース、その直下の子要素は本来 16
  スペースになるはず）。実際には 483 行が 14 スペース、その子である
  484 行（`<div class="flex items-center justify-between...">`）が
  16 スペースのままで、ネストが 1 段増えた分だけ子孫の行が
  4 スペースずつ深くなっていない。表示や動作には影響しないが、
  この後さらに編集するときに読み違えやすい。

## 好みの範囲

- `filterPlaylist()` は `slide.title` と `slide.narration` をスペースで
  連結してから `includes(query)` している。題名の末尾語とナレーションの
  先頭語がつながって、意図しない一致を作る可能性がある
  （例: 題名が「…まとめ」、ナレーションが「続きです」で検索語
  「めつ」が一致する、といった境界の組み合わせ）。頻度は低いと見られ、
  実害は未確認。

## 確認して問題が無かった点

- 絞り込みは `playlistItems[idx]` に `hidden` クラスを付け外しするだけで、
  `slideData` や `slideStartTimes` や `totalDurationSeconds` には触れていない
  （`player.html:1210-1224`）。クリックハンドラ（`initPlaylist()` 内の
  `btn.onclick = () => renderSlide(idx, true)`）も元の `idx` を束縛しており、
  絞り込みで並びが変わらないため、元のスライド番号・移動先・再生順序・
  総時間は保たれる。
- `updatePlaylistSelection()` は `hidden` な項目のときだけ
  `scrollPlaylistIntoView()` を呼ばないようにガードが足されており
  （`player.html:1244-1250`）、絞り込み中に再生が進んでも該当項目が
  非表示のままスクロール計算（`getBoundingClientRect()`）に落ちない。
- キーボードの Space・矢印は既存の `e.target.closest('button, input,
  textarea, select, a, [contenteditable]...')` ガード（`player.html:1442`、
  今回の差分では触っていない）に検索欄も自然に含まれるため、検索欄に
  文字を入力中は再生操作に渡らない。
- レイアウトは `items-start` を外したことで、グリッドの行の高さが
  `#sidebar` と動画側カラムのうち高い方（実質、動画側カラム）に揃い、
  `#sidebar` は `lg:h-auto lg:relative` + 中身の `lg:absolute lg:inset-0`
  でその高さいっぱいに広がる。字幕バナーが表示されて動画側カラムが
  伸びれば、グリッドの再計算で `#sidebar` も自動で追従するため、
  「字幕表示中はその分だけ一覧を伸ばす」という要件を JS 側の追加処理
  無しで満たせている。`lg:` 未満（`grid-cols-1` の 1 カラム表示）では
  各グリッド項目が単独の行になるため `items-start` の削除は影響せず、
  `#sidebar` は元どおり `h-[520px]` 固定のまま（スマホ縦画面・タッチ画面の
  縮小経路は変更されていない）。
- `docs/User.md` に TODO 番号は含まれておらず、規約
  （「`docs/` は利用者向けなので TODO 番号を書かない」）に沿っている。
  `player.html` 側のコメントに `（TODO-077）` があるのは、既存の
  `player.html` 内コメント（TODO-001、TODO-002 など多数）と同じ慣行で、
  逸脱ではない。
- `docs/User.md` の追加節（該当数の出し方、該当なし表示の文言、
  絞り込みが番号・順序・総時間を変えないこと、検索中は Space/矢印が
  効かないこと）は、いずれも実装と一致している。

## 範囲

差分は TODO-077 のチェック項目（検索欄・件数表示・該当なし表示・解除・
元の番号とクリック移動・再生順序と総時間の保持・一覧の下端合わせ・
`docs/User.md` 更新）に対応する変更のみで、指示に無い変更は見当たらない。
