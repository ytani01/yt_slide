# TODO

**残っている項目: TODO-073・TODO-074・TODO-075・TODO-077・TODO-078・TODO-079。** これまでに 73 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-080` から。**

---

## TODO-073. リポジトリの入口に `index.html` を置く

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |

- [ ] `index.html` を作る。入っているスライド一式へのリンクを並べる
- [ ] `README.md` と `docs/User.md` に、入口と追記の手順を書く

いま `yt_slide/` の URL を開くと、ディレクトリ一覧かサーバーのエラーになる。
`player.html` を自分で探してもらうことになり、「URL を渡せばそのまま
見てもらえる」という `README.md` の説明と食い違う。

**リダイレクト 1 行ではなく、4 つの一覧ページにする**（利用者と決めた）。
`readme`・`user`・`developer`・`claude-memo` へのリンクを並べ、URL を
手で打たずにスライド一式を選べるようにする。`player.html` は触らない。

`slides/` の中身を実行時に読む手段は無いので、**スライドを足したら
`index.html` にも 1 行足す**ことになる。その手順を `docs/User.md` の
「手順」に書く。

見た目は `player.html` に合わせる（Tailwind・Google Fonts・FontAwesome を
同じように外部から取る）。リンクが実際に開けるかを確かめるので、
確認は verifier に分ける。

---

## TODO-074. 表示中のスライド番号を URL に載せる

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |

- [ ] `player.html` で、表示が変わるたびに番号を `location.hash` へ書く
- [ ] 起動時に `location.hash` を読んで、その番号から始める
- [ ] `docs/User.md` の「公開」と `docs/Developer.md` に書く

いまは必ず 1 枚目から始まる。「この枚を見て」とリンクで渡せず、
再読み込みでも先頭に戻る。チャプター一覧やシークバーで頭出ししても、
その位置を人に渡す手段が無い。

**書き換えるのは表示が変わるたび**（利用者と決めた）。自動送りでも URL が
追従するので、見ているところをそのままコピーして渡せる。履歴は汚さない
（`history.replaceState`）。形式は `player.html?slides=user#7` の 1 始まり。

決めてあること:

- 範囲外の値（0 以下・枚数超過・数値でない）は 1 枚目に寄せる。
  `?slides=` の名前と同じく、URL から来る値は信用しない
- `?deck=` と同じく、ハッシュが無い URL は今までどおり 1 枚目から

`renderSlide()` は自動送り・手動送り・シークバー・チャプター一覧の
すべてが通る（`docs/Developer.md` の再生ロジック）。書き換える場所は
1 箇所で足りるはずだが、初期化の順序と `currentSlideElapsedTime` の
扱いを確かめる。挙動が変わるので reviewer と verifier を分ける。

---

## TODO-075. 再生の設定を覚える

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | implementer + reviewer + verifier |

- [ ] 再生速度・字幕・音声エンジン・待ち秒数を `localStorage` で覚える
- [ ] `player.html` の「覚えない（TODO-021）」のコメントを直す
- [ ] `docs/Developer.md` に、覚える設定と保存キーを書く

再生速度・字幕・音声エンジン・待ち秒数は、いずれも再読み込みで既定に戻る
（速度 1.0、字幕 OFF、`online`、待ち 2 秒）。繰り返し見る人と、上映の前に
調整する人が毎回やり直すことになる。

**4 つとも覚える**（利用者と決めた）。**TODO-021 の方針変更にあたる。**
TODO-021 では待ち秒数について「選んだ値は覚えない（再読み込みで 2 秒に
戻る）。既存の再生速度と揃える」と決めた。その再生速度のほうも覚えるように
するので、揃える先が変わる。`player.html` の該当コメントも直す。

決めてあること:

- **`localStorage` が使えなくても落とさない。** 読み書きを `try` で囲み、
  失敗したら既定値で動かす（プライベートウィンドウ、`file://`、
  サイトデータを止めている環境）
