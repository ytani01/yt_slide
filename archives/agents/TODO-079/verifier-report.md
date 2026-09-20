# TODO-079 verifier 報告

配信: `python3 -m http.server 8765`、Playwright (chromium) 1280x720。スクリプトは scratchpad の t.py。

## 1. user 15 枚 (player.html?slides=user)
- 15 枚とも表示。console error / pageerror: 0 件（errors []）。一致。
- 全枚で #slide-canvas scrollHeight=428 / clientHeight=428、scrollWidth=868 / clientWidth=868。はみ出しなし。一致。

## 2. 7・8・5 枚目
- 7 枚目: h2「body で書く」、アイコン class `fa-solid fa-pen text-lime-400`。本文 innerText に
  `body: \`<ul>…</ul>\`,` とバッククォート・山括弧が表示された。一致。
- 8 枚目: h2「render() の書き方」。一致。
- 5 枚目: 表の行は title / duration / narration / body の順、4 行目が `body`（説明「本文の HTML を文字列で書く」）。一致。

## 3. 貼り付けて再生（slides/sample.js は確認後に削除済み。git status は M 3 ファイルのみ）
- docs/User.md「最小の例」を抽出して貼付: total 1、h2「はじめに」、`fa-flag-checkered`、本文「本文はここに書く」、エラー 0。一致。
- README「自分のスライドを作る」を抽出して貼付: total 1、h2「1 枚目」、本文「好きな HTML を書く」、エラー 0。一致。
  README の例は icon を持たないので、アイコンは出ない（仕様どおり。依頼文の「アイコンが出る」は User.md 側のみ該当）。
  narration/duration 付き 1 枚であることは確認（コード上）。

## 4. docs/User.md
- キー表の順: title, duration, narration, body, icon, render()。一致。
- 節の順: 「`body` で書く（標準）」66 行 → 「`render()` の書き方」92 行。一致。
- 「render() の書き方」冒頭に「**`body` で足りないとき**の高度な使い方」あり。一致。
- 冒頭 slideData の例は `body: \`<ul>…</ul>\`` 。一致。

## 5. measure-duration.py --slides user --all（--write なし）
- rc=0、15 枚を読めた。提案 duration: 7,10,11,10,10,9,9,14,9,10,9,10,8,8,12。
  user.js の現在値と全枚一致（測り直し済み）。

## 判断・気付き（実害は未確認）
- 5 枚目の説明文は「4つのキーを持つ」で表も 4 行だが、User.md の表は 5 キー + render()（icon も持つ）。スライド側は簡略化とも読める。
- 6 枚目に「SLIDE 01 / 17」という例示文言が残る（今回の差分外。総枚数の実数とは無関係の例示）。
- 9 枚目の「既存の17枚から」も差分外の文言（実際は 15 枚）。
- 指示外のファイルの変更なし。
