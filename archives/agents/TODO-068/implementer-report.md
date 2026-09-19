# TODO-068 implementer 報告

## 変更点

- `player.html:459-461` — `<script src="slides/_rules.js"></script>` とその上のコメントを削除
- `player.html:602-627`（新設） — `SPEECH_RULES`（23 ルール、`slides/_rules.js` から 1 字も変えず移植）を
  `prepareSpeechText()` の直前に追加
- `player.html:632-634` — `prepareSpeechText()` 直上のコメントから `slides/_rules.js` への言及を削除
- `tools/measure-duration.py:41-44` — `PLAYER_HTML` 定数を追加
- `tools/measure-duration.py:25-27`（docstring） — 「`slides/_rules.js`（共通）」→「`player.html` の `SPEECH_RULES`（共通）」
- `tools/measure-duration.py:82-89` — `load_common_rules()` の読み先を `player.html` に変更。
  `const SPEECH_RULES = \[(.*?)\n\s*\];` で囲いを切り出してから `load_rules()` に渡す形にし、
  見つからないときは `SystemExit` で止める
- `slides/developer.js:83` — narration を依頼書どおりの文面に変更
- `slides/developer.js:92` — 帯の本文を依頼書どおりの文面に変更（「2 つだけ」→「slides/<名前>.js だけ」）
- `slides/developer.js:82` — `duration` を 17 → 16 に更新（下記の測り直しの結果）
- `README.md:70` — ファイル構成表から `slides/_rules.js` の行を削除
- `docs/Developer.md:15` — ファイル構成表から `slides/_rules.js` の行を削除
- `docs/Developer.md:29` — 「ローカルを指すのは `slides/_rules.js` と `slides/<名前>.js` の 2 つ」→
  「`slides/<名前>.js` だけ」
- `docs/Developer.md:94` — 「`slides/_rules.js` とスライド一式のファイルから」→
  「`player.html` の `SPEECH_RULES` とスライド一式のファイルから」
- `docs/Developer.md:108-110` — `_rules.js` の言及と読み込み順の制約の説明を削除（制約自体が
  消えたため）
- `docs/User.md:122` — 表の「置き場所」を `slides/_rules.js` → `player.html`
- `docs/User.md:185-193` — 「渡すのは次の 3 つだけ」→「2 つだけ」、`slides/_rules.js` の行を削除、
  「この 2 種類の `.js`」→「この `.js`」
- `slides/{readme,user,developer,claude-memo}.js` — コメント「共通は slides/_rules.js」→
  「共通は player.html」（各 1 行）
- `slides/_rules.js` — `git rm` で削除

## `measure-duration.py` の出力

```
tools/measure-duration.py --slides developer 3 --write
スライド 3: 原文 111 字 / 読み 132 字 / 実測 22.128s / BASE_SPEED_MULTIPLIER=1.4 倍速 15.81s -> duration: 16
スライド 3: duration 17 -> 16
developer.js: 1 枚を書き換えた
```

## テストの結果

`python3 tools/test_measure_duration.py` → `OK`（exit 0）。
`assert len(common_rules) == 23` は変更なしで通った。

## 残る懸念

- 依頼書の範囲外（`docs/Developer.md:109` の並び順の説明文、`archives/` 以下、`TODO.md`、
  `tools/make-video.py` とそのテスト）には触っていない
- `grep -rn '_rules'` を `archives/` と `TODO.md` を除いて確認し、対象範囲に残る言及が無いことを確かめた
- 判断が要る点は無し

## 追加（reviewer の指摘。「ファイル 3 つ」の記述）

### 変更点

- `README.md:3` — 「ファイル 3 つを置くだけで、…」→「ファイル 2 つを置くだけで、…」
- `slides/readme.js:5` — `title` の「ファイル 3 つで動く…」→「ファイル 2 つで動く…」
- `slides/readme.js:23` — スライド 1 の `narration` の「3 つのファイルを置くだけで」→
  「2 つのファイルを置くだけで」
- `slides/readme.js:31` — スライド 1 の見出しの `3 つ` → `2 つ`
- `slides/readme.js:260` — スライド 10（まとめ）の `narration` の
  「ファイル 3 つを置くだけで」→「ファイル 2 つを置くだけで」
- `slides/readme.js:270` — スライド 10 のまとめの行の `ファイル 3 つ` → `ファイル 2 つ`

数字を `3`→`2` に替えただけで、言い回しは変えていない。

### 洗い出し

    grep -rn '3 つ\|3つ\|３つ' --include='*.md' --include='*.js' --include='*.html' --include='*.py' . | grep -v '^./archives/'

`archives/` と対象外の `TODO.md` を除くと、残る「3 つ」は配布ファイルの数とは
無関係だったので直していない:

- `slides/developer.js:225`「実装を直すときに気をつけることが3つあります」
  （`Audio` 要素・`Web Speech` の分割・`no-referrer` の 3 点）
- `slides/developer.js:305`「副作用のある3つの注意点」（同上）
- `docs/Developer.md:121`「次の 3 つは実機で音声が出なくなった原因」（同上）

### `measure-duration.py` の出力

```
tools/measure-duration.py --slides readme 1 10 --write
スライド 1: 原文 86 字 / 読み 92 字 / 実測 16.224s / BASE_SPEED_MULTIPLIER=1.4 倍速 11.59s -> duration: 12
スライド 10: 原文 74 字 / 読み 76 字 / 実測 13.344s / BASE_SPEED_MULTIPLIER=1.4 倍速 9.53s -> duration: 10
readme.js: 変更なし
```

`3`→`2` は字数が変わらないため、両スライドとも `duration` は据え置き（12、10）。

### テストの結果

`python3 tools/test_measure_duration.py` → `OK`（exit 0）。

### 残る懸念

判断が要る点は無し。
