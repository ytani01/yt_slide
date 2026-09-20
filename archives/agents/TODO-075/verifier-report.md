# TODO-075 verifier 報告

## 検証方法

`python3 -m http.server 8791` でリポジトリルートを配信し、
`http://localhost:8791/player.html`（`?slides=` 省略、既定の `readme`、
10 スライド）を Playwright (chromium, 1280x800) で実測した。
スクリプトは `archives/agents/TODO-075/verify.mjs` に 1 本にまとめた。
コードは一切変更していない。

## 結果（一致したものは 1 行）

1. **保存と復元** 一致。速度 1.5・待ち 3・字幕 ON・音声エンジン `speech`
   に変えて `localStorage` に保存されることを確認し（
   `{"ytSlidePlayer.speed":"1.5","ytSlidePlayer.voiceEngineMode":"speech",
   "ytSlidePlayer.pauseSeconds":"3","ytSlidePlayer.showCaptions":"true"}`）、
   再読み込み後も UI（`speedSelectValue:"1.5"`, `pauseSelectValue:"3"`,
   `captionPressed:"true"`, `subtitleBannerHidden:false`,
   `speechStatusText:"Web Speech API"`）と内部変数
   （`playbackRate:1.5, pauseSeconds:3, showCaptions:true,
   voiceEngineMode:"speech"`）の両方が完全に一致して復元された。
2. **不正な保存値** 一致。速度 `"3"`・待ち `"99"`・音声エンジン `"bogus"`・
   字幕 `"yes"` を直接 `localStorage` に入れて再読み込みしたところ、
   すべて既定値（`speedSelectValue:"1", pauseSelectValue:"2",
   captionPressed:"false", speechStatusText:"Online Voice"`、内部値も
   `playbackRate:1, pauseSeconds:2, showCaptions:false,
   voiceEngineMode:"online"`）に戻った。空文字（`""`）4 種でも同じ結果。
3. **`localStorage` が使えない環境** 一致。`Object.defineProperty` で
   `localStorage` の getter を throw させた状態でも `#speed-select` の
   出現まで正常に読み込め（`loadedOk:true`）、`pageerror`・
   `console.error` は 0 件、値はすべて既定値で動いた。
4. **待ち秒数が尺に反映されるか** 一致。既定（待ち 2 秒、10 スライド）で
   `#total-time-display` は `2:00`（120 秒）、待ち 3 秒を保存して読み込むと
   `2:10`（130 秒）。差は 10 秒 = スライド枚数 10 × 1 秒で計算どおり。
5. **既存の挙動** 一致。復元後（速度 1.5・待ち 3・字幕 ON の状態から
   再読み込み）に、次へ（`0→1`）・前へ（`1→0`）・シークバー中央クリック
   （`0→4`）・プレイリスト 3 番目クリック（`→2`）がいずれも想定どおり
   `currentIndex` を動かした。再生開始で `isPlaying:true`。再生中に
   待ち秒数を 3→2 に変えると `#total-time-display` が `2:10→2:00` へ
   即座に更新された（`recalcTimeline()` が呼ばれている、実測で
   呼び出し回数 0→1 を確認）。再生中に速度を 1.0→1.5 に変えると
   `speakCurrentNarration()` の呼び出し回数が 1→2 に増え、呼び直されて
   いることを確認した（`archives/agents/TODO-075/verify.mjs` には未収録の
   使い捨てスクリプトで確認し、確認後に削除済み。関数をラップして
   カウントする簡易な計測）。

## 実機確認できなかったこと

- 実際の音声出力（TTS の音声そのもの）は聴取していない。再生環境に
  スピーカーが無く確認できなかった。
- ブラウザは chromium のみ。Firefox / Safari 系では確認していない。
- プライベートウィンドウでの実際の挙動（`localStorage` を明示的に
  disable した模擬環境のみで確認。実際のブラウザのプライベートモードは
  試していない）。

## 判断が要る点

- 実装の report にあった「`recalcTimeline()` の呼び出し順」の懸念は、
  実測（結果 4・5）で総時間表示が想定どおりに変わることを確認できたので、
  挙動としては問題なさそうに見える。ただしコードの実行順そのものの
  妥当性（懸念の当否）はコードレビューの領分と考え、ここでは踏み込んで
  いない。

## 変更されたファイル（指示との一致）

`git status --porcelain`:
```
 M docs/Developer.md
 M player.html
?? archives/agents/TODO-075/
```
implementer report が挙げた「`player.html` と `docs/Developer.md` の
2 ファイルのみ」と一致。`archives/agents/TODO-075/` は今回の分担作業の
成果物（implementer 報告 + このファイル + `verify.mjs`）で、TODO の
指示（分担の記録を残す）どおり。

TODO.md のチェックボックス 3 項目（覚える／コメント修正／文書追記）は
上記の実測とコード・文書の確認で、内容としてはすべて満たされていると
判断できる（チェックを入れるかどうかは管理者判断）。
