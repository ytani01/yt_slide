# TODO-091 検証報告

対象: 未コミットの `git diff`（`player.html`, `docs/Developer.md`, `docs/User.md`）

## 検証方法

ヘッドレス Chromium（Playwright 1.63.0）で `player.html`（`file://`）を開き、
`addInitScript` で `window.speechSynthesis` を偽物に差し替えて測った。

**重要な実測メモ**: `window.speechSynthesis = {...}` という単純な代入は
Chromium 上では**黙って失敗し、`getVoices()` が常に空配列を返す**
（アクセサプロパティのため）。`Object.defineProperty(window,
'speechSynthesis', { configurable: true, value: {...} })` に変えて初めて
差し替えが効いた。これに気づかず単純代入のままだと、どのケースも
「声が 1 つも無い端末」を検証しているだけになり、意味のある結果が
出ない。

計測スクリプトは `archives/agents/TODO-091/check-voice-select.js` に 1 本
作成（ケース: `basic` / `async-voices` / `restore` / `restore-async` /
`missing` / `switch-btn` / `no-localstorage`）。実行コマンド:

```
NODE_PATH=/tmp/verify064b/node_modules node check-voice-select.js <case>
```

（このリポジトリに Playwright が入っていないため、既存の他プロジェクトの
`node_modules` を `NODE_PATH` で借りた。`npx playwright` 自体は動くが
`require('playwright')` は `node_modules` が要る）

## 確認項目ごとの結果

### 1. プルダウンの選択肢が online/auto + 日本語の声だけになる

`basic` ケースの実測値:

```json
"options": [
  { "value": "online", "text": "Online Voice" },
  { "value": "auto", "text": "Web Speech (自動)" },
  { "value": "Microsoft Nanami (ja-JP)", "text": "Microsoft Nanami (ja-JP)" },
  { "value": "Google 日本語", "text": "Google 日本語" }
]
```

`Google US English`（`en-US`）は与えたが選択肢に出ていない。**OK**。

### 2. 起動時に空配列 → 後から `onvoiceschanged` で並び直す

`async-voices` ケース（`getVoices()` が起動直後は `[]`、その後
`window.__setVoicesLater()` で日本語 2 声＋英語 1 声を返すよう切替え、
`onvoiceschanged` ハンドラを呼ぶ）:

```
"optionsBeforeVoicesLoaded": ["online", "auto"]
"options" (発火後): online / auto / Microsoft Nanami (ja-JP) / Google 日本語
```

**OK**。空 → 発火後に日本語 2 声が並び直した。

### 3. 覚えていた声が、後から揃った声一覧の中で復元される（reviewer 指摘の修正点）

`restore-async` ケース（`localStorage` に事前に
`voiceEngineMode=speech`, `voiceName=Google 日本語` をセットし、
`getVoices()` は起動直後 `[]`、後から日本語 2 声が揃う）:

```
"optionsBeforeVoicesLoaded": ["online", "auto"]
"selectedValue": "Google 日本語"
```

**OK**。起動直後は空で選べないが、`onvoiceschanged` 発火後に
`voice-select` の値が保存していた `Google 日本語` に復元された。
`applyVoiceEngine()` の `if (!found && voices.length) selectedVoiceName
= '';` の分岐（`voices.length` が 0 のときは選択名をリセットしない）が
狙いどおりに効いていることを実測で確認した。

### 4. 声を選んで change → localStorage 保存 → reload で復元

`basic` ケースの続きの実測値:

```json
"afterSelect": {
  "selectedValue": "Microsoft Nanami (ja-JP)",
  "localStorageVoiceName": "Microsoft Nanami (ja-JP)",
  "localStorageEngineMode": "speech"
},
"afterReload": {
  "selectedValue": "Microsoft Nanami (ja-JP)"
}
```

**OK**。

### 5. 覚えている声が端末に無いとき auto に戻る

`missing` ケース（`localStorage` に `voiceName=No Such Voice` を事前設定、
実際の声一覧には含まれない）:

```json
"selectedValue": "auto"
```

**OK**。

### 6. 「音声エンジンを切り替える」ボタンで online ⇔ auto

`switch-btn` ケース:

```json
"beforeClick": "online",
"afterClick1": "auto",
"afterClick2": "online"
```

**OK**。2 回クリックで online → auto → online と往復した。

### 7. localStorage が使えなくても例外で止まらない

`Object.defineProperty(window, 'localStorage', { get() { throw new
Error('blocked'); } })` で `getItem`/`setItem` 双方が呼べない状態を再現。

- 読み込み時（`no-localstorage` ケース）:
  ```json
  "selectedValue": "online",
  "consoleErrors": []
  ```
- 読み込み後にプルダウンで声を選んで `change` を発火させた場合（追加で
  1 回スクリプトを書いて実行。ファイルには残していない単発確認）:
  ```
  selectedValue after change with blocked localStorage: Microsoft Nanami (ja-JP)
  errors: []
  ```

**OK**。読み込み・変更のどちらも例外を投げず、コンソールエラーも出ていない。

`file://` での動作は上記すべてのケースをそのまま `file://` で開いて
測っているので、これも合わせて確認済み。

### 8. コンソールエラー

上記すべてのケースで `consoleErrors` は空配列（Tailwind CDN の警告以外は
出ていない。この警告は今回の変更と無関係で、既存のもの）。

## 変更ファイルの範囲

`git status --short`:

```
 M docs/Developer.md
 M docs/User.md
 M player.html
?? archives/agents/TODO-091/
```

TODO-091 の指示どおり `player.html` / `docs/Developer.md` /
`docs/User.md` の 3 ファイルのみが変更されており、指示に無いファイルは
無い（`archives/agents/TODO-091/` は今回のレビュー・検証の作業産物）。

`docs/Developer.md` と `docs/User.md` の記述（選択肢のラベル・保存キー・
「`getVoices()` は空で返ることがある」「Google 日本語しか無い端末では
Online Voice と変わらない」）は、上記の実測結果および `player.html` の
コードと食い違っていない。

## 確かめられなかったこと・判断できないこと

- **実機（実際のブラウザ・実際の音声合成エンジン）での動作は未確認。**
  今回はすべて `speechSynthesis` を偽物に差し替えた計測。reviewer の
  報告にもある通り、実際に Chrome/Edge/Safari が起動直後に
  `getVoices()` を空で返すかどうかの実測は行っていない
  （広く知られた挙動として reviewer・実装側とも前提にしている）
- `femaleJaVoice` のヒューリスティック（`selectedVoiceName` 未指定時に
  女性声を優先する分岐）については、reviewer が読み合わせ済みで、
  今回の検証範囲（一覧・保存・復元）の外なので実測していない
- レイアウト・見た目・実際の声の聞こえ方は指示どおり対象外
- 上記の「localStorage が使えない状態での change」の確認は、使い回す
  スクリプトファイルには追加せず単発の `node -e` で実行した（結果は
  本報告に転記済み）。再現したい場合はこのファイルに書いたスクリプトを
  ベースに `no-localstorage` ケースへ `selectOption` を足せば同じ確認が
  できる