- 保存した値も信用しない。速度と待ち秒数はプルダウンの選択肢に無い値なら
  既定に戻す
- **スライド一式ごとには分けない。** `?slides=` が変わっても同じ設定を使う
  （見る人の好みであってスライドの属性ではない）

`player.html` の複数箇所に入り、挙動が変わるので implementer・reviewer・
verifier を分ける。

---

## TODO-077. チャプター一覧を検索できるようにする

|      | main | 担当 |
|------|------|------|
| 見込み | GPT-6 Astra / effort high | reviewer + verifier |

**背景:** 見たい話題をスクロールで探す手間を減らすための提案。
現在の `initPlaylist()` は全スライドの題名を並べるだけで、検索欄はない。
枚数が多いと、題名やナレーションに含まれる語から頭出しできない。

- [ ] 題名とナレーションの部分一致でチャプター一覧を絞り込む検索欄を付ける
- [ ] 一致件数、該当なしの表示、検索を解除する操作を用意する
- [ ] 絞り込み後も元のスライド番号を表示し、選ぶと正しいスライドへ移動する
- [ ] 検索は一覧だけに適用し、再生順序と総時間を保つ
- [ ] `docs/User.md` に検索対象と使い方を書く

**検証方法:** verifier が Playwright で 1280×800 とタッチ設定の 390×844 を
確認する。題名だけ・ナレーションだけにある語、日本語入力、空欄、該当なし、
解除、結果の選択を試す。検索中の Space・左右矢印が再生操作に渡らず、
検索結果に含まれないスライドも通常の順序で再生されることを確認する。

**着手前の担当見込み:** main が実装と文書を担当し、reviewer が元の番号と
再生状態を保てるか確認したあと、verifier が実測する。実装は未着手。

---

## TODO-078. 音声の再生失敗を画面に知らせる

|      | main | 担当 |
|------|------|------|
| 見込み | GPT-6 Astra / effort high | implementer + reviewer + verifier |

**背景:** 音が出ないときに、理由と次の操作が分かるようにするための提案。
Online TTS の `onerror` と `play()` の拒否は、現在は console に警告を出し、
想定秒数でスライドを進める。見ている人には失敗が伝わらず、消音状態と
区別しにくい。Web Speech の失敗時には Online TTS へ切り替わる経路もある。

- [ ] 音声取得・再生の失敗を画面に表示し、意図した消音とは区別する
- [ ] 同じスライドの音声を再試行する操作と、既存の音声エンジン切り替えを案内する
- [ ] 復旧時に通知を消し、前のスライドの失敗が次のスライドに残らないようにする
- [ ] 音声の二重再生を防ぎ、既存の安全タイマーと無音時の自動送りを保つ
- [ ] `docs/User.md` に音が出ない場合の操作を書く

**検証方法:** verifier が Playwright で音声要求の失敗と `play()` の拒否を
個別に再現し、表示、再試行、音声エンジン切り替え、次のスライドへの移動を
確認する。正常再生・消音・一時停止では誤った通知が出ないことも確かめる。
タイマーやイベントの残留は自動テストで確認し、実際の音声出力はブラウザで
別に確認する。実機で確認できなかった条件は報告に明記する。

**着手前の担当見込み:** 複数の音声経路とタイマーに関わるため、implementer が
実装・テスト、main が方針整理と文書を担当する。reviewer の確認後に verifier が
実測する。実装は未着手。

---

## TODO-079. `docs/User.md` は `body` を標準として書く

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |

- [ ] `docs/User.md` のキーの表を `title`・`duration`・`narration`・`body`・`icon` の順にし、`render()` は最後に置く
- [ ] 「`body` だけで書く」を `render()` の節より前に出し、標準の書き方として書く
- [ ] 「`render()` の書き方」は「`body` で足りないとき」と明記した高度な使い方にする
- [ ] 冒頭の `slideData` の例と「最小の例」を `body` で書き直す
- [ ] `README.md` の「自分のスライドを作る」の例も `body` にする
- [ ] `slides/user.js` の 7 枚目を「`body` で書く」に差し替え、後ろに `render()` の枚を 1 枚足す（11 枚 → 12 枚）
- [ ] 5 枚目「slideData の中身」の表の `render()` の行を `body` にする
- [ ] `tools/measure-duration.py --slides user --all --write` で `duration` を測り直す
- [ ] 表示とリンクの確認を verifier に分ける

