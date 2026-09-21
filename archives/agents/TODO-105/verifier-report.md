# TODO-105 verifier 報告

## 結果

CLI とコピー方式の手順を空の一時ディレクトリで再現し、リンク、指定サイズの表示、
スライド送り、最小例一文の Online Voice 再生状態を確認した。音声そのものは聴取していない。

## 実施条件

- 実施日: 2026-09-22
- 作業場所: `/tmp/todo105-kzxdsohk`（スクリプト実行ごとに新規作成）
- 実行スクリプト: [`verifier_playwright.py`](verifier_playwright.py)
- 確認担当: verifier（Codex、実装担当とは別）
- `git status --short` と `git diff --stat` を実行し、変更は TODO-105 の実装差分とこの担当のファイルだけであることを確認した。実装側のファイルは変更していない。

## 手順の再現

コピー方式では `player.html`、`slides/template.js`、最小例の `slides/sample.js` を
空の一時ディレクトリへ置いた。その後 `uv run ytslide init` を実行すると終了コード
0で、既存の `player.html` と `template.js` は「すでにある」と表示され、`index.html`
が生成された。続く `uv run ytslide index` も終了コード0で、`index.html: 2 件の
スライドを書いた` となった。最小例の `slidesConfig.summary` と `icon` が無いため、
警告が2件出たが、生成は成功した。

CLI方式でも `uv run ytslide init` は終了コード0で `player.html`、`index.html`、
`slides/template.js` を生成し、最小例を追加後の `uv run ytslide index` も終了コード0
だった。コピー方式から後で CLI を使う指摘事項は、実際のコマンド列で解消を確認した。

最小例はこの報告用スクリプトが `docs/User.md` の「最小の例」コードブロックから
抽出して保存した。コピー方式で `init` を実行する前後の SHA-256 は次のとおりで、
`player.html` と `slides/template.js` は上書きされなかった。

- `player.html`: `da0a007452cdb4f48f46edd4805e3ccfc3dd8e947f5e410ab7aa640a812f01a6`
- `slides/template.js`: `cae7cb4f2ed5d0a9ac73d3355de281d568563db940d38584374fcff4e9031c24`

## README/User.md のリンク

README.md と docs/User.md の Markdown リンクを抽出し、外部 URL を除く相対リンクの
ファイル存在と見出しリンクの一致を確認した。README から User.md、Developer.md、
LICENSE、および User.md の各見出しへのリンク、User.md 内の README.md、Developer.md、
自身の見出しへのリンクはすべて解決した（該当リンク全件で `file=True anchor=True`）。

## ネットワーク

次の取得を各10秒上限で実行した。

- ZIP: `curl --max-time 10 -L -sS ...main.zip`、HTTP 200、3,298,313 bytes
- raw Markdown: `curl --max-time 10 -sS .../docs/User.md`、HTTP 200、31,679 bytes

Playwright スクリプト内の sandbox 実行では DNS が使えず、同じ2 URLが
`URLError: <urlopen error [Errno -3] Temporary failure in name resolution>` になった。
権限付きの curl では上記のとおり取得できた。

## ブラウザ・音声

指定の 1280x720 と 390x844 で、headless shell を使い、表示用 CDN（Tailwind、Font
Awesome、Google Fonts）だけを許可し、TTS などその他の通信を遮断して確認した。
再生ボタンは押していない。`sample`、変更された `readme` と `user` の1・3枚目は
すべて読み込めた。各測定で `#slide-canvas` 内の表示要素が枠外に出た件数は 0 件だった。

| viewport | 対象 | 実測タイトル | 欠け | 送り操作 |
|---|---|---|---:|---|
| 1280x720 | sample 1 | `1. はじめに` | 0 | 対象外 |
| 1280x720 | readme 1/3 | `1. yt_slide` / `3. すぐ試す` | 0 / 0 | 1→2→1 成功 |
| 1280x720 | user 1/3 | `1. player.html で別のスライドを作る` / `3. 準備する` | 0 / 0 | 1→2→1 成功 |
| 390x844 | sample 1 | `1. はじめに` | 0 | 対象外 |
| 390x844 | readme 1/3 | `1. yt_slide` / `3. すぐ試す` | 0 / 0 | 1→2→1 成功 |
| 390x844 | user 1/3 | `1. player.html で別のスライドを作る` / `3. 準備する` | 0 / 0 | 1→2→1 成功 |

当初の通常 Chromium 起動では sandbox 内外とも起動直後に次で終了した。

```text
TargetClosedError: BrowserType.launch: Target page, context or browser has been closed
ERROR:third_party/crashpad/crashpad/util/linux/socket.cc:45] setsockopt: Operation not permitted (1)
process did exit ... signal=SIGTRAP
```

通常 Chromium の権限昇格は、ローカル本文を Online Voice へ送信し得るため自動審査で
拒否された。headless shell の権限昇格では、上記のとおり TTS を遮断した安全な表示確認を
完了した。

音声については、許可された `/tmp/todo105-sample-audio.py` を独立に実行した。送信した
本文は最小例の一文「これはサンプルのスライドです。」だけで、他の本文は送信していない。
Online Voice の `duration` は **2.784 秒**、`currentTime` は
`0.417315 → 1.138821 → 1.835105 → 2.532764 → 2.784` 秒と進み、状態は
`朗読中 (Online Voice)` → `朗読完了` → `再生完了`、`paused=false` から `true`、
`error=null` だった。音声ファイルを実際に聴取した確認ではない。

## 判断が必要な点

表示・送り確認に残る判断事項はない。音声は実測値と状態遷移を確認したが、音声ファイルを
実際に聴取した確認ではない。
