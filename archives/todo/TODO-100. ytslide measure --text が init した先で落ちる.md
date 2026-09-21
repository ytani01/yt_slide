# TODO-100. `ytslide measure --text` が `init` した先で落ちる

|        | main                     | 担当                |
|--------|--------------------------|---------------------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |
| 実施   | Opus 5 / effort high     | reviewer + verifier |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 16,138 | 67,686         | 73%       |
| verifier | Sonnet 5 | medium | 9,529  | 42,471         | 14%       |
| reviewer | Sonnet 5 | high   | 8,399  | 46,850         | 13%       |
| 合計     |          |        | 34,066 | 157,007        | 概算 $2.6 |

- reviewer・verifier とも定義のモデル（sonnet）・effort のまま。上書きしていない

## きっかけ

`ytslide init` した先で `ytslide measure --text '文章'` を実行すると、
`FileNotFoundError` の traceback で止まった（2026-09-21 に実測）。
読みの置換表を読む `measure.py` の `load_slides_rules()` が
`slides/<名前>.js` を無条件に開き、既定の `readme.js` は `init` した先に
無いため。`cli.py` の存在チェックは `(numbers or all_)` のときだけなので、
`--text` だけのパスはそこを通らなかった。

TODO-098 で直したのは番号指定・`--all` のパスで、`--text` は残っていた。
TODO-099 の引き継ぎ中に見つけ、文書側は `--slides <名前>` を添えて回避していた。

## やったこと

- `measure.py` の `load_slides_rules()` に、`slides/<名前>.js` が無ければ
  空の置換表を返す分岐を入れた。共通の置換表（`player.html` の
  `SPEECH_RULES`）はそのまま当たる
- `tests/test_measure.py` に `test_prepare_without_slides_file` を足した。
  スライド一式が無い場所で `load_slides_rules()` が空を返すことと、
  共通の置換表が効くこと（`'TODO を見る'` → `'トゥードゥー を見る'`）の
  両方を見る
- `docs/User.md` の 2 か所を実際の挙動に合わせた。
  「省くと `readme.js` を探して止まる」→「省くとスライド一式の読みは効かず、
  共通の置換表だけで測る」、置換表の節の注意書きにも
  「`readme.js` が無ければ共通の表だけ」を添えた

`cli.py` は触っていないので、番号指定・`--all` で存在しないスライド一式を
指したときの UsageError（TODO-098 の挙動）は変わらない。

`--text` の例に添えた `--slides sample` は、`docs/User.md`・`slides/user.js`
のどちらも残した。スライド一式だけの読みを使うには依然 `--slides` が要るため。

## 決めたこと

- **無ければ空の置換表で続ける。** `--text` は「スライドに入れる前の下書きを
  測る」ためのもので、スライド一式が無くても測れるのが自然
- **置換表が使われなかったことを CLI では知らせない。** 付け忘れに気づけない
  という指摘（reviewer 検討 1）は出たが、実害は未確認で、`docs/User.md` には
  「省くと共通の表だけになる」と書いてある。実害が出てから考える

## 確かめたこと

- 空のディレクトリで `ytslide init` したあと
  `ytslide measure --root <dir> --text 'TODO を見る'` が traceback ではなく
  測定値を返す（`実測 1.464s -> duration: 1`、終了コード 0）
- 追加したテストは、`measure.py` の修正を戻すと単独で
  `FileNotFoundError` で落ちる（reviewer・verifier の双方が実測）
- `uv run pytest` 26 件すべて通る
- `ytslide measure --root <dir> --slides nosuch --all` と
  `… --slides nosuch 1` は、どちらも traceback ではなく UsageError
  （終了コード 2）で止まる
- リポジトリ直下ではスライド一式の置換表が今までどおり効く。
  `load_slides_rules('readme')` が 6 件を返し、
  `prepare('yt_slide の claude-memo')` が
  `'ワイティー スライド の クロード メモ'` になる（`yt_slide`・`claude-memo`
  はどちらも `readme.js` 側の語）
- `docs/User.md` の書き換えが、上の実測と一致する

## 分担の振り返り

- **reviewer が見つけたもの**: 要修正 0 件、検討 2 件。うち 1 件は
  「`--slides` の付け忘れに気づけない」という設計上の指摘で、実装の誤りでは
  ない。もう 1 件は変更前から同じ前提だったという指摘で、対応不要。
  「共通の置換表が効き続けるか」「`--all` の経路が変わっていないか」を
  コードの経路で追って確認した
- **verifier が見つけたもの**: 依頼文の手順の誤り（`init` に `--root`
  オプションは無く、カレントディレクトリ固定）。自分で `cd` して検証を
  成立させたうえで、手順と実装の食い違いとして報告した。
  リポジトリ直下で置換表が「実測値に効く」ところまでは、渡した文例
  （`'TODO を見る'`）が `readme.js` の語に当たらず未確認のまま残した
- **見込みとの食い違い**: main を Sonnet 5 / medium と見込んでいたが
  Opus 5 / high で動いた。分担（reviewer + verifier）は見込みどおり。
  料金は main が 73% を占めた。分岐 1 つの修正としては重いが、
  文書側の判断（`--slides` を残すか、警告を出すか）を 2 回利用者に聞いた分
- **次に同じ規模なら**: 利用者に聞く点を着手前に洗い出して 1 回にまとめる。
  今回は文書の書き方と警告の要否を別々に聞き、そのたびに main の会話が
  伸びた。reviewer の検討事項は事前に予想できる範囲だったので、
  「警告を出すか」は項目を立てるときに決められた。
  検証の依頼文にコマンドを書くときは、そのコマンドが実在するオプションで
  組まれているかを先に `--help` で確かめる
