# TODO-094 verifier-report

## 変更範囲の確認

`git diff docs/User.md slides/user.js` で確認。指示どおり以下 2 箇所のみ:

- `docs/User.md`: `--write` の説明の直後の 1 行を
  「`git checkout` で戻す」から「`--write` を付けずに実行すれば、書き換えずに
  秒数だけ確認できる」に変更。
- `slides/user.js`: スライド 13 の注意ボックスの `<span>` 文言を同様に変更。

`git status` では上記 2 ファイルのみが modified。範囲外のファイルの変更は無い。

## 1. コマンド実行での確認

`--write` なしで単一スライドを測定。

```
$ git diff --stat slides/user.js
 slides/user.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ timeout 120 python3 tools/measure-duration.py --slides user 13
スライド 13: 原文 81 字 / 読み 78 字 / 実測 12.456s / BASE_SPEED_MULTIPLIER=1.4 倍速 8.90s -> duration: 9
exit:0

$ git diff --stat slides/user.js
 slides/user.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

実行前後で `git diff --stat` の内容（1 file changed, 1 insertion, 1 deletion =
今回の文言変更のみ）が変わらず、ファイルへの追加の書き換えは起きなかった。
かつ秒数（duration: 9）が標準出力に表示された。(a)(b) とも成立を確認。

## 2. 旧記述の取りこぼし

```
$ grep -rn 'git checkout' docs/ slides/ tools/ README.md
（0 件、grep の終了コード 1）
```

取りこぼし無し。

参考（範囲外の所見、対応不要）: `tools/measure-duration.py` のモジュール
docstring 中に「戻すのは git の差分で足りる」という記述が別途あるが、これは
文字列 `git checkout` ではなく、今回の依頼の変更対象ファイル（docs/User.md,
slides/user.js）にも含まれない。指示の確認範囲外なので直していない。念のため
報告のみ。

## 3. docs/User.md の文脈のつながり

該当箇所を読むと、`--write` の実行例・出力例のすぐ後に新しい案内が続いており、
文脈として自然につながっている（「変わったスライドだけ出力される。`--write`
を付けずに実行すれば、書き換えずに秒数だけ確認できる。」の後に `-n` の説明が
続く）。違和感は無い。

## 4. 構文確認

`node --check slides/user.js` を実行し、exit code 0 で成功。構文エラー無し。
（ブラウザでの表示確認は、node --check が通ったため実施していない）

## 確かめられなかったこと・判断できないこと

- スライド 13 を画面表示させての「文字が欠けていないか・はみ出していないか」
  の確認は行っていない（node --check が通ったため省略した。ブラウザでの
  表示確認が要ると判断されれば追加で実施可能）。
- `tools/measure-duration.py` docstring 内の git 前提の記述（上記参考）が
  今回の項目の対象に含めるべきかどうかは判断できない。管理者の判断に委ねる。
