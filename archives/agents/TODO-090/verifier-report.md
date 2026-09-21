# TODO-090 実測報告

## 環境・手段

- リポジトリのルートで `python3 -m http.server 8791` を立て、
  `http://localhost:8791/player.html?slides=_test-duration`（および
  `_test-duration-omit`）を Playwright（Chromium、node、ビューポート
  1280x720、`--autoplay-policy=no-user-gesture-required`）で開いた。
- オンライン TTS（`voiceEngineMode='online'` 既定）は**この環境から
  実際に鳴った**（`translate.google.com/translate_tts` への音声再生が
  `onended`／`onplaying` を実際に発火し、下記の数値どおりに動いた）。
  代替エンジンへ逃げる必要は無かった。
- 計測用スライドは 2 本、一時的に置いた（**測定後に削除済み**、下記参照）。
  - `slides/_test-duration.js`：2 枚。
    - slide 0 "under"：`duration: 2`（実測より大きく下振れ）、ナレーションは
      「このプレゼンでは、player.html を触らずに自分のスライドを作成する
      手順をご紹介します。」（長め、実測 5〜6 秒程度）
    - slide 1 "over"：`duration: 40`（実測より大きく上振れ）、ナレーションは
      「これはテストです。」（短め、実測 2 秒程度）
  - `slides/_test-duration-omit.js`：1 枚。`duration` キーを省略。
    ナレーション「これは省略のテストです。」
  - **重要な副作用**：最初、3 枚（under / over / omit）を 1 つのファイルに
    まとめて試したところ、`duration` を省略した 1 枚が混ざっているだけで
    **その回だけでなくファイル全体**の `current-time-display` /
    `total-time-display` / 進行バーが常に壊れた（後述）。これは
    `recalcTimeline()`（`player.html:657-668`）が `slideData` 全体を
    `reduce` 的に積算するため、1 枚でも `duration` が `undefined` だと
    `NaN` が全体の合計（`totalDurationSeconds`）に伝播するため。
    この汚染を避けるため、後半は omit 用のファイルを分けて測り直した。
- 計測スクリプトは 1 本にまとめて
  `archives/agents/TODO-090/measure.js` に残してある。
  `NODE_PATH=$(npm root -g) node archives/agents/TODO-090/measure.js <scenario>`
  で再実行できる（`scenario` は `audio-under` / `audio-over` / `muted` /
  `muted-rate` / `omit`）。Playwright はこのマシンではグローバル
  インストール（`npm root -g` 配下）にあり、このリポジトリの
  `node_modules` には無い。**再実行するには上記 2 本のスライドファイルを
  もう一度置く必要がある**（内容はこの報告に書いたとおり）。

生の実測ログ（`Date.now()`・`performance.now()` 付き）は
`/tmp/todo090-*.json` に残したが、セッション外の一時領域なので
消える可能性がある。以下に数値を転記する。

## 1. 音声あり、duration を大きく下振れ／上振れさせた場合

### 下振れ（duration=2、実際のナレーションは長め）

`page.click('#play-btn')` 直後（t≈823ms、tick は `performance.now()` 基準）
から記録：

| t (ms) | 進行バー | current-time | audioStatus |
|---|---|---|---|
| 823 | 0% | 0:00 | 停止中（クリック直後） |
| 1815 | 1.88% | 0:00 | 朗読中 (Online Voice) |
| 3815 | 6.23% | 0:02 | 朗読中 |
| 4815 | 8.41% | 0:03 | 朗読中 |
| 5815 | 8.70% | 0:04 | 朗読中 |
| 6815 | 8.70%（頭打ち） | 0:04 | **朗読完了** |
| 7906 | 8.70% | 0:04 | slide-num が 01→02 に変化 |

- 進行バーは `duration + pauseSeconds = 2+2 = 4` 秒ぶん
  （総尺 46 秒中 4/46 = 8.6956%）で**頭打ちになり、t=5815〜7906 の約 2.1 秒間
  そこに張り付いたまま動かなかった**。これは `player.html:1180-1188` の
  `currentSlideElapsedTime` が `slideSpan(currentIndex)` で頭打ちになる
  実装どおり。
- 一方、**スライドの送り自体は `duration` に引っ張られなかった**。
  実際の音声の `onended`（`朗読完了` になった時刻 t≈5815〜6815 の間）から
  `pauseSeconds`（2 秒）後の t=7906 で slide-num が変わった。つまり
  「進行バー・残り時間表示は `duration` どおりに頭打ちして止まって見えるが、
  実際に次へ送られるタイミングは実測の音声終了を待つ」という食い違いを
  実測で確認した。

### 上振れ（duration=40、実際のナレーションは短め）

renderSlide(1) 済みの状態で再生開始（t≈833、init は slide 0 の値を含むため
除外し、t=961 の slide-num-change=02 以降を見る）：

| t (ms) | 進行バー | current-time | audioStatus |
|---|---|---|---|
| 961 | 8.70% | 0:04 | slide-num→02 |
| 1953 | 10.62% | 0:04 | 朗読中 |
| 2953 | 12.79% | 0:05 | **朗読完了** |
| 4953 | 16.23% | 0:07 | **再生完了**（最終スライドとして停止） |
| 5953〜15953 | 16.23%（変化なし） | 0:07（変化なし） | 再生完了のまま |

- 実際のナレーションは 2 秒程度で終わり、`pauseSeconds` 2 秒を挟んで
  presentation は「再生完了」になった（全 2 枚構成のため最後のスライド）。
