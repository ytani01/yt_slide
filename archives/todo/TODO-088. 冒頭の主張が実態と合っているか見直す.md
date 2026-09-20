# TODO-088. 冒頭の主張が実態と合っているか見直す

|        | main                 | 担当                   |
|--------|----------------------|------------------------|
| 見込み | Opus 5 / effort high | implementer + verifier |
| 実施   | Opus 5 / effort high | verifier               |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 50,214 |        133,755 | 77%        |
| verifier | Sonnet 5 | medium | 30,435 |        170,411 | 23%        |
| 合計     |          |        | 80,649 |        304,166 | 概算 $6.4  |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま。モデルも effort も
  上書きしていない
- implementer は使わなかった。文言の差し替えだけで、実装と呼ぶものが
  無かったため（見込みとの差は「分担の振り返り」に書いた）

## きっかけ

「URL を渡せばそのまま見てもらえる」への指摘から。そこだけ直すつもりだったが、
`README.md` と `slides/readme.js` の冒頭が並べている主張をまとめて見ることにした。

見直した主張は 4 つ。

| 主張 | 立てたときの見立て |
|------|--------------------|
| ファイル 2 つを置くだけで動く | 通りそう。ただし未実測 |
| ビルドもインストールも不要 | 通る |
| URL を渡せばそのまま見てもらえる | 配信の手間を飛ばしている |
| すぐ試すには簡易サーバーを立てる | 描画だけなら要らないはず。音声は未確認 |

後ろ 2 つはずれの向きが反対で、片方は手間を少なく言い、もう片方は多く言っていた。

## やったこと

### 実測（verifier）

Playwright の headless Chromium（1280x800）で、`file://` と `http://localhost`
を並べて測った。報告は `archives/agents/TODO-088/verifier-report.md`。

- **ファイル 2 つだけで動いた。** `player.html` と `slides/readme.js` だけの
  ディレクトリで、console error 0 件・pageerror 0 件・requestfailed 0 件。
  スライド 10 枚、2 枚目も描画された。`file://` と `http://` で差は無い
- **`file://` でも Online Voice が鳴った。** `translate_tts` は 200 応答で、
  `canplay` → `playing` → `ended`、`currentTime` 0.888s。
  `#audio-error-notice` は出ず、状態表示は「朗読中 (Online Voice)」
- **Web Speech API は切り分けられなかった。** `getVoices()` が 0 件で、
  `file://` `http://` のどちらでも `synthesis-failed`。ヘッドレスの Chromium に
  音声合成エンジンが無いためと見られるが、確認していない。少なくとも
  `file://` 固有の事象ではない

### 文言を直した

利用者と決めたのは次の 4 点。

- **簡易サーバーの説明を落とし、`file://` に直した**
- **「URL を渡せば」に条件を足した。**「Web サーバーに置けば、URL を渡すだけで
  見てもらえる」
- **一覧に出すには手作業が要ることを `README.md` にも書いた。** 自分で作った
  スライドは `index.html` に `<li>` を足さないと一覧に出ない
- **持ち出すときは `index.html` から不要な `<li>` を消す**ことを
  `docs/User.md` に書いた。一覧は `slides/` を見て作られるのではなく
  リンクを直接書いたものなので、消さないとリンク切れになる

「ファイル 2 つ」「ビルド不要」は実測で通ったのでそのまま残した。

変えたファイル:

| ファイル | 直したところ |
|----------|--------------|
| `README.md` | 冒頭の URL の主張、「すぐ試す」、「必要なもの」の下の `file://` の記述 |
| `slides/readme.js` | スライド 1・3・10 のナレーションと本文。スライド 3 のコード枠 |
| `docs/Developer.md` | 「場所を選ばない」の簡易サーバーの例と `file://` の記述 |
| `docs/User.md` | 「他のサーバーへ持っていくとき」の `<li>` の話と `file://` の記述 |
| `slides/developer.js` | スライド 3 の注記 |

ナレーションを変えた 3 枚は
`tools/measure-duration.py --slides readme -n 3 --write 1 3 10` で測り直した
（1: 12→13、3: 11→15、10: 10→13）。

### 洗い出しが漏れていた

項目を立てたときの grep に `http.server` と `file://` が入っておらず、
`docs/Developer.md`・`docs/User.md`・`README.md:103`・`slides/developer.js` の
4 箇所が対象から外れていた。いずれも「読み上げは `file://` では試していない。
HTTP 配信が確実」という、実測で古くなる記述だった。**2 箇所は verifier の
2 回目の確認で見つかった。**

## 確かめたこと

verifier が 3 回に分けて確認した（報告は `archives/agents/TODO-088/` の
`verifier-report.md`、`-2.md`、`-3.md`）。

- `file://` で `player.html`（`?slides=` 無し）と `?slides=user` を開き、
  どちらも console error 0 件・pageerror 0 件・requestfailed 0 件
- 直した `readme.js` は 10 枚すべて本文が空でなく、スライド 3 の
  コード枠もはみ出していない
- `duration` は測り直しの値（13 / 15 / 13）と現在値がすべて一致
- `index.html` の `<li>` 5 個と `slides/*.js` 5 個が完全に一致。無い名前を
  指定すると `docs/User.md` の文言どおり「スライドのデータ
  `slides/nosuch.js` を読み込めませんでした。」が出た
- `slides/developer.js` は 11 枚すべて本文が空でなく、長くした注記も
  1 行に収まって重なっていない
- `file://` を含む grep で全体を見直し、「簡易サーバーを立てる必要がある」
  「`file://` では読み上げを試していない」と読める記述が残っていないことを確認

## 残ること

- **Web Speech API が `file://` で鳴るかは未確認。** ヘッドレスの Chromium に
  音声合成エンジンが無いため測れなかった。`docs/Developer.md` にはその旨を
  書いてある
- **`duration` を合わせるには `tools/measure-duration.py` が要る**（`curl`・
  `ffprobe`）。「ビルドもインストールも不要」と擦れるため、TODO-090 として
  別に立てた。冒頭の主張に限定を付けるかは、この項目では「付けない」と決めた
  （`README.md` の「必要なもの」が既に書き分けているため）

## 分担の振り返り

- **verifier が見つけたもの**: 実測 2 件のほか、**2 回目の確認で
  `README.md:103` と `slides/developer.js:105` に同じ主張が残っていることを
  見つけた**。これは main の洗い出し（項目を立てたときの grep）が漏らした分で、
  確認を分けた効果がそのまま出た形になる
- **見込みと食い違ったのは**、implementer を使わなかった点。文言の差し替え
  だけで、分けて渡すほどの実装が無かった。立てたときは「ナレーションを変える
  なら実装も分ける」と見ていたが、実際には `sed` 相当の置換で済んだ
- **次に同じ規模（文書とスライドの文言を揃える項目）をやるなら**、
  implementer は立てず、main が直して verifier に確認させる形でよい。
  ただし**確認は 1 回で終わると見込まないこと**。今回は 3 回に分かれ、
  2 回目で漏れが出た。回数を減らしたいなら、**項目を立てる時点の grep に
  同じ主張の言い換えを入れておく**（今回なら `http.server` と `file://`）。
  洗い出しの網が粗いと、そのぶん確認の往復が増える
