# TODO-091. 読み上げの声を一覧から選べるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |
| 実施 | Opus 5 / effort high | reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 19,807 | 38,980 | 69% |
| reviewer | Sonnet 5 | high | 19,251 | 53,630 | 14% |
| verifier | Sonnet 5 | medium | 14,669 | 52,131 | 17% |
| 合計 |  |  | 53,727 | 144,741 | 概算 $3.0 |

- reviewer・verifier とも定義（`~/.claude/agents/`）のモデルは sonnet。上書きしていない
- main のモデルは利用者の設定（Opus 5 / effort high）で、見込みの Sonnet 5 とは違う

## きっかけ

「Web Speech API と Online TTS の声が同じに聞こえる」という指摘から。
調べると実装の問題ではなく、Web Speech の音声選択（`femaleJaVoice`）が
名前に `google` を含む声を優先するため、Chrome ではどちらを選んでも
Google の同じ日本語音声になっていた。

Windows の Nanami・Haruka、macOS の Kyoko、Android の追加音声は、いずれも
Web Speech API 経由で無料で使える。一覧から選べるようにすれば、端末に
入っている声はそのまま選択肢になる。

VOICEVOX（tts.quest）などの外部サービスと、音声ファイルの事前生成は
今回やらないと決めた。Online Voice は、日本語の声が 1 つも無い端末が
あるため残す。

## やったこと

`player.html`:

- ヘッダーの 2 択トグルボタン（`toggle-voice-engine-btn`）を
  プルダウン `<select id="voice-select">` に置き換えた。選択肢は
  `Online Voice` / `Web Speech (自動)` / 端末の日本語音声の名前
- `applyVoiceEngine()` が `speechSynthesis.getVoices()` から `ja` / `JP` の
  声だけを拾って `<option>` を並べ直す。`getVoices()` は空で返ることが
  あるため `onvoiceschanged` からも呼ぶ
- 選択は `ytSlidePlayer.voiceEngineMode` と、新しい
  `ytSlidePlayer.voiceName` に保存する。覚えている声が端末に無ければ
  `Web Speech (自動)` に戻す。**ただし声が 1 つも取れていないときは
  まだ揃っていないだけなので、覚えている名前を消さない**（reviewer の指摘）
- 読み上げ時、選ばれた名前に一致する声があればそれを使い、無ければ
  従来の自動選択にフォールバックする
- 音声エラー通知の「音声エンジンを切り替える」は、プルダウンの値を
  もう一方（`online` ⇔ `auto`）に変えて `change` を発火させる

`docs/Developer.md` は設定の表・読み上げの節・失敗通知の節を、
`docs/User.md` は「読み上げの声を選ぶ」の節を足して実装に合わせた。

## 確かめたこと

ヘッドレス Chromium（Playwright 1.63.0）で `player.html` を `file://` で
開き、`speechSynthesis` を偽物に差し替えて測った（verifier）。計測
スクリプトは `archives/agents/TODO-091/check-voice-select.js`。

- プルダウンに並ぶのは `online` / `auto` ＋ 日本語の声だけ。与えた
  `Google US English`（`en-US`）は出ない
- `getVoices()` が起動直後は空で、後から `onvoiceschanged` が発火した
  場合でも選択肢が並び直し、**覚えていた声（`Google 日本語`）が復元される**
- 選択の保存と再読み込みでの復元、端末に無い声を覚えていたときの
  `auto` への戻り、「音声エンジンを切り替える」での `online` ⇔ `auto`、
  `localStorage` を使えない状態での無例外動作、コンソールエラー無しを確認

詳細は `archives/agents/TODO-091/`（reviewer・verifier の報告）にある。

## 分担の振り返り

- **reviewer が要修正 1 件を見つけた。** 起動時の `applyVoiceEngine()` が
  「`getVoices()` がまだ空」と「端末にその声が無い」を区別できておらず、
  覚えていた声をその場で消していた。項目の主目的（次に開いたときの復元）が
  そのまま壊れる箇所で、テストが通ることを見ても捕まらない種類の欠陥
- **verifier は reviewer の指摘の修正点を実測で確かめた。** `speechSynthesis`
  への単純代入では差し替えが効かず（アクセサプロパティのため）、
  `Object.defineProperty` が要ることも実測で分かった。これに気づかないと
  「声が 1 つも無い端末」だけを測ることになっていた
- **見込みと食い違ったのは main のモデル**（見込み Sonnet 5、実施 Opus 5）。
  担当の構成は見込みどおりで、実装を implementer に分けなかった判断も
  変える必要は無かった（1 ファイルの差分 67 行）
- **次に同じ規模（1 ファイル・挙動が変わる・端末依存で自動確認が効きにくい）を
  やるなら、同じく reviewer → verifier の順で組む。** 実装は main のまま
  でよい。ただし verifier への依頼に「`speechSynthesis` の差し替え方」まで
  書かず手段だけ指定したため、差し替えの罠に当たって手戻りが出た。
  ブラウザ API を偽装させる依頼では、**偽装が効いていることを先に 1 つ
  測らせてから本題に入らせる**と短くなる