- しかし進行バー・残り時間表示は **duration=40 を元にした総尺 46 秒に対して
  16.23%（0:07）で永久に止まった**。実際には音声も再生も完全に終わっている
  のに、UI 上は「まだ 7 秒しか進んでいない」「まだ 39 秒残っている」ように
  見え続ける。`totalDurationSeconds` は `duration` の合計から固定で
  計算されるため、`duration` を上振れさせると再生完了後も進行バー・残り
  時間が実態と大きくずれたまま戻らないことを実測で確認した。

## 2. 消音中、送りの間隔が duration どおりになるか

### 消音のみ（duration=2、playbackRate=1.0 既定）

play → 直後に mute をクリック。t=830（slide-num→01, 実質 play 開始）から
t=4983（slide-num→02）まで **4153ms**。
`duration(2s) + pauseSeconds(2s) = 4000ms` に対し誤差 +153ms
（Playwright のクリック・スケジューリングのオーバーヘッド）。
`audioStatus` は `消音中` → 3826ms 時点で `朗読完了`（＝
`onSlideAudioFinished` が duration 分の `setTimeout` で呼ばれている）
→ 2 秒後の 4983ms で実際に送られた。**duration どおりに送られることを
実測で確認した。**

### 消音＋playbackRate 変更（速度プルダウン最速の `2`）

速度プルダウンの選択肢は実測で `['0.75', '1', '1.25', '1.5', '2']`。
最速 `2` を選び、duration=2 のスライドで play→mute。
t=833（play 開始）から t=3986（slide-num→02）まで **3153ms**。

- コードの実装（`player.html:917`）は
  `muteWaitMs = (slide.duration / playbackRate) * 1000` なので、
  期待値は `(2/2)*1000 = 1000ms`。
- 一方 `pauseSeconds` は `schedulePauseTransition` 内で
  `pauseSeconds * 1000` のまま使われ、`playbackRate` で割られていない
  （`player.html:892`）。期待値は `2000ms`。
- 合計期待値 `1000 + 2000 = 3000ms` に対し実測 3153ms（誤差 +153ms、
  上と同程度のオーバーヘッド）。
- つまり**消音中に速度を上げると、`duration` の待ちは速度に比例して
  縮むが、読了後の `pauseSeconds` の待ちは速度に関わらず一定**という
  実装どおりの挙動を実測で確認した。

## 3. duration を省略した場合

1 枚だけのスライドで `duration` キーを省略して再生：

| t (ms) | 進行バー | current-time | total-time | audioStatus |
|---|---|---|---|---|
| 850 (init) | '' (未設定) | NaN:NaN | NaN:NaN | 停止中 |
| 1850 | '' | NaN:NaN | NaN:NaN | 朗読中 |
| 3851 | '' | NaN:NaN | NaN:NaN | 再生完了 |
| 〜10850 | '' | NaN:NaN | NaN:NaN | 再生完了のまま |

- `current-time-display` と `total-time-display` は**常に `NaN:NaN`**。
- 進行バーの `style.width` は**一度も設定されない（空文字のまま）**。
  コード上は `progressBar.style.width = "NaN%"` を実行しているはずだが、
  `"NaN%"` は不正な CSS 値としてブラウザに無視され、インライン
  `style.width` が空のまま残ることを実測で確認した（見た目は幅 0 の
  ままのバーになる）。
- ナレーション自体（音声の再生と `朗読完了`／`再生完了` への遷移）は
  `duration` に依存しない経路（実音声の `onended`）で正常に進んだ。
  スライドが 1 枚しか無い構成では送りの異常（無限に送られない等）は
  確認できなかったが、**表示（残り時間・進行バー）は完全に壊れる**。
- 前述のとおり、`duration` を省略したスライドを**他の数値 duration の
  スライドと同じ `slideData` に混在させると、その汚染（`NaN`）が
  全スライド共通の `totalDurationSeconds` に伝わり、省略していない
  スライドの表示も含めて全体が壊れる**ことも実測で確認済み
  （最初の 3 枚構成の試行ログで、slide 0/1 も含めて
  `current-time-display` が常に `NaN:NaN`、進行バーが常に空になった）。

## 後片付け

- `slides/_test-duration.js` と `slides/_test-duration-omit.js` は
  計測後に `\rm` で削除済み。`git status --porcelain` で確認し、
  `archives/agents/TODO-090/`（このファイルと `measure.js`）以外の
  変更が無いことを確認した。
- 立てた `python3 -m http.server 8791` は計測後に `kill` 済み。

## 確かめられなかったこと・判断できないこと

- `docs/User.md:78` の「読み上げの実測値を入れる」という書き方を
  弱めてよいかどうかは**判断していない**。実測から言えるのは:
  - 音声ありの場合、**スライドが送られるタイミング自体**は実音声の
    `onended` に従うので、`duration` を大きくずらしても「早送り・
    置き去り」にはならない。
  - ただし **進行バー・残り時間・（消音時や TTS が使えない環境での）
    実際の送り間隔**は `duration` の値に直接左右され、大きくずらすと
    実測で確認した通り明確に破綻する（頭打ちで固まる／再生完了後も
    大きくずれた残り時間が残る／消音中は完全に duration 通りの間隔になる）。
  - `duration` を省略すると時間表示が恒久的に壊れる。
  これらの事実から「どこまで弱めてよいか」は利用者・管理者の判断が必要。
- オンライン TTS の応答時間はネットワーク状況に左右されるため、
  上記の実測値（特に「実際のナレーション長」）は**この 1 回の実行での
  値**であり、多少のばらつきはあり得る。ただし観察された定性的な
  パターン（頭打ち・停止後のずれ・NaN 化）は実装コードの読みと一致して
  おり、再現性は高いと考えられる（が複数回の再実行はしていない）。
