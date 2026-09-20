# TODO-074 verifier 報告

手段: `python3 -m http.server 8765` ＋ Playwright（headless Chromium、1280x720、CDN は読めた）。
`player.html?slides=user`（全 15 枚）。スクリプトはリポジトリに残していない。
変更ファイル: docs/Developer.md, docs/User.md, player.html（指示範囲内。archives/agents/TODO-074/ は未追跡）。docs の中身は今回見ていない。

1. 一致: ハッシュ無し → `currentIndex`=0、href `...?slides=user#1`、番号 `01`。
2. 一致: `#7` → href `#7`、idx=6、番号 `07`（`SLIDE 07 / 15`）、チャプター一覧の選択は 6 番のみ、シークバー thumb `39.2045%`・現在時刻 `1:09`。
3. 一致: `#0` `#-1` `#abc` `#7abc` `#999` `#` はすべて idx=0、番号 `01`、href は `#1` になる。
4. 一致: next→`#2`,`#3`、prev→`#2`、last→`#15`、first→`#1`、チャプター 5 番→`#5`、シークバー 60%→`#9`、左端→`#1`、キー →,→,←,End,Home→`#2,#3,#2,#15,#1`。各操作後 `history.length` は開始時と同じ、`?slides=user` は残る。
5. 一致: 速度 2.0x・待ち 1 秒で再生。20 秒間に idx 0→1→2、href `#1`→`#2`→`#3`、`history.length` 不変、`isPlaying`=true。（4 枚目以降は待っていない）
6. 一致: `#7` で開いて `reload()` → href `#7`、idx=6、番号 `07`。
7. 一致: `replaceState` が例外を投げる状態で next 2 回 → idx=2（番号 `03`。href は `?slides=user` のまま＝更新されないのは想定どおり）、pageerror なし。自動送りも idx 2→3→4 と進んだ。

食い違い: なし。未確認: Safari 固有の「30 秒に 100 回」制限（実機なし）。
