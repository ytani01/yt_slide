# TODO-089. `slides/` からスライドの一覧を生成するスクリプトを作る

|        | main                 | 担当                              |
|--------|----------------------|-----------------------------------|
| 見込み | Opus 5 / effort high | implementer + reviewer + verifier |
| 実施   | Opus 5 / effort high | implementer + reviewer + verifier |

| 担当        | モデル   | effort | output | cache_creation | 料金の割合 |
|-------------|----------|--------|--------|----------------|-----------|
| main        | Opus 5   | high   | 45,856 | 133,555        | 61% |
| implementer | Sonnet 5 | medium | 32,480 | 101,425        | 18% |
| verifier    | Sonnet 5 | medium | 23,844 | 97,424         | 14% |
| reviewer    | Sonnet 5 | high   | 17,332 | 65,567         | 6% |
| 合計        |          |        | 119,512 | 397,971       | 概算 $8.8 |

- 3 担当とも `~/.claude/agents/*.md` の定義のまま（`model: sonnet`）。
  モデルの上書きはしていない

## きっかけ

スライドの一覧（`index.html`）が `<li>` を手で書いたリンク集で、
`slides/` を見て作られていなかった。スライドを足すたびに `index.html` にも
1 つ足す手作業が要り、他のサーバーへ持っていくときは持っていかないスライドの
`<li>` を消す必要もあった。

立てたときは、`README.md` 冒頭の「ビルドもインストールも不要」を理由に
生成案を外し、`player.html` の側で `slides/` を列挙できるかを 3 環境
（`file://`・Apache・GitHub Pages）で実測する組み立てだった。

**着手前に利用者が方針を変えた（2026-09-21）。ビルド不要に固執しない。**
yt_slide の主眼は「既存のスライド作成サイトなどに頼らない」「好きなサーバーに
必要なファイルを置けば公開できる」の 2 つで、ビルドの有無はそこに含まれない。
`duration` を合わせるのにどのみち `tools/` のスクリプトを走らせるので、
そのついでに一覧も生成する。ブラウザ側での列挙は検討しないので、3 環境の
実測は要らなくなった。

着手時に利用者と決めたこと:

- 一覧の説明文とアイコンは `slidesConfig` に `summary` / `icon` として持たせる
- 生成先は `index.html` 直書き。マーカーの間を差し替える。`index.html` は
  静的なままで、JavaScript による描画はしない（`file://` で動くため）
- 並びは `readme` を先頭、残りはファイル名の辞書順。順番用の項目は持たせない

## やったこと

- **`tools/make-index.py` を作った。** `slides/*.js`（`_` 始まりを除く）の
  `slidesConfig` から `summary` と `icon` を正規表現で読み、`index.html` の
  マーカーコメントの間の `<li>` を差し替える。JS のパーサは使わず、
  `measure-duration.py` が `rules` を読むのと同じやり方に揃えた。
  `summary`・`icon` が無いスライドは標準エラーに警告を出し、空文字と
  `fa-file` で埋めて生成は続ける
- **`slides/*.js` 5 つの `slidesConfig` に `summary` と `icon` を足した。**
  値はそれまで `index.html` に手で書いてあったものをそのまま移した
- **`index.html` にマーカーのコメントを入れ、生成結果に差し替えた。**
  各項目の HTML は元と同じ。並びだけ規則どおりに変わった
  （旧: readme, user, template, developer, claude-memo →
  新: readme, claude-memo, developer, template, user）
- **`tools/test_make_index.py` を作った。** `summary`/`icon` の取り出し、
  並びの規則、マーカー間の差し替え、マーカーが無いときに止まること、
  `\'` の戻し変換を確かめる
- **文書を追従させた。** `docs/User.md` の「手順」3 を
  「`tools/make-index.py` を走らせる」に変え、`slidesConfig` の説明に
  `summary`/`icon` の段落を足した。「他のサーバーへ持っていくとき」の
  `<li>` を消す記述も、`.js` を消してから走らせ直す形に書き換えた。
  `README.md`（冒頭の案内とファイル構成表）、`CLAUDE.md`（構成とテストの本数）、
  `slides/user.js` の「手順3」のスライドも直した
