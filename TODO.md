# TODO

**残っている項目: TODO-099。** これまでに 98 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-100` から。**

---

## TODO-099. 自分のスライドを作り、確認して共有する手順を書く

|        | main                     | 担当                |
|--------|--------------------------|---------------------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |

- [ ] `docs/User.md` の冒頭から「自分のスライドを 1 枚作って再生する」
      手順へ進めるようにする。プレイヤーの操作説明は後から参照できる形にする
- [ ] 準備を、インストール → 作業ディレクトリを作って `cd` → `ytslide init`
      の順に書く。インストールの正本は `README.md` に置き、`uv` が未導入の
      場合の案内と Python の条件を補う。測定・動画用の追加準備は使う段階で示す
- [ ] 例の名前を `sample` に統一し、最小例を `slides/sample.js` に保存して
      本文・ナレーションを自分用に直す。まず 1 枚を再生し、その後に見た目を
      整えるため `slides/template.js` から使う型をコピーする操作を示す。
      `duration` は省略せず、おおよその値でよいことをその場で伝える
- [ ] `player.html` をブラウザで開き、アドレス末尾に `?slides=sample` を
      付けるところまで具体化する。保存 → 再読み込み → 見た目と読み上げを確認
      → 修正、を普段の作業にする。表示確認にもネット接続が要ることを添える
- [ ] 一覧から開きたいときは `ytslide index` を使う。ファイルの追加・改名・
      削除や一覧の説明・アイコンを変えたときに再実行し、`index.html` を開いて
      確認する。本文だけの修正には一覧の再生成も測定も要らないことを示す
- [ ] 時間表示を合わせたいときの任意の仕上げとして
      `ytslide update --slides sample` を置く。Online TTS で全枚を測定して
      `duration` を書き換え、その後に一覧を再生成すること、`curl`・`ffprobe`
      が要ることを示す。ナレーションや読みの置換を直したら再測定できると添える
- [ ] `ytslide web` は HTTP で確認したいときの分岐にする。ブラウザは自分で
      開くこと、終了は Ctrl-C、別端末では同じ LAN から配信元の IP アドレスを
      使うことを書く。OS のネットワーク設定で IP を確認し、
      `http://<LAN内IP>:8000/` を開く例と、作業ディレクトリ全体が配信される
      ことを添える。`localhost` は別端末からのアクセス先ではない
- [ ] 共有までの流れを既存の「公開」「動画に書き出す」へつなぐ。
      ローカルファイルの URL や `localhost` をそのまま相手に渡す説明にせず、
      Web サーバーへ置くファイルと渡す URL、MP4 にする場合の分岐を示す。
      「このディレクトリは public_html 下」という固有の前提を一般の作成者向けに直す
- [ ] リポジトリを clone して中で作る道は、短い分岐として残す
- [ ] 末尾の「リポジトリの外に自分のスライドを置く」と重複する記述を、
      どちらか片方へ寄せる
- [ ] `README.md` には最短の流れ、`docs/User.md` には詳しい操作、
      `slides/user.js` には要点を置く。サブコマンド表には使う場面を添え、
      `measure`・`index` を単独で使えることと `update` との関係を示す。
      README の「duration は目分量で決めず」という記述を User.md と揃える
- [ ] `slides/user.js` の「手順1〜4」を 3 枚（準備 / 書いて確かめる /
      一覧・仕上げ・共有）にまとめ、必須と任意を区別する。「duration の測り方」
      など後続の説明・ナレーションも新しい手順と揃える。3 枚目は各目的への
      短い案内に絞り、本文は元の手順3の `clamp(0.9rem, 1.9cqw, 1.4rem)`
      より小さくしない
- [ ] ナレーションを変えた枚の `duration` を `ytslide update --slides user` で
      測り直す

`docs/User.md` の「手順」は `player.html` が手元にある前提で始まり、
`ytslide init` は末尾の「公開」の節に埋もれている。`ytslide update` の
位置づけも「手順」の括弧書きと「`narration` と `duration`」の節に散らばって
いて、**「初期化する → スライドを書く → 増やしたら何を走らせる」という
一本の流れが無い。**

決めたこと（利用者と相談済み。項目にはしない）:

- **標準は `ytslide init` で自分のディレクトリを作る形**にする。
  TODO-095・TODO-096 の方向（リポジトリの外に置ける）と揃える
- **書く範囲は `docs/User.md` と `README.md` の両方**

`slides/user.js`（同じ内容のスライド版）も**今回まとめて直す**
（2026-09-21 に利用者が指示）。ナレーションを変えるので `duration` の
測り直しが要る。`ytslide measure` はネット接続と Online TTS を使う。

着手前に確かめたこと（2026-09-21 の実測記録。今回の見直しでは現行コードと照合）:

