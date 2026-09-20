# TODO-075 reviewer 報告

対象: `git diff`（`player.html`・`docs/Developer.md`）、
`archives/agents/TODO-075/implementer-report.md`。コードは直していない。

## 検討

- **`docs/Developer.md:106` の `（TODO-075）`。** プロジェクトの
  `CLAUDE.md`「個々の変更の経緯は `archives/todo/` にある。`docs/` は
  利用者向けなので TODO 番号を書かない。番号で参照してよいのはこのファイルと
  `archives/` の中だけ。」に照らすと、`docs/` への TODO 番号記載は文面上の
  規約に反する。ただし `docs/Developer.md` には本 diff 以前から
  `TODO-048`・`TODO-050`・`TODO-051`・`TODO-054` の 4 件が既に書かれており
  （`git log -S` で確認、いずれもこの規約が入った commit 35fd841 より後の
  commit）、この diff は既存の慣行に倣った形。新規に規約を破ったというより、
  ファイル全体で規約と実態がずれている状態が続いている。この 1 件だけを
  直すか、他 4 件も含めて扱いを決めるかは管理者の判断が要る。

- **起動時の `recalcTimeline()` 二重呼び出し。** `player.html:637` で
  `pauseSeconds` の既定値（2）のまま 1 回計算し、`player.html:724` で
  復元後の値により再計算している。637〜724 行の間に `totalDurationSeconds`・
  `slideStartTimes` を読む処理は無い（DOM 要素キャッシュと関数定義のみ）ため、
  最終的に使われる値は正しい。ただし 1 回目の呼び出しは無駄で、後から読む
  人が「復元前に計算している」と誤解しやすい。実害は無いと考えられるが、
  ブラウザでの実測はしていない（verifier に委ねる）。implementer 自身が
  この点を「判断が要る点」として挙げている。

## 問題なし（1 行）

1. **4 設定の保存・復元。** 速度・字幕・音声エンジン・待ち秒数の 4 つとも、
   保存（`saveSetting` 呼び出し）と復元（`loadSetting` → 変数代入 →
   `speedSelect.value`/`pauseSelect.value`/`applyCaptions()`/
   `applyVoiceEngine()`）が揃っている。漏れなし。
2. **`localStorage` の例外対策。** `try`/`catch` は `loadSetting`/
   `saveSetting` の 2 関数の中だけにまとまっており、他の箇所に直接
   `localStorage` を呼ぶコードは無い（`grep` で確認）。
3. **保存値の検証。** 速度・待ち秒数はプルダウンの `option.value` 一覧
   （`SPEED_OPTIONS`/`PAUSE_OPTIONS`）との照合、字幕は
   `'true'`/`'false'` 以外を弾く、音声エンジンは `'online'`/`'speech'`
   以外を弾く。空文字・`null`・範囲外の値はいずれも既定値へフォールバック
   することをコードを読んで確認した（`raw === null` チェックと各 `valid`
   関数の組み合わせ）。
4. **復元のタイミング。** 待ち秒数は `startApp()`（＝最初の `renderSlide`・
   `initPlaylist` の `totalTimeDisplay` 表示）より前に反映されている。
   字幕・音声エンジンの見た目反映は `applyCaptions()`/`applyVoiceEngine()`
   に一本化され、起動時（`startApp()` 内）とクリック時の両方から同じ関数を
   呼んでおり、食い違いは無い。
5. **既存の分岐・挙動。** `speakCurrentNarration()` の呼び直し
   （音声エンジン・速度のクリックハンドラ内）、`recalcTimeline()` と
   `currentSlideElapsedTime` のクランプ（待ち秒数変更ハンドラ）、
   `schedulePauseTransition()` の呼び直しは、いずれも既存の条件式のまま
   変更されていない（差分で確認）。
6. **重複の切り出し。** 字幕・音声エンジンの見た目反映コードは
   `applyCaptions()`/`applyVoiceEngine()` に一本化され、クリックハンドラ側の
   重複は残っていない。
7. **保存キーの綴り。** `player.html` の `SETTINGS_KEY_PREFIX +
   {'speed','showCaptions','voiceEngineMode','pauseSeconds'}` と
   `docs/Developer.md` の表（`ytSlidePlayer.speed` 等 4 件）を 1 文字ずつ
   突き合わせ、一致を確認した。
8. **日本語の書き方。** 新規コメント・`docs/Developer.md` の追記とも
   簡潔で、直訳調や造語は見当たらない。
9. **範囲。** `git status` は `docs/Developer.md`・`player.html`・
   `archives/agents/TODO-075/`（報告ファイル）のみ。指示に無い変更は無い。
10. **命名・置き場所。** `applyX`/`loadSetting`/`saveSetting` の命名や
    `UPPER_SNAKE` の定数（`SETTINGS_KEY_PREFIX`/`SPEED_OPTIONS` 等）は
    既存のファイル内の命名慣行（`BASE_SPEED_MULTIPLIER` 等）と揃っている。

## 実測していないもの

- 実際のブラウザでの `localStorage` 読み書き、値を壊したときのフォールバック、
  待ち秒数反映の見た目（尺表示・進行）は見ていない。verifier に委ねる。
