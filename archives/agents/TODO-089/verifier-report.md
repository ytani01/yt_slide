# TODO-089 verifier 報告

コードは直していない。以下すべて実行して確かめた（読み合わせだけでは済ませていない）。

## 1. 冪等性

`git stash` などの退避なし、現状の作業ツリーのまま実行。

```
$ md5sum index.html            # 実行前
3eb0e953df89103d7333726287273410  index.html
$ python3 tools/make-index.py
index.html: 5 件のスライドを書いた
$ md5sum index.html            # 実行後
3eb0e953df89103d7333726287273410  index.html
```

md5 一致。一致。

## 2. 仮スライドの追加・削除

`slides/zzz-kakunin.js`（title/heading/summary/icon あり）を作って実行 →
「index.html: 6 件のスライドを書いた」、`grep -n zzz-kakunin index.html` で
`<li>` が生成されていることを確認。`\rm slides/zzz-kakunin.js` で削除して
再実行 → 「index.html: 5 件のスライドを書いた」に戻ることを確認。一致。

## 3. 並び順

```
$ grep -o 'slides=[a-z-]*' index.html
slides=readme
slides=claude-memo
slides=developer
slides=template
slides=user
```

`readme` 先頭 + 残り（`claude-memo, developer, template, user`）辞書順。一致。

## 4. `\'` のエスケープ確認

`slides/zzz-esc.js` に `summary: 'it\'s a test'` を書いて実行 →
生成された `<li>` は `<span class="block text-sm text-slate-400 mt-1">it's a test</span>`。
バックスラッシュは残らない。確認後 `\rm slides/zzz-esc.js` で削除し
5 件に戻ることも確認。一致。

## 5. テスト 3 本

```
$ python3 tools/test_make_index.py       → OK, exit 0
$ python3 tools/test_measure_duration.py → OK, exit 0
$ python3 tools/test_make_video.py       → OK, exit 0
```

一致。

## 6. ブラウザでの表示（Playwright, Chromium）

`file://` で `index.html` を開いた場合と、`python3 -m http.server` で開いた
場合の両方で `ul a[href^='player.html']` を数えたところ、どちらも 5 件、
アイコン・説明文とも `console`/`pageerror` エラー無しで一致（内容は下記、
両者とも同一）。

```
{'href': 'player.html?slides=readme', 'text': 'readme\nこのリポジトリの紹介', 'icon': 'fa-solid fa-book-open ...'}
{'href': 'player.html?slides=claude-memo', ... 'icon': 'fa-solid fa-robot ...'}
{'href': 'player.html?slides=developer', ... 'icon': 'fa-solid fa-code ...'}
{'href': 'player.html?slides=template', ... 'icon': 'fa-solid fa-shapes ...'}
{'href': 'player.html?slides=user', ... 'icon': 'fa-solid fa-pen-ruler ...'}
```

説明文に `\` や生の HTML タグの混入は見当たらない。一致。

## 7. `docs/User.md` の「手順」をなぞる

手順どおりに `slides/nazoru-test.js` を新規作成（`slidesConfig` に
title/heading/summary/icon、`slideData` に 1 枚）→
`python3 tools/make-index.py` を実行 →「index.html: 6 件のスライドを書いた」、
`<li>` に `player.html?slides=nazoru-test` が追加されたことを確認。
続けて `player.html?slides=nazoru-test` を http サーバー経由で Playwright で
開き、タイトル「なぞり確認用」・本文「確認スライド1」が表示され
`pageerror` 無しで再生画面が出ることを確認。なぞり終えたので
`\rm slides/nazoru-test.js` → 再実行し 5 件に戻り、`git diff --stat index.html`
がこの verifier 作業の前後で変わっていないことも確認。手順どおりに再現できた。

## 8. `slides/user.js` 手順3 と `docs/User.md` の食い違い

`slides/user.js` の Slide 5（手順3, 133-158行付近）のナレーション・本文は
「`slidesConfig` に `summary`/`icon` を書いて `tools/make-index.py` を
走らせると `index.html` の一覧が作り直される。走らせなくても
`player.html?slides=<名前>` で直接開ける」という内容。
`docs/User.md` の「手順」節（3・4番目の項目、44-48行付近）と突き合わせても
食い違いは見当たらない。一致。

## 見なかったもの（指示どおり）

- `index.html` の配色・レイアウトの評価
- `TODO.md` の書式
- マーカー2組・入れ子の挙動、一覧の並び順が以前と変わる点
  （レビューで「対応しない」と決められた項目）

## 確かめられなかったこと・判断できないこと

- implementer-report.md に書かれている「レビュー後の修正」以降の節を
  reviewer がどう評価したか（`reviewer-report.md` の内容）は今回読んで
  いない。指示に reviewer-report を読む指定が無かったため
- `docs/User.md`・`README.md`・`CLAUDE.md` の記述全文と実装の細部の突き合わせ
  （行番号レベルでの完全一致）までは見ていない。指示された 8 項目の実測に
  絞った
- 「利用者が今までと同じ並びを期待していないか」（implementer-report.md の
  懸念）は判断できない。これは利用者に確認してもらう性質の点で、境界線上の
  判断はしていない

## 作業ツリーの状態

検証で作った仮ファイル（`zzz-kakunin.js`・`zzz-esc.js`・`nazoru-test.js`・
一時 http.server プロセス）はすべて削除・終了済み。最終的な
`git status --short` は開始時と同じ（`M` 10 件・`??` 3 件）。
変更ファイルの一覧は `implementer-report.md` の「変更したファイル」節と
一致しており、指示範囲外のファイルへの変更は見当たらない。
