# TODO

**残っている項目: TODO-062、TODO-063、TODO-067、TODO-068。**
これまでに 64 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-069` から。**

---

## TODO-062. スライドの見出しと本文の枠を `player.html` に持たせる

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + verifier + reviewer |

- [ ] `slide.title` から見出しを描き、本文を枠で包む経路を `player.html` に足す
- [ ] 本文だけを書く形（`body`）で 1 枚作り、既存の `render()` と並んで動くことを確かめる
- [ ] `docs/User.md` に新しい書き方を書く

スライド 1 枚ごとの見出しは、いまは `render()` の中に手書きされている。
`slide.title` はコントロールバーと目次にしか使われておらず、**画面に出る
見出しは 4 本のスライド一式それぞれで書き直されている。**
利用者が毎回書くのは「見出しの `h2` + アイコン + 本文のレイアウト」で、
`render()` の中を全部自分で書くのは負担が大きい。

**見出しと、本文の外側の余白・行間までを `player.html` に持たせる。**

### 決めたこと

- **`render()` は残す。定型は置き換えではなく追加。** `render()` を書いた
  スライドは今までどおり枠を外れる。見出しの無い全面スライド（タイトル、
  章の区切り、全面の図）はそちらで書く。既存の 4 本は変更しない
- 利用者が本文だけ書く場合は、`render()` の代わりに本文の HTML を渡す。
  `player.html` は `render()` があればそれを呼び、無ければ
  `slide.title` から見出しを作って本文を包む

### 決めること（着手時に調べてから）

- **本文を渡す名前と型。** `body` という名前でよいか。文字列か、関数か
  （`render()` と同じく関数にすると、テンプレートリテラルの中で式を
  使いやすい）
- **見出しの標準形をどれに揃えるか。** 既存 4 本の `h2` は
  アイコン・色・文字サイズがばらついている。どれを標準にするか、
  スライドごとにアイコンと色を選べるようにするか
- **`title` が空のときの扱い。** 見出しを出さずに本文だけ包むか、
  `render()` を書かせるか

分岐が増える（`render()` があるか無いか）ので reviewer を入れる。

---

## TODO-063. 典型パターンのサンプルを 8〜10 種類用意する

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + wording + verifier |

- [ ] `slides/template.js` に典型パターンを並べる
- [ ] `docs/User.md` から `slides/template.js` を指す
- [ ] `duration` を測る

`render()` の中を書くのが難しいのは、定型部分だけが理由ではない。
**「本文をどう組むか」の見本が無い。** TODO-062 で定型を `player.html` に持たせても、
本文のレイアウトは利用者が考えることになる。

**変化はサンプルの数で稼ぐ。** 定型を固めるほどワンパターンになりやすいので、
枠は揃えたうえで、中身の型を複数用意して選べるようにする。

### 揃えるパターン

箇条書き、2 カラム比較、表、コード・端末画面、図解、数字を大きく見せる、
引用、時系列、章の区切り。8〜10 種類を目安にする。

### 決めたこと

- **`slides/template.js` に置く。** `player.html?slides=template` で
  そのまま再生して見比べられ、ファイルをコピーして作り始められる
- **`docs/User.md` には転記せず、`slides/template.js` を指すだけにする。**
  同じコードが 2 箇所に残ると片方が古くなる

**TODO-062 が決着してから着手する。** 定型の書き方が決まらないと
サンプルが書けないため。

---

## TODO-067. 前提になるパッケージのインストールを `README.md` に書き、他の文書からはそこを指す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |

- [ ] `README.md` に「必要なもの」の節を作り、要るパッケージと入れ方を書く
- [ ] `docs/User.md` と `docs/Developer.md` の前提の記述を、その節を指す形に置き換える
- [ ] 書いたコマンドが実際に通るか確かめる

スライドを**見るだけならブラウザ 1 つで足りる**（Tailwind と Font Awesome は CDN から
読む）。前提が要るのは `tools/` のスクリプトのほうで、`measure-duration.py` は
`curl` と `ffprobe`、`make-video.py`（TODO-066）はさらに `ffmpeg`、Python の
`playwright` と chromium が要る。**入れ方はどこにも書いていない。**

道具を使うのは `docs/Developer.md` の読者だけではない。`docs/User.md` は
スライドを作る人に `measure-duration.py` と `make-video.py` を使わせている。

### 決めたこと

- **入れ方の本体は `README.md` に置く。** 両方の読者の入口で、`tools/` の表も
  すでにここにある
- **`docs/User.md` と `docs/Developer.md` は README を指すだけにする。**
  前提の記述はいま `README.md`、`docs/User.md` の 2 箇所（3 行）に散っており、
  もう 1 箇所増やすと片方だけ古くなる
- **「見るだけなら何も要らない」ことも書く。** それがこのプロジェクトの作りなので、
  書かないと誤解される
- **確認は verifier に分ける。** 書いたとおりに試せる手順だから（TODO-017）。
  ただし `apt install` は実行させず、`--version` で実在と版を照合させる

### 決めること（着手時）

- **Debian / Raspberry Pi 前提の `apt` と `pip` のコマンドまで書くか、
  パッケージ名だけ挙げるか。** 実測した版（`ffmpeg 5.1.9` など）を添えるかも
  一緒に決める

**TODO-066 は決着済み**（`tools/make-video.py` がある）。着手できる。

---

## TODO-068. `slides/_rules.js` を `player.html` に戻す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |

- [ ] `player.html` に `SPEECH_RULES` を戻し、`<script src="slides/_rules.js">` を外す
- [ ] `tools/measure-duration.py` の `load_common_rules()` の読み先を `player.html` にする
- [ ] `_rules.js` への言及 12 箇所を直す
- [ ] `slides/developer.js` のナレーションとスライドの文面を直し、`duration` を測り直す
- [ ] `slides/_rules.js` を消す

TODO-060 で「戻す」と決めた。理由は
[archives/todo/TODO-060.%20slides%20_rules.js%20を%20player.html%20に含めるか、もう一度検討する.md](archives/todo/TODO-060.%20slides%20_rules.js%20を%20player.html%20に含めるか、もう一度検討する.md)
にある。**スライドを作る人から見て、`slides/` に自分のファイル以外が
並んでいるのをやめる**のが目的。配布ファイルが 2 つに減るのは結果。

### 触る箇所（TODO-060 で数えた）

- `player.html:464` の `<script src="slides/_rules.js"></script>` と、
  その上のコメント。`player.html:608` のコメントも `slides/_rules.js` を指している
- `tools/measure-duration.py:82` の `load_common_rules()`。冒頭の docstring
  （25 行目）も直す
- `README.md` 1 箇所、`docs/Developer.md` 5 箇所、`docs/User.md` 2 箇所、
  `slides/{readme,user,developer,claude-memo}.js` のコメント各 1 箇所
- `slides/developer.js:83`（ナレーション）と `:92`（スライドの本文）。
  「ローカルを指すのは `slides/_rules.js` とスライドデータの 2 つだけ」が
  1 つだけになる

### 決めたこと

- **表を置く位置は `prepareSpeechText()` の近く。** いまの
  `<script src>` の位置（`</main>` の直後）ではなく、使う関数のそばに置く。
  スライド一式のファイルより先に読む必要があったのは外部ファイルだったからで、
  同じ `<script>` の中に入れればその制約は消える
- **`load_common_rules()` には囲いを付ける。** `slides_rules_from_text()` と
  同じく `const SPEECH_RULES = [` から `];` までを先に切り出してから
  `load_rules()` に渡す。`player.html` 全体に `JS_RULE_RE` を当てる形にしない
  （いまはヒット 0 だが、あとから正規表現リテラルが増えると拾う）
- **`docs/User.md` の「他のサーバーへ持っていくとき」は 2 ファイルになる。**
  「渡すのは次の 3 つだけ」を直す
- **reviewer を入れる。** `load_common_rules()` のパースが変わり、囲いの
  正規表現を誤ると共通表が空になる。置換が全部素通りするだけで例外は出ず、
  `tools/test_measure_duration.py` の `assert len(common_rules) == 23` 以外は
  落ちない
- **verifier には実測させる。** 移動の前後で `measure-duration.py` の
  出力（置換後の読み上げ文）が一致すること、`player.html` をブラウザで
  開いて読み上げが変わらないことを確かめる。**`duration` の測り直しは
  `slides/developer.js` の文面を直した分だけ**で、他のスライドは測り直さない

### 決めること（着手時）

- **`slides/developer.js` の文面をどう書き直すか。** 利用者に見せる文なので、
  文言が固まるまで verifier を起こさない

---

## 完了済み

1 項目 1 ファイル。`archives/todo/` にある（新しい順）。
**やらないと決めたものの理由も記載してある。** 蒸し返す前に読むこと。

- [**TODO-060.** `slides/_rules.js` を `player.html` に含めるか、もう一度検討する](archives/todo/TODO-060.%20slides%20_rules.js%20を%20player.html%20に含めるか、もう一度検討する.md)
- [**TODO-066.** スライドを MP4 に書き出すツールを作る](archives/todo/TODO-066.%20スライドを%20MP4%20に書き出すツールを作る.md)
- [**TODO-065.** `measure-duration.py` に測る回数のオプションを足す](archives/todo/TODO-065.%20measure-duration.py%20に測る回数のオプションを足す.md)
- [**TODO-059.** 「HTML 1 枚で動く」という誤りを直す](archives/todo/TODO-059.%20「HTML%201%20枚で動く」という誤りを直す.md)
- [**TODO-064.** TODO-061 の 1〜13 位を `~/.claude/CLAUDE.md` に足す](archives/todo/TODO-064.%20TODO-061%20の%201〜13%20位を%20~%20.claude%20CLAUDE.md%20に足す.md)
- [**TODO-061.** 分担の振り返りから、グローバルなルールに足す候補を出す](archives/todo/TODO-061.%20分担の振り返りから、グローバルなルールに足す候補を出す.md)
- [**TODO-058.** 「デッキ」をやめ、識別子の `deck` も `slides` に変える](archives/todo/TODO-058.%20「デッキ」をやめ、識別子の%20deck%20も%20slides%20に変える.md)
- [**TODO-057.** 3 デッキに wording を通す](archives/todo/TODO-057.%203%20デッキに%20wording%20を通す.md)
- [**TODO-056.** 他のサーバーへ公開するときに要るファイルを `docs/User.md` に書く](archives/todo/TODO-056.%20%E4%BB%96%E3%81%AE%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%B8%E5%85%AC%E9%96%8B%E3%81%99%E3%82%8B%E3%81%A8%E3%81%8D%E3%81%AB%E8%A6%81%E3%82%8B%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%20docs%20User.md%20%E3%81%AB%E6%9B%B8%E3%81%8F.md)
- [**TODO-055.** 各ドキュメントに wording を通す](archives/todo/TODO-055.%20各ドキュメントに%20wording%20を通す.md)
- [**TODO-052.** ナレーションの読みの置換表を、プレイヤー共通の語まで広げる](archives/todo/TODO-052.%20ナレーションの読みの置換表を、プレイヤー共通の語まで広げる.md)
- [**TODO-054.** 読みの置換表を外に出し、デッキごとに足せるようにする](archives/todo/TODO-054.%20%E8%AA%AD%E3%81%BF%E3%81%AE%E7%BD%AE%E6%8F%9B%E8%A1%A8%E3%82%92%E5%A4%96%E3%81%AB%E5%87%BA%E3%81%97%E3%80%81%E3%83%87%E3%83%83%E3%82%AD%E3%81%94%E3%81%A8%E3%81%AB%E8%B6%B3%E3%81%9B%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB%E3%81%99%E3%82%8B.md)
- [**TODO-053.** `docs/Usage.md` を `docs/User.md` に変える](archives/todo/TODO-053.%20docs%20Usage.md%20を%20docs%20User.md%20に変える.md)
- [**TODO-051.** `README.md` と `docs/` の内容をスライドにする](archives/todo/TODO-051.%20README.md%20と%20docs%20の内容をスライドにする.md)
- [**TODO-050.** 測った `duration` をスライドデータへ自動で書き戻す](archives/todo/TODO-050.%20測った%20duration%20をスライドデータへ自動で書き戻す.md)
- [**TODO-049.** ドキュメントとスクリプトの数値を定数名に置き換える](archives/todo/TODO-049.%20ドキュメントとスクリプトの数値を定数名に置き換える.md)
- [**TODO-048.** スライドデータから `id` を外す](archives/todo/TODO-048.%20スライドデータから%20id%20を外す.md)
- [**TODO-047.** 旧 URL 用の `claude_memo.html` を削除する](archives/todo/TODO-047.%20旧%20URL%20用の%20claude_memo.html%20を削除する.md)
- [**TODO-046.** スライドのデータを `slides/` に置く](archives/todo/TODO-046.%20スライドのデータを%20slides%20に置く.md)
- [**TODO-045.** リポジトリの入口として `README.md` を作る](archives/todo/TODO-045.%20リポジトリの入口として%20README.md%20を作る.md)
- [**TODO-044.** `public_html/` 以外へ移しても動くことを `docs/Developer.md` に書く](archives/todo/TODO-044.%20public_html%20以外へ移しても動くことを%20docs%20Developer.md%20に書く.md)
- [**TODO-043.** `player.html` を直す人向けの `docs/Developer.md` を作る](archives/todo/TODO-043.%20player.html%20を直す人向けの%20docs%20Developer.md%20を作る.md)
- [**TODO-042.** `player.html` で他のスライドを作る手順を `docs/Usage.md` に書く](archives/todo/TODO-042.%20player.html%20で他のスライドを作る手順を%20docs%20Usage.md%20に書く.md)
- [**TODO-041.** プレイヤーの共通部分とスライドのデータを別ファイルに分ける](archives/todo/TODO-041.%20プレイヤーの共通部分とスライドのデータを別ファイルに分ける.md)
- [**TODO-040.** Inworld AI の声に差し替えるか検討する（対応しない）](archives/todo/TODO-040.%20Inworld%20AI%20の声に差し替えるか検討する.md)
- [**TODO-035.** 字幕を ON にしたとき全文を表示する](archives/todo/TODO-035.%20字幕を%20ON%20にしたとき全文を表示する.md)
- [**TODO-039.** スライド 6 に担当とモデルが固定でない旨の注釈を入れる](archives/todo/TODO-039.%20スライド%206%20に担当とモデルが固定でない旨の注釈を入れる.md)
- [**TODO-038.** スライド 4 に「壁打ちで精査」を入れる](archives/todo/TODO-038.%20スライド%204%20に「壁打ちで精査」を入れる.md)
- [**TODO-037.** まとめスライドの内容とナレーションの長さを見直す](archives/todo/TODO-037.%20まとめスライドの内容とナレーションの長さを見直す.md)
- [**TODO-034.** タイトルスライドのナレーションを短くする](archives/todo/TODO-034.%20タイトルスライドのナレーションを短くする.md)
- [**TODO-036.** ステータスラインの実例の区切りの段差を直す](archives/todo/TODO-036.%20ステータスラインの実例の区切りの段差を直す.md)
- [**TODO-033.** 説明の順番を変え、冒頭を自己紹介から入る流れに直す](archives/todo/TODO-033.%20説明の順番を変え、冒頭を自己紹介から入る流れに直す.md)
- [**TODO-028.** トークンの話を呼応させる](archives/todo/TODO-028.%20トークンの話を呼応させる.md)
- [**TODO-027.** 冒頭を掴みにして、予防線を減らす](archives/todo/TODO-027.%20冒頭を掴みにして、予防線を減らす.md)
- [**TODO-026.** まとめに「その他の便利な使い方」を足す](archives/todo/TODO-026.%20まとめに「その他の便利な使い方」を足す.md)
- [**TODO-025.** スライドの並びを章立てに合わせる](archives/todo/TODO-025.%20スライドの並びを章立てに合わせる.md)
- [**TODO-032.** スライド 15 の `duration` のずれを直す](archives/todo/TODO-032.%20スライド%2015%20の%20duration%20のずれを直す.md)
- [**TODO-031.** 「使い方」の読みを直す](archives/todo/TODO-031.%20「使い方」の読みを直す.md)
- [**TODO-030.** `duration` の測定スクリプトをリポジトリに入れる](archives/todo/TODO-030.%20duration%20の測定スクリプトをリポジトリに入れる.md)
- [**TODO-029.** フッターと category ラベルを削除する](archives/todo/TODO-029.%20フッターと%20category%20ラベルを削除する.md)
- [**TODO-024.** JS の数値リテラルに名前を付ける](archives/todo/TODO-024.%20JS%20の数値リテラルに名前を付ける.md)
- [**TODO-023.** スライド 2 を「主なコマンド一覧」から「全体の概要」に差し替える](archives/todo/TODO-023.%20スライド%202%20を「主なコマンド一覧」から「全体の概要」に差し替える.md)
- [**TODO-022.** 再生速度をプルダウンで選べるようにする](archives/todo/TODO-022.%20再生速度をプルダウンで選べるようにする.md)
- [**TODO-020.** ナレーション後の待ちの間も経過時間を進める](archives/todo/TODO-020.%20ナレーション後の待ちの間も経過時間を進める.md)
- [**TODO-021.** ナレーション後の待ち秒数を選べるようにする](archives/todo/TODO-021.%20ナレーション後の待ち秒数を選べるようにする.md)
- [**TODO-019.** Online TTS に安全タイマーを入れる](archives/todo/TODO-019.%20Online%20TTS%20に安全タイマーを入れる.md)
- [**TODO-018.** 進行バーと時間表示を実時間に合わせる](archives/todo/TODO-018.%20進行バーと時間表示を実時間に合わせる.md)
- [**TODO-017.** スライド 3「現状の課題」をまとめの直前へ移す](archives/todo/TODO-017.%20スライド%203「現状の課題」をまとめの直前へ移す.md)
- [**TODO-016.** 未使用の定義と冗長な記述を削る](archives/todo/TODO-016.%20未使用の定義と冗長な記述を削る.md)
- [**TODO-015.** オンライン音声に無料で使える他の選択肢がないか検討する（対応しない）](archives/todo/TODO-015.%20オンライン音声に無料で使える他の選択肢がないか検討する.md)
- [**TODO-014.** 見た目と動作を変えない範囲でコードの重複を整理する](archives/todo/TODO-014.%20見た目と動作を変えない範囲でコードの重複を整理する.md)
- [**TODO-013.** スライド 4 のナレーションから「スマホから SSH」を外す](archives/todo/TODO-013.%20スライド%204%20のナレーションから「スマホから%20SSH」を外す.md)
- [**TODO-011.** 横持ちスマホの通常表示でもスライド全体を画面に収める](archives/todo/TODO-011.%20横持ちスマホの通常表示でもスライド全体を画面に収める.md)
- [**TODO-012.** 「主なコマンド」のナレーションから「頻繁に」を外す](archives/todo/TODO-012.%20「主なコマンド」のナレーションから「頻繁に」を外す.md)
- [**TODO-010.** スマホのスワイプでスライドを切り替える](archives/todo/TODO-010.%20スマホのスワイプでスライドを切り替える.md)
- [**TODO-009.** 横持ちスマホのフルスクリーンでスライド本文が上段に被る](archives/todo/TODO-009.%20横持ちスマホのフルスクリーンでスライド本文が上段に被る.md)
- [**TODO-008.** スライド 12 の記述例からコミットの行を外す](archives/todo/TODO-008.%20スライド%2012%20の記述例からコミットの行を外す.md)
- [**TODO-007.** スライド 12 の TODO.md 記述例から `/clear` の行を外す](archives/todo/TODO-007.%20スライド%2012%20の%20TODO.md%20記述例から%20clear%20の行を外す.md)
- [**TODO-006.** タップしたときの OSD を 2 秒出す](archives/todo/TODO-006.%20タップしたときの%20OSD%20を%202%20秒出す.md)
- [**TODO-005.** スライドのタップで再生と一時停止を切り替える](archives/todo/TODO-005.%20スライドのタップで再生と一時停止を切り替える.md)
- [**TODO-004.** 横持ちのスマホでフルスクリーンの高さを画面に合わせる](archives/todo/TODO-004.%20横持ちのスマホでフルスクリーンの高さを画面に合わせる.md)
- [**TODO-003.** 横持ちのスマホでフルスクリーンから抜けられないのを直す](archives/todo/TODO-003.%20横持ちのスマホでフルスクリーンから抜けられないのを直す.md)
- [**TODO-002.** Android Chrome での読み上げを直す](archives/todo/TODO-002.%20Android%20Chrome%20での読み上げを直す.md)
- [**TODO-001.** スマホ縦画面で 16:9 のまま幅いっぱいに表示する](archives/todo/TODO-001.%20スマホ縦画面で%2016:9%20のまま幅いっぱいに表示する.md)
