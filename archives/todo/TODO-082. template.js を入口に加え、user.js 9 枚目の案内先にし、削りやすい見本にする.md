# TODO-082. template.js を入口に加え、user.js 9 枚目の案内先にし、削りやすい見本にする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |
| 実施 | Opus 5 / effort high（途中まで Sonnet 5） | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | 記載なし | 59,412 | 177,408 | 78% |
| verifier | Sonnet 5 | medium | 30,929 | 198,999 | 22% |
| 合計 |  |  | 90,341 | 376,407 | 概算 $8.6 |

- 項目を立てたのは Sonnet 5 の main。着手のときに利用者が Opus 5 へ切り替えた
- main は Claude Code 本体なので `effort` の記載が無い
- verifier は定義（`.claude/agents/verifier.md`）のまま Sonnet 5 / effort medium。
  呼び出しでの上書きはしていない

## きっかけ

`slides/template.js` は型の見本だが、`index.html` の一覧に無く、そこから
たどれなかった。`user.js` 9 枚目の案内先も、実例の `claude-memo.js` の
ままだった（TODO-081）。コピーして使う入口としては見本のほうが向いている。
見本そのものも、型が 9 種で中身が素朴だった。

## やったこと

- `index.html` の一覧に `template` の項目を足した。既存の 4 つはそのまま残した
- `slides/user.js` 9 枚目、左のカードのリンク先を `slides/template.js` に替えた
  （題名・説明文・アイコンも直した）
- `slides/template.js` を 9 種から 17 種にした。足したのは表紙、カード 3 枚、
  前後の差分、割合バー、Q&A、本文と脚注、画像、画像（全面）
- 既存 9 種を含めて、すべてのサンプルの中身を作り直した。グラデーション、影、
  半透明の重ね、アイコンの地など、Tailwind のクラスだけで出せる見栄えを使った
  （アニメーションは入れていない）
- 1 枚を `// ── N. 名前 ──` のコメントで区切り、冒頭に「要らない型はその範囲を
  丸ごと削除してよい」と書いた
- 引用スライドの出典を GitHub の `docs/User.md` へのリンクにした。
  `target="_blank"` `rel="noopener"` と、再生の切り替えに伝わらないよう
  `onclick="event.stopPropagation()"` を付けた（TODO-081 のカードと同じ形）
- `images/spheres.jpg` と `images/nebula.jpg` を足した。写真は用意できないため、
  Pillow で計算して描いた（球はレイトレーシング、星雲はノイズの重ね）
- `docs/User.md` に「画像を入れる」の節を足し、「他のサーバーへ持っていくとき」に
  `images/` を加えた。`README.md`（公開に要るもの、スライドの表、ファイル構成）と
  `docs/Developer.md`（ファイルの表）も直した
- `tools/measure-duration.py --slides template --all --write` で `duration` を
  測り直した

## 確かめたこと

verifier が Playwright で、1280×720 と 390×844（タッチ設定）の両方を実測した
（`archives/agents/TODO-082/verifier-report.md`）。

- 全 17 枚が console・page のエラー 0 件で描画され、題名の並びが想定どおり
- 本文が枠からはみ出していない（`#slide-canvas` の `scrollHeight` と
  `clientHeight` が一致）
- 画像 2 枚とも `naturalWidth`/`naturalHeight` が 1280×720、`complete` が true、
  404 無し。全面に敷いた枚でも文字が画像に埋もれず読める
- `index.html` の項目から `player.html?slides=template` が開ける
- `user.js` 9 枚目のカードの `href`・`target`・`rel` が想定どおりで、
  クリックしても再生状態とスライド番号が変わらない。引用スライドのリンクも同じ
- 12 枚目「割合バー」をコメントの区切りごと削った版で、14 枚が繰り上がって動いた
- 枚数の記述（先頭のコメント・`heading`・表紙・7 枚目の数字・13 枚目の Q&A）が
  すべて 17 で、15 の書き残しが無い
- `python3 tools/test_measure_duration.py` が終了コード 0

## 分担の振り返り

- **verifier が見つけたもの:** 差し戻すような食い違いは無かった。実測で
  確かめられたのは、画像 2 枚が実際に読み込まれていること（`naturalWidth`）、
  枠からはみ出していないこと、1 枚削っても動くこと、枚数の記述に書き残しが
  無いこと。どれも main の目視では見落としやすい
- **見込みと食い違ったところ:** 項目を立てたときは「型を数種足す」だけの
  つもりで、担当も verifier 1 人と見込んだ。実際には作業中に 3 回（サンプルの
  作り込み、引用のリンク、画像の型）範囲が増え、verifier を 4 回動かした。
  それでも verifier の料金は全体の 22% に収まった。**同じ担当に続けて頼んだ**
  ため、配信の立ち上げと計測の組み方を毎回作り直さずに済んだのが効いている
  （2 回目以降は 1 回あたり 10 万トークン前後）
- **次に同じ規模で組むなら:** 見た目を作り込む項目では、**利用者に見せる
  スクリーンショットを verifier に撮らせて使い回す**。今回は verifier が撮った
  ものを main がそのまま添付できたので、main 側で撮り直す分が要らなかった。
  依頼のたびに「他の枚の測り直しは要らない」と範囲を切ることも続ける。
  一方、**利用者の判断が要るもの（見本に使う画像の案）は、実装を始める前に
  出して選んでもらう**。今回は画像の案を 3 つ作ってから選んでもらったので、
  2 つ分の生成が無駄になった。先に案を言葉で出し、選ばれた 1 つだけ作れば済む