- **`ytslide init` した先で `ytslide update` は落ちる。** `--slides` の既定は
  `readme`（`paths.py` の `DEFAULT_SLIDES`）で、init した先に `readme.js` は
  無い（TODO-098）。`slides/readme.js が無い` の UsageError で止まる。
  文書には必ず `--slides <名前>` を添えて書く
- **`ytslide update` は毎回走らせるものではない。** 中身は
  `measure --all --write` → `index` で、1 枚ずつ Online TTS を叩く。
  `docs/User.md` 自身が「`duration` はおおよそでよい、ずれてもスライドは
  飛ばない」と書いているので、書く・見るのループには要らない
- **`ytslide init` が置くのは `player.html`・`index.html`・`slides/template.js`。**
  `template.js` は型の見本 19 枚。初回は最小例で 1 枚を作り、型を使いたい
  ときに見本からコピーする
- **`ytslide web` はブラウザを開かない。** カレントディレクトリを
  `http.server` で配って URL を出すだけ。`file://` で `player.html` を
  直接開いても動くので、手元の確認には要らない。また `web` の URL で出るのは
  `index.html` の一覧。追加したファイルを一覧に反映するには `ytslide index`
  が要る。`summary`・`icon` は省いても一覧に載り、説明は空文字、アイコンは
  `fa-file` になる（`src/ytslide/index.py`）。一覧への掲載条件とは区別する

**利用者の観点での見直し（2026-09-21）**:

最初の到達点を「自分の内容を 1 枚表示し、読み上げを確認できる」にする。
その後に、編集を繰り返す・一覧から開く・時間表示を合わせる・共有する、を
目的ごとに案内する。コマンドを全部順番に実行することを完成条件にしない。
既に決まっている対象 3 ファイルと外部ディレクトリを標準にする方針は維持する。
見直し後、利用者から TODO-099 本体の実施指示を受けた。
別担当のレビューを受け、初回は最小例、型のコピーは次の段階に分けた。
実装は文書とスライドで担当を分け、reviewer の確認後に verifier が実測する。

| 今回の担当 | モデル | reasoning effort |
|------------|--------|------------------|
| main | GPT-6（詳細 ID は未確認） | 未確認 |
| 文書の実装 | 親から継承（詳細 ID は未確認） | 未確認 |
| スライドの実装 | gpt-5.6-terra | medium |
| reviewer | gpt-5.6-sol | high |
| verifier | gpt-5.6-luna | medium |

上の Sonnet 5 の見込みは項目を立てたときの記録として保持する。

**検証方法・完了条件**:

- 空の作業ディレクトリから、文書の操作だけで `sample.js` を作れる。
  測定せずに 1 枚を再生でき、本文とナレーションを保存して再読み込みすると
  修正が反映される。実際に使ったコマンド・URL と結果を報告に残す
- `ytslide index` の前後で一覧のリンクを確認し、リンクから自作スライドを
  開ける。説明・アイコンの変更も反映される。`summary`・`icon` を省いた例も
  警告付きで一覧に載ることを確かめる
- 任意の測定は別に試し、`ytslide update --slides sample` による
  `duration` の書き戻しと一覧の生成を確認する。手元の既定音声が Online TTS
  と異なる場合もあるため、測定値と任意の端末音声が一致するとは説明しない
- `ytslide web` の HTTP URL と、公開用に必要なファイルだけを置いた別の
  ディレクトリで再生と一覧を確認する。別端末での接続を実測できない場合は
  未確認と明記し、同一端末での HTTP 確認を別端末の実測と扱わない
- `player.html?slides=user` を 1280×720 と 390×844 で開き、変更した枚と
  後続の説明に欠け・はみ出し・矛盾がないか確認する。読み上げを確認し、
  測定秒数と `duration` を報告する。3 枚目の本文のフォントサイズを両画面で
  実測し、上記の下限と比較する

**分担**: 文書とスライドの変更で、書いたとおりに試せるコマンド手順なので
確認を分ける（TODO-017）。同じ内容を 3 ファイルに書くので reviewer も入れる。

- main: 設計と執筆
- reviewer: 対象 3 ファイルの食い違い、既存の節との重複、初心者が補わないと
  進めない操作、必須と任意の混同を確認する。その後に verifier が再現する
- verifier: 空のディレクトリで、書いたとおりのコマンドを実際に走らせて再現する。
  **検証対象のコミットから隔離した環境に入れる**。過去の実測では手元の
  0.7.2.dev6 が TODO-098 より古かったため、現在のコマンドの参照先と版を
  確認する。既存の利用環境を一律に入れ直す手順にはしない。
  上記の検証方法に従い、操作と測定値を報告する

