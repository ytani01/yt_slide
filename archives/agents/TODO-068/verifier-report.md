# TODO-068 verifier 報告

対象: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`（作業ツリー、
`git status` は implementer/reviewer 作業後の状態のまま）。コードは直していない。
実測にはローカルの Python worktree（`git worktree add … HEAD`、HEAD =
`02e049c` = TODO-068 実装前のコミット）、`python3 -m http.server`、
Playwright（chromium, sync API）を使った。

## 1. `tools/test_measure_duration.py`

```
$ python3 tools/test_measure_duration.py
OK
$ echo $?
0
```

通った。exit 0。

## 2. 共通表が 23 ルール読めている

`load_common_rules()` を実行:

```
$ python3 -c "...load_common_rules()..."
count: 23
```

23 ルールの `(pattern, replacement, flags)` を全件出力し、`git show
HEAD:slides/_rules.js` の 23 行の `[/pattern/flags, 'replacement'],` と
1 件ずつ突き合わせた。パターン・置換文・フラグ（`i` の有無）とも完全一致。

## 3. 置換結果が移動の前後で一致する

`git worktree add <tmp>/wt_head HEAD`（HEAD = 実装前コミット `02e049c`）を用意し、
旧`tools/measure-duration.py` を worktree 側、新（現状）を作業ツリー側として
それぞれの `narrations()` → `prepare()` を実行し、スライドごとに突き合わせた
（除外: `developer` のスライド 3、`readme` のスライド 1・10 = narration を
書き換えた枚。理由は依頼書どおり）。

```
=== readme === old:10 new:10
  compared:8 ok:8 mismatches:0
=== user === old:11 new:11
  compared:11 ok:11 mismatches:0
=== developer === old:11 new:11
  compared:10 ok:10 mismatches:0
=== claude-memo === old:17 new:17
  compared:17 ok:17 mismatches:0
```

除外を除く全 46 枚（8+11+10+17）で完全一致。

## 4. わざと壊すと落ちる

`player.html:606` の `const SPEECH_RULES = [` を
`const SPEECH_RULES_BROKEN = [` に書き換えて実行:

```
$ python3 tools/test_measure_duration.py
/…/player.html に SPEECH_RULES が見つからない
$ echo $?
1
```

意図どおり落ちた（`load_common_rules()` の `SystemExit` 経由）。直後に
バックアップから `\cp` で復元し、`diff <バックアップ> player.html` で
差分ゼロ（完全一致）を確認、`git diff --stat player.html` も壊す前と同じ
`38 ++++++++++++++++++++++++++++++------` に戻っていることを確認した。

## 5. ブラウザで `prepareSpeechText()` を直接呼んだ結果が Python 側と一致

`python3 -m http.server 8099` で配信し、Playwright（chromium, headless）で
`player.html?slides=<deck>` を開き、`slideData` と `prepareSpeechText` が
定義されるのを待ってから `slideData.map(s => prepareSpeechText(s.narration))`
を `page.evaluate()` で呼んで取り出した。音は鳴らしていない。
現行（実装後）の Python 側 `prepare()` の結果と比較:

```
=== readme === browser:10 python:10
  ok:10 mismatches:0
=== user === browser:11 python:11
  ok:11 mismatches:0
=== developer === browser:11 python:11
  ok:11 mismatches:0
=== claude-memo === browser:17 python:17
  ok:17 mismatches:0
```

全 49 枚（10+11+11+17）で完全一致。

## 6. `slides/_rules.js` が消えていて、配布が 2 ファイルで動く

リポジトリ外のディレクトリに `player.html` + `slides/developer.js` だけを
同じ位置関係でコピーし、`python3 -m http.server 8100` で配信、Playwright で
`?slides=developer` を `networkidle` まで開いてローカル（`localhost:8100`）
宛てのリクエストを全部記録した。

```
=== local requests ===
200 http://localhost:8100/player.html?slides=developer
200 http://localhost:8100/slides/developer.js
=== failed requests (local only) ===
(空)
```

ローカル宛てのリクエストは 2 件のみ、両方 200、失敗（404 含む）は無し。

### 追加分: `slides/readme.js` でも同じ確認

同じディレクトリの `slides/` を `readme.js` だけに入れ替えて同じ手順:

```
=== local requests ===
200 http://localhost:8100/player.html?slides=readme
200 http://localhost:8100/slides/readme.js
=== failed requests (local only) ===
(空)
```

こちらも 2 件のみ、両方 200。

## 追加（reviewer 指摘への対応分の確認）

- `README.md:3`、`slides/readme.js` の `title`（5行目）・`narration`（23・260行目）・
  見出し（31行目）・まとめ（270行目）を `sed -n` で直接読み、
  `implementer-brief.md` の「## 追加」に書かれた文言と 1 字ずつ突き合わせた。
  すべて一致（「ファイル 2 つ」「2 つのファイルを置くだけで」など）。
- 洗い出しの grep をそのまま再実行:

  ```
  grep -rn '3 つ\|3つ\|３つ' --include='*.md' --include='*.js' --include='*.html' --include='*.py' . | grep -v '^./archives/'
  ```

  `archives/` と `TODO.md`（対象外）を除いて残るのは次の 3 件のみで、いずれも
  配布ファイルの数とは無関係（実装報告の説明どおり）:
  - `docs/Developer.md:121`「次の 3 つは実機で音声が出なくなった原因」
  - `slides/developer.js:225`「実装を直すときに気をつけることが3つあります」
  - `slides/developer.js:305`「副作用のある3つの注意点」

  見落としは無かった。
- `duration` の測り直し（readme スライド 1・10）は再測定せず、`git diff
  slides/readme.js` で `duration: 12` / `duration: 10` の行が変更行として
  出ていない（前後の行として出ているだけ）ことを確認した。実装報告の
  「変更なし」と一致。`developer.js` のスライド 3 の `duration` は
  `17 → 16` に変わっていることを `git diff` で確認（再測定はしていない）。

## 一致・問題なし（1 行）

- `git status` の変更ファイル一覧（`README.md`、`docs/Developer.md`、
  `docs/User.md`、`player.html`、`slides/claude-memo.js`、
  `slides/developer.js`、`slides/readme.js`、`slides/user.js`、
  `tools/measure-duration.py`、`slides/_rules.js` の削除）は
  `implementer-brief.md` が列挙した対象と一致し、範囲外のファイルへの
  変更は無い。

## 確かめられなかったこと・判断が要る点

- 無し。依頼書に書かれた 1〜6 とその追加分はすべて実測で確認でき、
  食い違いは見つからなかった。
