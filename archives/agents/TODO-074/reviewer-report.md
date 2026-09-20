# TODO-074 reviewer 報告

対象: `git diff`（player.html / docs/User.md / docs/Developer.md）。コードは直していない。
実測は Playwright + `/usr/bin/chromium`（headless）、`python3 -m http.server` 経由と `file://`。
測定スクリプトは scratchpad の `t.js` `t2.js` `t3.js`（リポジトリ外）。

## 要修正

なし（下の「検討」1 は判断待ち）。

## 検討

### 1. `player.html:1083` `replaceState` が例外を投げると再生が止まる（実害は未確認）

- 何が: `history.replaceState` を例外を投げる関数に差し替えて測った（Chromium の通常ページで、
  実環境の再現ではなく注入）。
  - 起動時: `renderSlide()` が `startApp()` 内で投げるので、次の行の `setupEventListeners()`
    まで到達しない。表示は出るが、次へボタンなどが全部効かない（`#next-btn` クリックで idx 変化なし）。
  - 自動送り（消音で駆動）: 1 枚進んだところで投げ、`isPlaying === true` のまま止まる
    （idx=2 で固定、`speakCurrentNarration()` 未到達で次の待ちタイマーも張られない）。
    投げない場合は 3 秒半で idx=3 まで進んだ。
- なぜ: `renderSlide()` 末尾に try/catch が無く、後続の処理（読み上げ・待ちタイマー）が
  この 1 行に巻き込まれる。既存コードは同種の副作用（`localStorage`、`Audio unlock`）で try を使っている
  （`unlockFallbackAudio` など。localStorage の実装は未確認）。
- 実環境で投げるか: `file://`（Chromium）は投げなかった（`#4` から起動・次へとも正常）。
  `sandbox="allow-scripts"` の iframe（opaque origin）も投げなかった（idx=2 で起動、pageerror なし）。
  Safari の「30 秒に 100 回超で SecurityError」は**未確認**（Safari 未検証）。
  矢印キー長押しやシーク連打が該当し得るかも未確認。実害は未確認。
- 判断: 境界線上。実装の判断は管理者。

## 好みの範囲

### 2. 起動時の `history.length` と URL

`#` 無しの URL で開くと、直後に `#1` が付く（実測: `?slides=readme` → `?slides=readme#1`）。
仕様どおり（TODO-074「書き換えるのは表示が変わるたび」）。履歴は増えない
（`replaceState`）。
`docs/User.md` の「番号が無い…ときは 1 枚目から始まる」と矛盾はしない。

### 3. `docs/Developer.md:124` の 1 行が長い

`renderSlide(startIndexFromHash(), true)` を差し込んだ結果、前後の行より長い。
他の段落は 40 字前後で折っている。行長規約は CLAUDE.md に無いので好みの範囲。

## 問題なしを確認したもの（実測。値は載せた）

### startIndexFromHash の境界（`?slides=readme`、10 枚）

| ハッシュ | 開始 idx | URL の結果 |
|------|------|------|
| なし / `#` / `#0` / `#-1` / `#abc` / `#7abc` / `#999` | 0 | `#1` |
| `#5%20` / `#+3` / `#3.5` | 0 | `#1` |
| `#99999999999999999999` / `#٣`（アラビア数字） | 0 | `#1` |
| `#3` / `#03` | 2 | `#3` |
| `#1` | 0 | `#1` |

`\d` は ASCII のみで、全角・アラビア数字も弾かれる。pageerror なし。

### renderSlide の呼び出し経路

`grep -n "renderSlide(" player.html` は 13 件（861, 1204, 1299, 1305, 1310, 1314, 1460, 1465, 1469,
1472, 1496, 1563）。全部 `renderSlide()` 経由でハッシュが追従することを測った:

- 起動 `#4` → idx=3, hash `#4`
- 次へボタン → `#5`。前へ 2 回 → `#3`
- キー: ArrowRight `#6` / ArrowLeft `#5` / Home `#1` / End `#10`
- シークバー（x=300）→ idx=3, hash `#4`, `currentSlideElapsedTime=5.15`
- チャプター一覧の 7 番 → `#7`
- 自動送り（消音、duration 1 秒）: `#2` → `#4`
- 再読み込みで `#7` の枚に戻る
- 履歴は増えない（ボタン・キー・シークの操作後も `history.length` は変わらず 2 のまま）

### 起動順序（1 枚目以外から始めたとき）

`#5` から起動して、`progressBar.style.width = 43.3333%`（期待値 `slideStartTimes[4]/total*100 = 43.3333`）、
`currentSlideElapsedTime = 0`。`#3` は 23.3333%、`#7` は 62.5%。
`initPlaylist()` は `currentIndex === 0` の時点で項目を作るが、直後の `renderSlide()` 内の
`updatePlaylistSelection()` が選択状態を直すので崩れていない。
（`#5` 起動時のプレイリスト選択状態は className で判定しようとして取れなかった。
**選択の見た目は未確認**。進行バー・番号表示・elapsed は確認済み。）

### 手で書き換えたハッシュ

`location.hash = '#2'` としても表示は追従しない（idx=9 のまま）。次に `renderSlide()` が走るまで
URL と表示がずれる。docs（Developer.md）に「`hashchange` は聞かない」と明記済みで整合。
User.md にはこの点の記述が無い（利用者向けなので不要と判断。検討には入れない）。

### docs と実装の整合

- User.md: 「1 始まり」「自動送りでも追従」「再読み込みで同じ枚」「番号が無い・範囲外・数字でない
  ときは 1 枚目」→ すべて実測と一致
- Developer.md: 「`renderSlide()` の末尾」「`replaceState` で履歴は増えない」「クエリはそのまま」
  「`#` 直後が数字だけ」「0 以下・枚数超過は 1 枚目」「`hashchange` は聞かない」→ すべて一致
  （クエリ保持は URL に `?slides=readme` が残ることで確認）
- docs に TODO 番号は書かれていない（CLAUDE.md の規約どおり）。player.html のコメントには
  `TODO-074` が入っているが、他のコメントと同じ形。
- Developer.md 123-124 行目の `renderSlide(startIndexFromHash(), true)` は player.html:1563 と一致

### テスト

このリポジトリの自動テストは `tools/` の 2 本だけで、`player.html` のテストは無い。
テストの追加は要求されていないので指摘しない。

### 範囲

指示に無い変更は見当たらない（差分は 3 ファイルのみ）。
