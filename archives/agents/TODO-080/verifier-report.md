# TODO-080 verifier 報告

## 検証方法

`python3 -m http.server 8765` でリポジトリ直下を配信し、
`archives/agents/TODO-080/verify.py` で Playwright（Python, chromium,
headless, `/usr/bin/chromium`）から `http://localhost:8765/player.html?slides=user`
（スライド数 14）を操作した。スクリプトは終了コード 0（全項目 pass）。
生の JSON は `/tmp/todo080-verify.json` に残っている（archives には未保存）。
検証後、サーバーは停止済み。

## 結果（すべて一致）

1. ボタンの並び: DOM 順・`getBoundingClientRect().x` の昇順とも
   `first-btn, prev-btn, play-btn, next-btn, last-btn` で一致（x = 41, 89, 137, 193, 241）。
2. `#first-btn` で index 0、`#last-btn` で index 13（`slideData.length - 1` = 13、
   `#total-slides` = 14）に一致。2 枚進めてから戻して確認。
3. Home / End キー（`body` に blur してから押下）でも同じく index 0 / 13 に到達。
4. 先頭で `#first-btn` を 2 回、末尾で `#last-btn` を 2 回押しても index は
   変わらず、`page.on("pageerror")` の捕捉は 0 件のまま。
5. 再生中（`#play-btn` を押した状態）に `#next-btn` `#last-btn` `#first-btn` を
   それぞれ 1 回押したときの `translate.google.com` へのリクエスト数は
   いずれも 1 件（next=1, last=1, first=1）。旧 `restart-btn` のような二重呼び出しは無い。
6. 幅 390px で 5 ボタンとも `is_visible()` = true、矩形の重なり無し、
   実際にクリック（`click()`）してもエラー無し。
7. 操作ガイドの `#operation-guide` テキストに
   `Home / End　先頭／最後のスライド` の行が含まれる。
   `grep -n "restart\|最初から" player.html` は 0 件（一致無し）。
   `document.body.innerText` にも「最初から」は含まれない。

全 15 チェック中 15 件 pass（詳細は上記の JSON、`/tmp/todo080-verify.json`）。

## 変更ファイルの範囲

`git status --porcelain` は下記のみ:

```
 M player.html
?? archives/agents/TODO-080/
```

指示どおり `player.html` のみの変更で、範囲は一致している。

## 確かめられなかったこと・判断できないこと

- ネットワーク接続は取れ、TTS リクエスト（`translate.google.com`）・
  Tailwind・FontAwesome の読み込みは正常に行えた。取れなかった項目は無い。
- 「見なくてよい」とされたレイアウトの見た目（余白・フォント）、
  `docs/` `slides/` の中身、TODO-080 以外の既存機能は確認していない。
- TTS リクエストが実際に音声として鳴ったか（音声の中身の妥当性）までは
  確認していない。リクエストが 1 回発行されたことのみ確認した。
- reviewer によるコードレビュー（挙動変更の妥当性）は本報告の対象外。
