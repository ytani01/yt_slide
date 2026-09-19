# TODO-068 implementer への依頼

## 目的

`slides/_rules.js` を廃止し、共通の読みの置換表 `SPEECH_RULES` を
`player.html` の中へ戻す。**スライドを作る人から見て、`slides/` に
自分のファイル以外が並んでいるのをやめる**のが目的。配布ファイルが
`player.html` + `slides/<名前>.js` の 2 つに減るのは結果。

背景は `TODO.md` の TODO-068 の節と
`archives/todo/TODO-060. slides _rules.js を player.html に含めるか、もう一度検討する.md`。

## やること

### 1. `player.html`

- `slides/_rules.js` の `SPEECH_RULES` の定義（29 行のファイルからコメントを
  除いた `const SPEECH_RULES = [ … ];`）を `player.html` の
  `prepareSpeechText()` の直前へ移す。**中身（23 ルールの並び・パターン・
  置換文）は 1 字も変えない**
- `player.html:463-464` の `<script src="slides/_rules.js"></script>` と、
  その上のコメント（「スライド一式のファイルより先に読む必要があるので…」）を
  削除する。同じ `<script>` の中に入るので、読み込み順の制約は消える
- `player.html:607-608` のコメントの `slides/_rules.js` への言及を直す

### 2. `tools/measure-duration.py`

- `load_common_rules()` の読み先を `player.html` にする。
  **`slides_rules_from_text()` と同じく囲いを付ける**こと。
  `const SPEECH_RULES = [` から `];` までを先に切り出してから
  `load_rules()` に渡す。`player.html` 全体に `JS_RULE_RE` を当てる形にしない
  （いまはヒット 0 だが、あとから正規表現リテラルが増えると拾う）
- **囲いが見つからないときは黙って空を返さず、`SystemExit` で止める。**
  置換が全部素通りしても例外は出ないため、静かに壊れると気づけない
- 冒頭 docstring（25 行目付近）の「読みの置換表は `slides/_rules.js`（共通）と…」を直す

### 3. `slides/developer.js` の文面（利用者と決めた案）

スライド 3「場所を選ばない」。**この 2 つの文面のとおりに直す**（推敲しない）。

- `narration`（83 行目）:

      player.html がローカルを指すのはスライドデータだけで、しかも相対パスです。player.html と同じ場所に slides を置けば、public_htmlの外でもそのまま動きます。ネット接続だけは必要です。

- 帯の本文（92 行目）:

      ローカルを指すのは slides/&lt;名前&gt;.js だけ。しかも相対パス

同じスライドの下の 2 枚のカードと注釈は**変えない**。

直したら `duration` を測り直す。**この 1 枚だけ**:

    tools/measure-duration.py --slides developer 3 --write

他のスライド、他のスライド一式は測り直さない。

### 4. `_rules.js` への言及を直す

対象は次で出る箇所（`archives/` は対象外）:

    grep -rn '_rules' --include='*.md' --include='*.js' --include='*.py' --include='*.html' . | grep -v '^./archives/' | grep -v __pycache__

`TODO.md` は触らない（決着のときに管理者が直す）。それ以外を直す:

- `README.md:70` と `docs/Developer.md:15` のファイル構成の表から行を削る
- `docs/Developer.md:29`、`:94`、`:109-112`
- `docs/User.md:122` の表と、`:186-194` の「他のサーバーへ持っていくとき」。
  **「渡すのは次の 3 つだけ」が 2 つになる**。直後の「この 2 種類の `.js`」も
  1 種類になるので合わせる
- `slides/{readme,user,developer,claude-memo}.js` のコメント各 1 行
  （「共通は slides/_rules.js」）

### 5. `slides/_rules.js` を消す

`git rm slides/_rules.js`。

### 6. テスト

`tools/test_measure_duration.py` を通す（`assert len(common_rules) == 23` が
そのまま通るはず）。件数以外に検査を足す必要は無い。

## 保つもの

- **置換表の中身と並び順**（23 ルール）。当てる順もいまのまま:
  スライド一式の `slidesConfig.rules` が先、共通の `SPEECH_RULES` が後
- `player.html` を `file://` で開いても読めること（`fetch` を使わない）
- `prepareSpeechText()` の結果が移動の前後で一致すること
- `?slides=<名前>` の読み込み（`document.write` の `<script>`）はそのまま

## 見なくてよいもの

- `archives/` 以下（現行仕様ではない）
- `tools/make-video.py` とそのテスト（置換表は `measure-duration.py` 経由で使う）
- スライドのレイアウト、`duration` の測り直し（上の 1 枚以外）

## 報告

`archives/agents/TODO-068/implementer-report.md` に書く。変更点、
`measure-duration.py` の出力（測り直した `duration` の旧→新）、テストの結果、
残る懸念に絞る。返事は 5 行以内（終わったか・報告ファイルのパス・判断が要る点）。

---

## 追加（reviewer の指摘。利用者と文面を決めたうえで依頼）

`_rules` の grep には出ない「ファイル 3 つ」の記述が残っている。
TODO-068 で配布は 2 つになるので、**この項目で直す**。

### 直す箇所と文面

- `README.md:3` — 「**ファイル 3 つを置くだけで、…**」→ 「**ファイル 2 つを置くだけで、…**」
- `slides/readme.js`
  - `title`（5 行目） — `ファイル 3 つで動く…` → `ファイル 2 つで動く…`
  - `narration`（23 行目） — 「3 つのファイルを置くだけで」→「2 つのファイルを置くだけで」
  - 見出し（31 行目） — `ファイル 3 つ` → `ファイル 2 つ`
  - `narration`（260 行目） — 「ファイル 3 つを置くだけで」→「ファイル 2 つを置くだけで」
  - まとめの行（270 行目） — `ファイル 3 つ` → `ファイル 2 つ`

数字を `3`→`2` に替えるだけ。**言い回しは変えない**（推敲しない）。

### 洗い出し

他に残っていないか、次で確かめる（`archives/` と `TODO.md` は対象外）:

    grep -rn '3 つ\|3つ\|３つ' --include='*.md' --include='*.js' --include='*.html' --include='*.py' . | grep -v '^./archives/'

配布ファイルの数を指していない「3 つ」（別の話の 3 つ）は直さない。
判断に迷うものは直さずに報告する。

### `duration`

`narration` を変えた枚**だけ**測り直す:

    tools/measure-duration.py --slides readme <その枚の番号> --write

`--all` は使わない。他のスライド一式も測り直さない。
