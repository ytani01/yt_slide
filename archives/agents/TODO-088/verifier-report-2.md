# TODO-088 verifier 報告（続き。文言確定後の再現確認）

計測環境は前回と同じ: Playwright headless Chromium 1280x800、
`NODE_PATH=/home/ytani/work/ytBackgammon/node_modules`、playwright 1.63.0。
計測スクリプトは `archives/agents/TODO-088/check-round2.js.txt`
（生ログは `run2.log`）。`tools/measure-duration.py` は Python から直接実行した。

指示どおり、コード・文書は一切変更していない。原因の切り分けや
境界線上の判断はしていない。

## 1. README.md の「すぐ試す」が書いたとおりに動くか

- `file://.../player.html`（`?slides=` 無し）: console error 0 件、
  pageerror 0 件、requestfailed 0 件、本文 439 文字
- `file://.../player.html?slides=user`: console error 0 件、
  pageerror 0 件、requestfailed 0 件、本文 585 文字

どちらも読み込み・描画とも問題なし。「読み込めませんでした」の文言も出ていない。

## 2. 直した readme.js が最後まで読まれるか

`file://.../player.html?slides=readme` を開き、`#next-btn` で10枚すべて送った。

- スライド総数: 10。本文が空だったスライド: **無し**（`emptySlides: []`）
- console error 0 件、pageerror 0 件、requestfailed 0 件（全編通して）
- スライド 1・3・10 のナレーション文とスライド本体のテキスト（実測値）:

  - スライド1
    - narration: `yt_slide は、2 つのファイルを置くだけで、ナレーション付きのプレゼンが動き出す仕組みです。ビルドもインストールも不要。Webサーバーに置けば、URLを渡すだけで見てもらえます。`
    - 本文: `yt_slide\nファイル 2 つ で、 ナレーション付きのプレゼンが動き出す\n\nビルドもインストールも不要。サーバーに置けば、URL を渡すだけで見てもらえる。`
  - スライド3
    - narration: `すぐ試すには、player.html をブラウザで開くだけです。サーバーを立てる必要はなく、ファイルを直接開いても読み上げまで動きます。URLにスライドの名前を指定すると、そのスライドが再生されます。`
    - 本文: `すぐ試す\nplayer.html # ブラウザで開くだけ\nplayer.html?slides=user # 名前を指定して開く\n\nplayer.html?slides=<名前> で slides/<名前>.js を読む。`
  - スライド10
    - narration: `まとめです。yt_slide を使えば、ファイル 2 つを置くだけで、ナレーション付きのプレゼンをすぐに作れます。Webサーバーに置けば、URLを渡すだけで見てもらえます。ぜひ試してみてください。`
    - 本文: `まとめ\nファイル 2 つ を置くだけで、ナレーション付きプレゼンが動く\nslides/ に JavaScript を 1 つ足す だけで新しいスライドを作れる\nビルド不要。サーバーに置けば URL を渡すだけで見てもらえる\nぜひ試してみてください`

- スライド3のコード枠（`player.html` / `player.html?slides=user` の2行）:
  スクリーンショットで見た限り、枠内に収まっており、はみ出し・折り返し崩れは
  見当たらなかった
- スクリーンショット: `~/tmp/playwright-mcp/TODO-088-after-1.png`
  `-3.png` `-10.png` に保存。3枚とも 1280x800 で不透明、欠けなし、
  余計なものの映り込みなし

## 3. duration が実測と合っているか

`python3 tools/measure-duration.py --slides readme -n 3 1 3 10`（`--write` なし）
の出力:

```
スライド 1: 原文 93 字 / 読み 99 字 / 実測 3 回の中央値 17.616s / BASE_SPEED_MULTIPLIER=1.4 倍速 12.58s -> duration: 13
スライド 3: 原文 100 字 / 読み 113 字 / 実測 3 回の中央値 21.456s / BASE_SPEED_MULTIPLIER=1.4 倍速 15.33s -> duration: 15
スライド 10: 原文 98 字 / 読み 104 字 / 実測 3 回の中央値 18.528s / BASE_SPEED_MULTIPLIER=1.4 倍速 13.23s -> duration: 13
```

`slides/readme.js` の現在値（1:13、3:15、10:13）と**すべて一致**。ずれ無し。

## 4. 文書の主張がそろっているか（grep での洗い出し）

指定の grep（`archives/` と `TODO.md` を除く）で見つかった、対象ファイル
（README.md、docs/User.md、docs/Developer.md、slides/readme.js、player.html、
index.html、slides/developer.js）の該当箇所を確認した。

- **README.md に食い違いが残っている。** 「すぐ試す」節（README.md:25-26）は
  「`player.html` をブラウザで開くだけ。サーバーを立てる必要はない。
  ファイルを直接開いた `file://` でも、表示から読み上げまで動く。」と
  書いているのに対し、下のほう README.md:103-104（「動画に書き出す」の
  直前の段落）には
  「**ネット接続が必要**。表示は `file://` でも動くことが分かっているが、
  読み上げは `file://` では試していないため、HTTP での配信が確実」
  という、修正前のままの記述が残っている。同じファイル内で「読み上げも
  動く」と「読み上げは試していない」が両方書かれている状態
- **`slides/developer.js:105` にも同種の記述が残っている。**
  `※ file:// で直接開くのは試していない。HTTP 配信が確実` という
  スライド本文が残っている（このスライドは今回の修正対象に指定されて
  いなかったファイル）。今回の grep 条件（`file://` を含む）に該当した
  ので報告する
- 上記2箇所以外（docs/User.md、docs/Developer.md、slides/readme.js、
  index.html）には、「簡易サーバーを立てる必要がある」「`file://` では
  読み上げを試していない」と読める記述は見当たらなかった
- `docs/Developer.md:121` の `file://` 言及は `localStorage` が使えない
  環境の例示で、今回の話題とは別の文脈だった（参考として記載のみ）

実害は未確認。文言としてどちらが正しいかの判断はしていない。

## 5. index.html の一覧との食い違い

- `slides/*.js` のベース名（アルファベット順）:
  `["claude-memo","developer","readme","template","user"]`
- `index.html` の `<li>` 内 `slides=` の値（同順）:
  `["claude-memo","developer","readme","template","user"]`
- `<li>` の数: 5、`slides/*.js` の数: 5。**完全に一致**
- `file://.../player.html?slides=nosuch` を開いた結果:
  - console/page の `pageerror`: `Error: slides not found: nosuch`（1件）
  - 本文（画面表示）に `スライドのデータ slides/nosuch.js を読み込めませんでした。`
    が実際に表示された（`docs/User.md` の記述どおりの文言と**完全一致**）

## 確かめられなかったこと・判断できないこと

- README.md / slides/developer.js に残る記述をどう直すべきか（消す・
  書き換える）は判断していない。見つけたことのみ報告する
- Web Speech API の挙動（前回報告のとおり、ヘッドレス環境で
  `synthesis-failed`）は今回は再測定していない（今回の指示範囲外のため）
- コード枠のはみ出しは目視のみ。ピクセル単位の自動計測はしていない
- `docs/User.md`・`docs/Developer.md` の文章全体の通読による整合性確認は
  していない（grep で拾えた範囲のみ）