`player.html:968-983` は `render()` があればそれを使い、無ければ `title`・`icon` から
見出しを作って `body` を枠で包む（TODO-062）。`slides/template.js` の 9 種類も
8 つが `body` で書かれているのに、`docs/User.md` は `render()` を先に説明し、
`body` を「`render()` を書かずに済ませる書き方」として後から補足する構成のまま
になっている。これだと `render()` が標準に見える。

決めてあること:

- スライドは 1 枚足して 2 枚に分ける（利用者と決めた）。`body` の説明に枠を取れる
- `README.md` の例も `body` に揃える（利用者と決めた）
- `player.html` は触らない。変えるのは文書とスライドのデータだけ

**検証方法:** verifier が `player.html?slides=user` を開いて 12 枚が崩れずに出ることと、
`body` だけで書いた枚に見出しとアイコンが出ることを確かめる。`docs/User.md` と
`README.md` の例をそのまま `slides/sample.js` に貼って再生できるかも試す。

`slides/user.js` は書いたとおりに開いて確かめられるので、確認は verifier に分ける。
挙動の分岐は変わらないので reviewer は立てない。

---

## 完了済み

1 項目 1 ファイル。`archives/todo/` にある（新しい順）。
**やらないと決めたものの理由も記載してある。** 蒸し返す前に読むこと。

- [**TODO-076.** プレイヤーに操作ガイドを付ける](archives/todo/TODO-076.%20プレイヤーに操作ガイドを付ける.md)
- [**TODO-072.** 映像・画像を作る項目では「見た目は見なくてよい」を外す](archives/todo/TODO-072.%20映像・画像を作る項目では「見た目は見なくてよい」を外す.md)
- [**TODO-071.** `curl` のループをバックグラウンドで走らせると固まる件を切り分ける](archives/todo/TODO-071.%20curl%20のループをバックグラウンドで走らせると固まる件を切り分ける.md)
- [**TODO-070.** `docs/User.md` の付録のアイコン名を FontAwesome のページへのリンクにする](archives/todo/TODO-070.%20docs%20User.md%20の付録のアイコン名を%20FontAwesome%20のページへのリンクにする.md)
- [**TODO-069.** アイコン名の一覧を `docs/User.md` と `slides/user.js` の巻末に載せる](archives/todo/TODO-069.%20アイコン名の一覧を%20docs%20User.md%20と%20slides%20user.js%20の巻末に載せる.md)
- [**TODO-063.** 典型パターンのサンプルを 8〜10 種類用意する](archives/todo/TODO-063.%20典型パターンのサンプルを%208〜10%20種類用意する.md)
- [**TODO-062.** スライドの見出しと本文の枠を `player.html` に持たせる](archives/todo/TODO-062.%20スライドの見出しと本文の枠を%20player.html%20に持たせる.md)
- [**TODO-067.** 前提になるパッケージのインストールを `README.md` に書き、他の文書からはそこを指す](archives/todo/TODO-067.%20%E5%89%8D%E6%8F%90%E3%81%AB%E3%81%AA%E3%82%8B%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%82%92%20README.md%20%E3%81%AB%E6%9B%B8%E3%81%8D%E3%80%81%E4%BB%96%E3%81%AE%E6%96%87%E6%9B%B8%E3%81%8B%E3%82%89%E3%81%AF%E3%81%9D%E3%81%93%E3%82%92%E6%8C%87%E3%81%99.md)
- [**TODO-068.** `slides/_rules.js` を `player.html` に戻す](archives/todo/TODO-068.%20slides%20_rules.js%20を%20player.html%20に戻す.md)
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
