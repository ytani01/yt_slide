# TODO-094. `duration` を戻す案内が git を前提にしている

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 5,989 | 17,932 | 87% |
| verifier | Sonnet 5 | medium | 2,805 | 24,631 | 13% |
| 合計 |  |  | 8,794 | 42,563 | 概算 $0.9 |

- verifier は定義（`~/.claude/agents/`）のモデル・effort のまま。上書きしていない
- main のモデルは見込みと違い Opus 5 のままだった（切り替えるのは利用者）

## きっかけ

`measure-duration.py --write` の案内に「気に入らなければ `git checkout` で
戻せる」と書いてあった。一般の利用者はスライドを git で管理しないので、
この案内は成り立たない。

`--write` を付けなければ書き換えずに秒数だけ出るので、そちらを案内すれば
git に頼らずに済む。

## やったこと

git 前提の記述を 3 か所直した。文面はいずれも「`--write` を付けなければ
書き換えずに秒数だけ出る」の趣旨に揃えた。

- `slides/user.js` スライド 13「まとめて書き換える」の注意ボックス
- `docs/User.md` の `--write` の説明の直後
- `tools/measure-duration.py` のモジュール docstring

docstring の 1 か所は、着手時点では範囲外としていた。verifier が見つけて
報告してきたので、同じ根拠の記述として今回まとめて直した。

ナレーション（`--write` を付けたときの説明）は画面の文と食い違わないので
変えていない。`duration` も測り直していない。

## 確かめたこと

verifier に依頼した（報告は
[archives/agents/TODO-094/verifier-report.md](../agents/TODO-094/verifier-report.md)）。

- `tools/measure-duration.py --slides user 13` を `--write` なしで実行し、
  実行前後の `git diff --stat slides/user.js` が変わらないこと、
  `duration: 9` が表示されることを確認した。新しい案内のとおりに動く
- `grep -rn 'git checkout' docs/ slides/ tools/ README.md` が 0 件
- `docs/User.md` の変更箇所が `--write` の実行例の直後に続いて読めること
- `node --check slides/user.js` が通ること

docstring を直したあとに `ast.parse` で構文を確かめた（main）。

## 分担の振り返り

- verifier は、依頼した 4 点をすべて実行で確かめたうえ、範囲外として
  `tools/measure-duration.py` の docstring にも同じ趣旨の記述があることを
  見つけた。`grep 'git checkout'` では引っかからない書き方だったので、
  管理者側の範囲の切り方が足りていなかった
- 見込みは verifier 1 人。食い違わなかった。文言だけの変更で挙動が
  変わらないため reviewer は入れていない
- 次に同じ規模（文言の差し替えが数か所）の項目をやるなら、同じく
  verifier 1 人でよい。ただし**依頼の対象範囲は、直す文字列ではなく
  「その主張が書かれている場所」で渡す**。今回は `git checkout` という
  文字列で範囲を切ったため、「git の差分で足りる」という言い換えが
  抜けた。`grep -rn -i 'git'` のように広く引いてから絞るほうがよい
