# TODO-091 レビュー報告

対象: `git diff`（player.html, docs/Developer.md, docs/User.md、未コミット）

## 要修正

### 1. 起動直後に `applyVoiceEngine()` が空の `getVoices()` を掴むと、覚えた声を永久に消す

`player.html:1649-1658`（`startApp()`）で

```js
selectedVoiceName = loadSetting('voiceName', '', () => true);  // 788
...
applyVoiceEngine();                                             // 1655
```

`applyVoiceEngine()`（`player.html:753-763`）は

```js
function applyVoiceEngine() {
    const want = voiceEngineMode === 'online'
        ? 'online' : (selectedVoiceName || 'auto');
    ...
    japaneseVoices().forEach(v => voiceSelect.add(new Option(v.name, v.name)));
    const found = Array.from(voiceSelect.options).some(o => o.value === want);
    voiceSelect.value = found ? want : 'auto';
    if (!found) selectedVoiceName = '';   // ← ここ
}
```

`speechSynthesis.getVoices()` はページ読み込み直後の同期呼び出しでは空配列を
返し、`onvoiceschanged` が発火してから初めて揃うことが広く知られている
（`docs/Developer.md` 自身も「`getVoices()` は空で返ることがある」と今回の
差分で書いている）。

`startApp()` からの最初の `applyVoiceEngine()` 呼び出し時点で `japaneseVoices()`
が空だと、`voiceEngineMode === 'speech'` かつ覚えていた声（`selectedVoiceName`）
がまだ選択肢に無いので `found` は `false` になり、**`selectedVoiceName` が
その場で `''` にリセットされる**。その後 `onvoiceschanged` が発火して
`applyVoiceEngine()` が呼び直されても、`want` の計算に使う `selectedVoiceName`
は既に `''` になっているため、実際にはその端末に声が存在していても
「Web Speech (自動)」に固定されたままになる。

TODO-091 のチェック項目「選んだ声を `saveSetting` で覚え、次に開いたときに
復元する」と、`docs/Developer.md` に書かれた「`onvoiceschanged` でも
`applyVoiceEngine()` を呼び直して並べ直す」という設計意図に対して、
実装は「まだ読み込めていないだけ」と「端末に本当に無い」を区別できておらず、
前者のケースで記憶を失う。

**未確認**: 実機（Chrome など）で `getVoices()` が起動直後に本当に空配列を
返すかどうかは、この場で実行して確かめてはいない。ただし広く知られた
ブラウザの挙動であり、コードの構造上、空配列が一度でも返ればこの問題が
起きることは読み合わせで確認できる。verifier には、端末の声（Google 以外）
を選んで保存したあと、ページをリロードして選択が復元されるかを実機で
確かめてもらうことを勧める。

## 検討

特になし（分岐の優先順位、`onvoiceschanged` によるユーザー選択の上書き、
`docs/Developer.md`・`docs/User.md` との整合、旧 ID (`toggle-voice-engine-btn`
`speech-status-indicator`) の残骸は、いずれも問題なしと確認済み。詳細は
「確認済みで問題なし」を参照）。

## 好みの範囲

なし。

## 確認済みで問題なし

- **`femaleJaVoice` の優先順位**（`player.html:962-970`）: `&&` は `||` より
  結合が強いため、
  `(selectedVoiceName && voices.find(A)) || voices.find(B) || voices.find(C) || voices.find(D)`
  は「選ばれた声の完全一致 → 女性声ヒューリスティック → 男性除外の日本語声 →
  任意の日本語声」の順で評価される、元の意図どおりの優先順位。新しく足した
  `(selectedVoiceName && ...)` 節も `||` チェーンの先頭に自然に連結されており、
  演算子優先順位の事故は無い。
- **`onvoiceschanged` からの呼び直しでユーザーの選択が上書きされないか**:
  `applyVoiceEngine()` は毎回 `voiceEngineMode` / `selectedVoiceName` という
  現在の状態変数を読むため、ユーザーが `change` イベントで既に選び直して
  いれば、その最新の状態を再構築するだけで、保存前の古い値に戻ることは無い
  （問題があるのは上記「要修正」の、起動直後・保存値の復元時のみ）。
- **残骸**: `toggle-voice-engine-btn` / `speech-status-indicator` /
  `speechStatusIndicator` / `toggleVoiceEngineBtn` への参照は
  `player.html`・`docs/` のどこにも残っていない（`grep` で確認）。
- **`docs/Developer.md`・`docs/User.md` との整合**: 選択肢の並び・ラベル
  （`Online Voice` / `Web Speech (自動)` / 端末の声の名前）、保存キー
  （`ytSlidePlayer.voiceName` / 変数 `selectedVoiceName`）、既定値の表記が
  実装と一致している。「音声エンジンを切り替える」ボタンの説明
  （select の値を変えて `change` を発火）も実装（`player.html:1365-1368`）と
  一致。
- **範囲**: 差分は音声選択まわりに閉じており、無関係な変更は無い。

## 判断が要る点

上記「要修正」1 点が、この項目の主目的（選んだ声を覚えて復元する）に
直結する。原因の切り分け（本当に `getVoices()` が空を返す端末がどれだけ
あるか）は行っていないので、実機での再現確認と対処方針の判断を管理者に
委ねる。