今回の TODO 見直しの分担理由と確認結果は
[`archives/agents/TODO-099/`](archives/agents/TODO-099/) に残す。

---

## 完了済み

1 項目 1 ファイル。`archives/todo/` にある（新しい順）。
**やらないと決めたものの理由も記載してある。** 蒸し返す前に読むこと。

- [**TODO-098.** `ytslide init` した先に既定の `readme` が無い](archives/todo/TODO-098.%20ytslide%20init%20した先に既定の%20readme%20が無い.md)
- [**TODO-097.** TODO-096 で残った文書と実態の食い違いを直す](archives/todo/TODO-097.%20TODO-096%20で残った文書と実態の食い違いを直す.md)
- [**TODO-096.** `ytslide` コマンド 1 つで扱えるようにする](archives/todo/TODO-096.%20ytslide%20コマンド%201%20つで扱えるようにする.md)
- [**TODO-095.** リポジトリの外に自分のスライドを置けるようにする](archives/todo/TODO-095.%20リポジトリの外に自分のスライドを置けるようにする.md)
- [**TODO-094.** `duration` を戻す案内が git を前提にしている](archives/todo/TODO-094.%20duration%20を戻す案内が%20git%20を前提にしている.md)
- [**TODO-093.** `index.html` に `README.md` を載せる](archives/todo/TODO-093.%20index.html%20に%20README.md%20を載せる.md)
- [**TODO-092.** 消音の切り替えをヘッダーのスピーカーマークに移す](archives/todo/TODO-092.%20消音の切り替えをヘッダーのスピーカーマークに移す.md)
- [**TODO-091.** 読み上げの声を一覧から選べるようにする](archives/todo/TODO-091.%20読み上げの声を一覧から選べるようにする.md)
- [**TODO-090.** `duration` を合わせるのにスクリプトが要る件を見直す](archives/todo/TODO-090.%20duration%20を合わせるのにスクリプトが要る件を見直す.md)
- [**TODO-089.** `slides/` からスライドの一覧を生成するスクリプトを作る](archives/todo/TODO-089.%20slides%20からスライドの一覧を生成するスクリプトを作る.md)
- [**TODO-088.** 冒頭の主張が実態と合っているか見直す](archives/todo/TODO-088.%20冒頭の主張が実態と合っているか見直す.md)
- [**TODO-087.** GitHub Pages で公開する](archives/todo/TODO-087.%20GitHub%20Pages%20で公開する.md)
- [**TODO-086.** プレイヤーで縦型・横型を切り替える（対応しない）](archives/todo/TODO-086.%20プレイヤーで縦型・横型を切り替える.md)
- [**TODO-085.** リポジトリに LICENSE を置く](archives/todo/TODO-085.%20リポジトリに%20LICENSE%20を置く.md)
- [**TODO-084.** 文書・スライドと実装の食い違いをまとめて直す](archives/todo/TODO-084.%20文書・スライドと実装の食い違いをまとめて直す.md)
- [**TODO-078.** 音声の再生失敗を画面に知らせる](archives/todo/TODO-078.%20音声の再生失敗を画面に知らせる.md)
- [**TODO-074.** 表示中のスライド番号を URL に載せる](archives/todo/TODO-074.%20表示中のスライド番号を%20URL%20に載せる.md)
- [**TODO-077.** チャプター一覧を検索できるようにする](archives/todo/TODO-077.%20チャプター一覧を検索できるようにする.md)
- [**TODO-075.** 再生の設定を覚える](archives/todo/TODO-075.%20再生の設定を覚える.md)
- [**TODO-083.** 型の見本に帯と横並びの手順を足し、「カード 3 枚」を段数混在に差し替える](archives/todo/TODO-083.%20型の見本に帯と横並びの手順を足し、「カード%203%20枚」を段数混在に差し替える.md)
- [**TODO-082.** `template.js` を入口に加え、`user.js` 9 枚目の案内先にし、削りやすい見本にする](archives/todo/TODO-082.%20template.js%20を入口に加え、user.js%209%20枚目の案内先にし、削りやすい見本にする.md)
- [**TODO-081.** `slides/user.js` 9 枚目にリンクを埋め込む](archives/todo/TODO-081.%20slides%20user.js%209%20枚目にリンクを埋め込む.md)
- [**TODO-073.** リポジトリの入口に `index.html` を置く](archives/todo/TODO-073.%20リポジトリの入口に%20index.html%20を置く.md)
- [**TODO-079.** `docs/User.md` は `body` を標準として書く](archives/todo/TODO-079.%20docs%20User.md%20は%20body%20を標準として書く.md)
- [**TODO-080.** 先頭・末尾へ送るボタンを付け、「最初から」を外す](archives/todo/TODO-080.%20先頭・末尾へ送るボタンを付け、「最初から」を外す.md)
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
