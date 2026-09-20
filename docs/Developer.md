# player.html を直す人へ

**同じ内容をスライドでも見られる**（`player.html?slides=developer`）。

再生エンジン `player.html` を直すときに、先に知っておきたいことをまとめる。
**スライドを足したい・作りたいだけなら [User.md](User.md) を読む。**
こちらを読む必要はない。

## リポジトリの構成

| ファイル | 役割 |
|----------|------|
| `player.html` | 外枠の HTML・CSS と再生ロジック。本体 |
| `slides/<名前>.js` | スライドデータ。`readme`・`user`・`developer`・`claude-memo`・`template` |
| `images/` | スライドに貼るビットマップ画像。パスは `player.html` から見た相対 |
| `tools/measure-duration.py` | 読み上げ秒数の測定と `duration` への書き込み |
| `tools/test_measure_duration.py` | 書き込みと置換表の読み込みの自動確認 |

**ビルドも依存関係のインストールも不要。**
（`tools/` のスクリプトだけは前提が要る。[README の「必要なもの」](../README.md#必要なもの)）
テストは `tools/test_measure_duration.py` だけ。`duration` の書き込み確認を見る
（`python3` だけあれば十分）。Tailwind・Google Fonts・FontAwesome は CDN から
読み込む（オフラインでは崩れる）。`public_html/` に置くため、ファイルを置くだけで
公開される。

確認はブラウザで `player.html` を開くだけ。

### 場所を選ばない

`player.html` がローカルを指すのは `slides/<名前>.js` だけで、相対パス。
残りはすべて CDN の https。
**`player.html` と `slides/` を同じディレクトリに置くと、`public_html/` の外でも
動く**。

手元で試すなら:

```bash
python3 -m http.server 8000
# => http://localhost:8000/player.html
```

- **`file://` で直接開くのは試していない。** `document.write` で追加した相対
  `<script>` の読み込みと、外部への音声要求はブラウザ制限に当たる可能性がある。
  HTTP 配信が確実。
- **ネット接続が必要。** Tailwind・Google Fonts・FontAwesome・読み上げの音声を
  外部から取得するため、オフラインでは崩れ、音声も出ない。
- 公開 URL を変えたくない場合、元の場所にリダイレクトまたはシンボリックリンクを残す。

## 全体の作り

**HTML → `slideData` → 再生ロジック** の 3 段。データは別ファイルに分かれている。

`player.html` は `?slides=<名前>` から `slides/<名前>.js` を読み込む
（既定は `readme`）。読み込みは `</main>` 直後の `document.write` で、
**再生ロジックの `<script>` より前に実行する**。その下の `<script>` は
読み込み時点で `slideData` を参照するため、順番を変えると動かない。
スライド一式が読めなかった場合、白画面にせず理由を表示して `throw` で停止する。

`slideData` の各要素は `{ title, duration, narration }` に、
`render()` か `body`（見出しのアイコンは `icon`）が付く。
`render()` があればそれを呼び、無ければ `title` と `icon` から見出しを
作って `body` を枠で包む。
スライド番号は持たず、並び順から計算する（TODO-048）。
各キーの意味は [User.md](User.md) にある。

## 再生ロジック

`requestAnimationFrame` の `playbackLoop` が経過時間を進め、`duration` が
尽きたら次のスライドへ進む。ただし**実際のスライド送りは読み上げの終了
イベントで起きる**。`duration` を待ち時間として使うのは消音中と音声が
再生できなかったとき（`onerror`・`play()` の拒否）だけ。

### 時間軸に `BASE_SPEED_MULTIPLIER` を掛けない

進行バーと時間表示は**実時間**（`deltaTime * playbackRate`）で進む。
**`BASE_SPEED_MULTIPLIER` は読み上げの速度だけに掛かる**
（`playbackRate * BASE_SPEED_MULTIPLIER`）。時間軸にも掛けると、
バーだけが先行して `duration` で頭打ちになり、読み終わりまで止まって見える。

音声が `duration` より長い場合、バーは 100% のまま読み終わりを待つ。
これは仕様。Web Speech に切り替えると音声の長さが変わるため、
バーとは必然的にずれる。

### `duration` は実測値

`duration` には **Online TTS の音声を `BASE_SPEED_MULTIPLIER` 倍で再生した
実測秒数**を入れる。`slides/claude-memo.js` の 17 枚は `ffprobe` で測定し、
入れた値（合計 324 秒）で、目分量ではない。

**読み置換表を変えると読み上げの長さも変わる。**
対象スライドの `duration` を測り直す。測定には
`tools/measure-duration.py` を使う（`--slides <名前>` でスライド一式を指定、
下書き確認は `--text`）。**`--write` を付けると、測定値を
そのスライド一式の `duration` に書き込む**（TODO-050、TODO-051）。
ナレーション編集後は
`tools/measure-duration.py --slides <名前> --all --write` でまとめて更新できる。

置換表は `player.html` と同じものを `player.html` の `SPEECH_RULES` と
スライド一式のファイルから読み込むため、複製ではない（TODO-054）。ただし **`TTS_MAX_CHARS` と
`BASE_SPEED_MULTIPLIER` は `player.html` と同じ値**なため、どちらか一方を変えたら
もう一方も変える。片方だけ変えると測定値が実際とずれる。

## 再生の設定を覚える

再生速度・字幕・音声エンジン・待ち秒数は `localStorage` に覚え、
読み込み時に復元する。スライド一式（`?slides=`）ごとには
分けず、全体で 1 組の設定を使う。

| 設定 | 変数 | 保存キー | 既定値 |
|------|------|----------|--------|
| 再生速度 | `playbackRate` | `ytSlidePlayer.speed` | `1` |
| 字幕 | `showCaptions` | `ytSlidePlayer.showCaptions` | `false` |
| 音声エンジン | `voiceEngineMode` | `ytSlidePlayer.voiceEngineMode` | `online` |
| 待ち秒数 | `pauseSeconds` | `ytSlidePlayer.pauseSeconds` | `2` |

読み書きは `loadSetting()` / `saveSetting()` に集約し、`try`/`catch` は
その中だけに書く。`localStorage` が使えない環境（プライベートウィンドウ、
`file://`、サイトデータを止めている環境）でも落とさず既定値で動く。
保存した値も信用せず、`loadSetting()` に渡す `valid` 関数でプルダウンの
選択肢や想定する値かどうかを確かめ、外れていれば既定値に戻す。

字幕・音声エンジンの見た目の反映は `applyCaptions()` / `applyVoiceEngine()`
にまとめてあり、クリックハンドラと起動時（`startApp()` 内、
`renderSlide(0, true)` の前）の両方から呼ぶ。同じ見た目の指定を
複製しないため。

## 読み上げ

2 系統を `toggle-voice-engine-btn` で切り替える。既定は `online`。

| モード | 実装 | 制限 |
|--------|------|------|
| `online` | Google Translate TTS の URL を `Audio` で再生 | `TTS_MAX_CHARS` で分割 |
| `speech` | Web Speech API（`SpeechSynthesisUtterance`） | 長い発話が途中で切れる |

`narration` は `prepareSpeechText()` を通してから読み上げられる。置換表は
**スライド一式の `slidesConfig.rules` が先、`player.html` の `SPEECH_RULES` が後**
の順に適用される。方法は `docs/User.md` の「読みを直す」にある。

どちらにも安全タイマーがある。読み終わりのイベントが来ない場合に備える。

- **Web Speech**: 文字数から計算
  （`textToSpeak.length / SPEECH_CHARS_PER_SECOND / getEffectiveSpeed()`）。
  Web Speech は読み終わりのイベントが来ないことがある。
- **Online TTS**: 音声の実長（`loadedmetadata` で取得。失敗時はスライドの
  `duration`）に `TTS_END_MARGIN_MS` を足した時点で進む。

### 副作用のある実装

次の 3 つは実機で音声が出なくなった原因。理由を知らずに「整理」すると再発する。

- **`Audio` 要素（`fallbackAudioElement`）は 1 個を使い回す。**
  再生ボタンのクリック内で unlock しているため、`null` にして作り直すと
  Android Chrome で自動再生がブロックされ、音声が出なくなる。
- **Web Speech は `splitForSpeech()` で `maxLen` の既定値分に分けて順に読ませる。**
  Chrome（PC・Android 両方）は長い発話を 15 秒ほどで打ち切る。1 つにまとめると
  途中で切れる。
- **`<meta name="referrer" content="no-referrer">` を外さない。**
  Google Translate TTS は Referer 付きの要求に 404 を返すため、外すと
  Online TTS が出なくなる。

## レイアウト

### 拡大縮小は container query

`.video-viewport` が `container-type: inline-size` で、`render()` 内は
`cqw` と `clamp()` で書く。**`px` や `rem` の直書きは 16:9 を縮めたときに
崩れる。**

### 狭い画面とタッチ画面は別系統

**幅 768px 未満とタッチ画面は container query とは別の経路で縮小する。**
条件は `@media screen and (max-width: 767.98px), screen and (pointer: coarse)`。

タッチ画面を条件に加えた理由：横持ちスマホ（844x390 など）が幅 768 以上で
PC 扱いになり、レターボックス内では `clamp()` の下限 px が効いて本文が
縮まず、枠内上部に重なるため。**フルスクリーン中に限らず、タッチ画面なら
通常表示でも別経路に入る**（タブレット・タッチ対応 PC も同じ）。

この経路では、`#viewport-frame` が 16:9 の外枠になり、`setupViewportScale()`
が `--vp-scale` を設定して `#player-viewport`（内容は 960x540 のまま）を
`transform: scale()` で縮小する。

**縮小されるのは枠内のすべてで、`cqw` や `clamp()` で書いていない固定 px の
ものも例外ではない。** 幅 768px 未満では `md:` が効かない
（`md:` は `min-width: 768px`）ため、枠内のクロームは `text-xs` など
小さい方が選ばれ、それがさらに `--vp-scale`（0.34〜0.77）倍される。実際、
枠上の `SLIDE nn / NN` は 390px 幅で約 5px になる。補助情報のため、
**読めなくてよいものとして残している。**

### 字幕バナーだけは枠の外

`#subtitle-banner` は `#viewport-stage` 直下にあり、**縮小されない**。
枠に重ねず、**画面幅に関わらず枠の下に配置**（全文を表示するため、重ねると
スライドを隠してしまう）。

通常表示はクラスの `mt-3` で十分なため、CSS に書いているのは擬似
フルスクリーン中の位置（`position: absolute; top: 100%`）だけ。ラッパーが
レターボックスそのものなため、`top: 100%` がそのまま枠の下端になる。

### 擬似フルスクリーン

レターボックスは `#viewport-stage.is-fullscreen` だけが持ち、**高さの基準は
`100dvh`**（`vh` は dvh 非対応ブラウザ用に残してある）。スマホの
`100vh` は URL バーを含むため、`vh` のままだと横持ちで箱が画面下へ
はみ出す。

内容（`.video-viewport.pseudo-fullscreen`、縮小経路では `#viewport-frame`）
も字幕も、このラッパーを基準に配置。**比率とサイズの変更は
ここ 1 か所だけ。**

字幕はフルスクリーン中、`top: 100%` で枠下（暗幕上）に表示。

### `body.fs-lock` と暗幕

裏のスクロール禁止（`body.fs-lock`）と暗幕（`::before`）は
**幅 768px 未満または `(pointer: coarse)` のときだけ**掛ける。

マウス PC で裏をスクロール禁止にするとスクロールバーが消え、裏ページ全体が
スクロールバー幅ぶん、`100vw` 基準のレターボックスがその半分だけ横にずれる
（実測で約 3px。比率によっては掛けた方が正しい位置になる）。タッチ画面を
条件に加えた理由：横持ちスマホが幅 768 以上で PC 扱いになり、
**フルスクリーンから抜けられなくなる**ため。

暗幕をタップするとフルスクリーンを終了。ハンドラは `#viewport-stage` の
click で、`e.target` がラッパー自身のときだけ応答する（枠内や字幕の
タップでは閉じない）。

**暗幕の帯の幅は画面比率で決まる。** 16:9 ちょうどの画面では帯が 0px に
なり、タップでの終了口がない。**これは対応しないと決めている**
（キーボードとボタンからは終了できる）。

## 直書きしない値

- **スライド枚数を書かない。** `total-slides` と `playlist-count` は
  `initPlaylist()` が `slideData.length` で埋める。
- **総時間を書かない。** `total-time-display` の初期値は `--:--` で、
  `initPlaylist()` が `duration` の合計で上書きする。

---

個々の変更の経緯（条件式の理由、試した内容）は
`archives/todo/` に 1 件 1 ファイルで記録されている。
