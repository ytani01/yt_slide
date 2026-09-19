# TODO-059 verifier-report

対象: 「HTML 1 枚で動く」→「ファイル 3 つを置くだけで」への言い換え
（`README.md`・`slides/readme.js` の 6 箇所）と `duration` の測り直し。

## 1. grep で残存確認

```
$ grep -rn "HTML *1 *枚\|HTML1枚" --include="*.md" --include="*.js" . | grep -v "^./archives/"
TODO.md:10:## TODO-059. 「HTML 1 枚で動く」という誤りを直す
TODO.md:19:**動かすのに要るのは 3 ファイル**で、「HTML 1 枚」は事実ではない。
TODO.md:56:「HTML 1 枚で動く」という記述を直すことになった。**戻せば 2 ファイルになる。**
```

残っているのは `TODO.md`（項目の説明）のみ。対象の `README.md`・`slides/readme.js`
には残っていない。OK。

## 2. 対象外ファイルが変わっていないこと

```
$ git diff slides/user.js
（差分なし）
```

`slides/user.js` は差分無し。

`README.md` の差分は 1 箇所のみ（キャッチコピー行）で、サンプル中の
`'1 枚目'` を含む箇所には手を入れていない:

```
diff --git a/README.md b/README.md
index 1fe1c86..7166e73 100644
--- a/README.md
+++ b/README.md
@@ -1,6 +1,6 @@
 # yt_slide
 
-**HTML 1 枚で、ナレーション付きのプレゼンが動く。**
+**ファイル 3 つを置くだけで、ナレーション付きのプレゼンが動く。**
```

`tools/test_measure_duration.py` の差分は TODO-065（`-n`/中央値）のテスト追加分のみで、
`'1 枚目'` に触れる変更は無い（末尾に追記されたテストのみ）。OK。

## 3. `node --check slides/readme.js`

```
$ node --check slides/readme.js
exit=0
```

構文エラー無し。OK。

## 4. `duration` の測り直し

```
$ tools/measure-duration.py --slides readme 1 10 -n 3
スライド 1: 原文 86 字 / 読み 92 字 / 実測 3 回の中央値 16.224s / BASE_SPEED_MULTIPLIER=1.4 倍速 11.59s -> duration: 12
スライド 10: 原文 74 字 / 読み 76 字 / 実測 3 回の中央値 13.368s / BASE_SPEED_MULTIPLIER=1.4 倍速 9.55s -> duration: 10
exit=0
```

`slides/readme.js` の現在値（スライド 1: `duration: 12`、スライド 10: `duration: 10`）と一致。
一致したので指摘なし。

## 5. 画面の確認（Playwright, 1920x1080）

`python3 -m http.server 8765` をリポジトリのトップで起動し、Playwright(chromium) で
`http://localhost:8765/player.html?slides=readme` を開いて
`renderSlide(0, true)` / `renderSlide(9, true)` で切り替え、以下に保存した。

- `~/tmp/playwright-mcp/TODO-059-slide1.png`
- `~/tmp/playwright-mcp/TODO-059-slide10.png`

見た目の確認結果:

- スライド 1: 見出し「ファイル 3 つ を置くだけで、ナレーション付きのプレゼンが
  動き出す」は 2 行に自然に折り返され、枠からのはみ出しや行の重なりは無い。
- スライド 10（まとめ）: 「ファイル 3 つ を置くだけで、ナレーション付きプレゼンが
  動く」の行はカード内に収まっており、はみ出し・重なりは無い。

作業後、`http.server 8765` のプロセスを `pgrep -f 'http.server 8765'` で確認して
kill し、`curl` で接続できなくなったことを確認して停止済み。

## まとめ

1〜5 すべて確認し、食い違いは見つからなかった。判断が要る点は無し。

## 追試: 見出しを縮めたあと

`slides/readme.js` の `h1` を「ファイル 3 つ を置くだけで、〜」から
「ファイル 3 つ で、〜」に縮めた変更（ナレーション・`duration` は変更無し）を確認した。
`node --check slides/readme.js` は exit=0（構文エラー無し）。
同じ環境（`http.server 8765` + Playwright chromium、1920x1080、
`renderSlide(0, true)`）でスライド 1 を撮り直し、
`~/tmp/playwright-mcp/TODO-059-slide1.png` に上書き保存した。
見出しは「ファイル 3 つ で、ナレーション付きのプ／レゼンが動き出す」の
2 行に折り返され、枠のはみ出しや行の重なりは無かった。
作業後、`pgrep -f 'http.server 8765'` で PID を確認して kill し、
接続不可を確認して停止済み。