- **`slides/user.js` の `duration` を測り直した**（`--slides user 5 --write`）。
  ナレーションを変えたが 11 秒のまま変わらなかった

一覧に出したくないスライドは、ファイル名の頭に `_` を付ける運用にし、
`docs/User.md` に書いた（`?slides=` では今までどおり開ける）。

## レビューで直したこと

- `summary` に `\'`（エスケープしたアポストロフィ）が入ると、生成した HTML に
  バックスラッシュがそのまま残っていた。`measure-duration.py` の
  `load_rules()` と同じ戻し変換を入れ、テストも足した
- `summary` がエスケープ無しで挿入される（HTML を埋め込める代わりに `<`・`&`
  がそのまま解釈される）仕様を `docs/User.md` に書いた

**直さないと決めたもの:**

- マーカーが 2 組あるとき・入れ子のときの挙動（2 組は両方が同じ内容に、
  入れ子は `END` が取り残される）。マーカーには「手で編集しない」と書いてあり、
  踏む筋が無い
- 一覧の並びが以前と変わること。利用者が選んだ仕様どおり

## 確かめたこと

verifier が 8 項目すべて実測し、食い違いは 0 件だった
（`archives/agents/TODO-089/verifier-report.md`）。

- `tools/make-index.py` を実行しても `index.html` に差分が出ない（冪等）
- 仮のスライドを `slides/` に置くと一覧が 6 件に増え、消して走らせ直すと
  5 件に戻る
- 並びが `readme` 先頭 + 残り辞書順になっている
- `summary` に `\'` を入れてもバックスラッシュが残らない
- テスト 3 本（`test_make_index.py`・`test_measure_duration.py`・
  `test_make_video.py`）が通る
- Playwright で `file://` と `python3 -m http.server` の両方から
  `index.html` を開き、5 件のリンク・アイコン・説明文が出て、リンク先が
  `player.html?slides=<名前>` になっていることを確認した。説明文に `\` や
  生の HTML タグは出ていない
- `docs/User.md` の「手順」を書いてあるとおりになぞって、新しいスライドが
  一覧に出るところまで再現できた
- `slides/user.js` の「手順3」のスライドが `docs/User.md` の手順と合っている

## 分担の振り返り

- **implementer（Sonnet 5 / medium）** は仕様どおりに作り、仮ファイルでの
  追加・削除まで自分で試した。文書の追従も指示した範囲を超えず収まった。
  自分で「並び順が変わる」ことを利用者確認事項として挙げた
- **reviewer（Sonnet 5 / high）** が要修正 1 件を実測付きで見つけた
  （`summary` の `\'` が生成 HTML に残る）。これは実装者もテストも
  拾えていなかった。正規表現で JS を読む方式の穴で、**同じ方式の先例
  （`measure-duration.py`）と突き合わせたから出た指摘**。既存コードとの
  揃いを観点に入れたのが効いた
- **verifier（Sonnet 5 / medium）** は 8 項目すべてを実測し、新しい発見は
  無かった。ブラウザでの表示確認と「文書どおりになぞる」再現を依頼に
  書いたので、静的な読み合わせには逃げなかった
- 見込み（implementer + reviewer + verifier）と食い違わなかった。新しい
  スクリプトを足し、5 ファイル＋文書 4 つに波及する規模なので、3 担当とも要った
- **次に同じ規模（新しいスクリプト 1 本 + 文書の追従）をやるなら、同じ組み方でよい。**
  ただし main が 61%（$5.4）を占めた。着手前に利用者と決めることが 3 つあり、
  そのやり取りと差分の読み直しが main に乗っている。**決めることを 1 回の
  `AskUserQuestion` にまとめられれば減らせた**（今回は方式変更の申し出が
  途中で入り、並び順の質問が後から 1 回増えた）
