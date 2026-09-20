# TODO-084 実装報告（項目 1〜6）

対象外: `player.html`（別担当が並行して直しているため、一切触っていない）。

## 項目 1: `docs/Developer.md` と `slides/developer.js` に make-video.py を反映

- `docs/Developer.md:11-24` 「リポジトリの構成」の表に `tools/make-video.py`・
  `tools/test_make_video.py` の行を追加
- `docs/Developer.md:23` 「テストは `tools/test_measure_duration.py` だけ」
  →「`tools/test_measure_duration.py` と `tools/test_make_video.py` の 2 本」に修正
- `slides/developer.js:65-68`（2 枚目の表）に `tools/make-video.py` の行を追加、
  `slides/developer.js:52` のナレーションも「動画に書き出すスクリプト」を
  含める形に修正（`duration` 測り直し済み。後述）

## 項目 2: スライド一式の数を 5 つに揃える

- `CLAUDE.md:8` 「4 つのスライド一式」→「5 つのスライド一式」（`template` を追加）
- `slides/readme.js`（9 枚目「入っているスライド」）の表に `template` の行を追加し、
  ナレーションも「5つのスライド一式」に修正（`duration` 測り直し済み）

## 項目 3: `slides/readme.js` を `body` 標準に合わせる

7 枚目の差し替えは行わず、指示どおりの範囲だけ変更。

- 5 枚目（`slidesConfig と slideData`）: コード例の `render() { /* HTML を返す */ }`
  を `body: \`...\`` に差し替え。ナレーション文言は元々 `render()`/`body` に
  言及していなかったため変更不要と判断
- 6 枚目（`1枚のスライドの要素`）: 4 つのカードのうち `render()` のカードを
  `body`（`icon` も触れる注記付き）に差し替え。ナレーションも
  「HTMLを返す関数」→「本文のHTMLを書きます」に修正
- 7 枚目（`render() の書き方`）: 型は変えず、冒頭に
  「body で足りないときだけ使う、高度な書き方」の一言を追加。ナレーション末尾にも
  「body で足りないときだけ使う書き方です。」を追加

`duration` 測り直し済み（後述）。

## 項目 4: `slides/user.js` に `index.html` の手順を足す

旧 4 枚目「手順2と3 書いて開く」を 3 枚に分割した。

- 新 4 枚目: 「手順2 slidesConfig と slideData を書く」
- 新 5 枚目: 「手順3 index.html に足す」（`docs/User.md` の手順 3 と同内容。
  `<li>` を 1 つ足す、既存を写して `href` の `slides=` と名前・説明を直す）
- 新 6 枚目: 「手順4 ブラウザで開く」（旧 4 枚目の後半をそのまま独立させた）

枚数が 15 → 17 に増えたため、以降のスライドのコメント番号（`// Slide N`）も
ずれた分を振り直した（実行順序・内容は変えていない。コメントの番号ラベルのみ）。

## 項目 5: `docs/` から TODO 番号を外す

`grep -rn 'TODO-[0-9]' docs/ README.md` で見つかった 4 か所（すべて
`docs/Developer.md`）から番号を除去し、文意が通るように整えた。

- `docs/Developer.md:63`（`TODO-048`）: 番号を削除。文の意味に影響なし
- `docs/Developer.md:94`（`TODO-050`、`TODO-051`）: 番号を削除
- `docs/Developer.md:99`（`TODO-054`）: 番号を削除。ついでに「`player.html` と
  同じものを」という元々やや分かりにくかった表現を整理（意味は変えていない）

`player.html`・`slides/*.js`・`tools/*.py` 内のコメントの TODO 番号は指示どおり
残した（未変更）。

## 項目 6: `file://` の記述を事実に合わせる

`grep -rn 'file://' docs/ README.md` で見つかった箇所のうち、「`file://` で
直接開くのは試していない」という趣旨の 3 か所（`README.md`・`docs/User.md`・
`docs/Developer.md`）を、依頼の事実（表示は動くことを確認済み、読み上げは
未確認）に合わせて書き直した。「HTTP 配信が確実」という結論は維持した。

`docs/Developer.md:122` の `file://`（`localStorage` が使えない環境の例示）は、
「直接開くのを試したか」という話ではないため変更していない。

## duration の測り直し

ナレーションを変えたスライドだけ測定（`--all` は使っていない）。すべて
Google Translate TTS に通信でき、測定できた。

```
python3 tools/measure-duration.py --slides readme 6 7 9 --write
  スライド 6: duration 9 -> 8
  スライド 7: duration 8 -> 10
  スライド 9: duration 12 -> 14

python3 tools/measure-duration.py --slides developer 2 --write
  スライド 2: duration 15 -> 17

python3 tools/measure-duration.py --slides user 4 5 6 --write
  スライド 4: duration 8 -> 4
  スライド 5: duration 10 -> 11
  スライド 6: duration 7 -> 6
```

readme.js の 5 枚目はナレーションを変えていないため測り直していない
（コード例の見た目だけを変更）。

## テスト結果

```
python3 tools/test_measure_duration.py  → OK（終了コード 0）
python3 tools/test_make_video.py        → OK（終了コード 0）
```

さらに、変更した 3 つの `slides/*.js` を Node.js で構文・実行チェック済み
（`slideData` が正しく定義され、期待する枚数で読み込めることを確認）。

## 触ったファイル一覧

- `CLAUDE.md`
- `README.md`
- `docs/Developer.md`
- `docs/User.md`
- `slides/readme.js`
- `slides/developer.js`
- `slides/user.js`

## 判断が要る点・残る懸念

- CLAUDE.md は本来 main/wording の担当領域だが、項目 2 で「リポジトリ直下の
  CLAUDE.md の『構成』節を直す」と明示的に指示されていたため、その 1 か所だけ
  直接編集した。他の箇所には触れていない
- `slides/user.js` の枚数増加に伴い、既存スライド（旧 5 枚目以降）のコメント
  `// Slide N` の番号を振り直した。`slideData` の実際の並び順・内容は変えておらず、
  表示上の番号（`SLIDE nn / NN`）は自動計算のため影響なし
- `slides/readme.js` の 1〜4・8・10 枚目は今も `render()` を使ったままで、
  `body` 標準への移行はしていない（指示の範囲外のため）
- 実機のブラウザ表示（`player.html?slides=readme` 等の見た目）までは確認して
  いない。今回は文書・ナレーションの整合と自動テストのみ
