# TODO-096 レビュー

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
（ブランチ `cmd`、未コミット）。項目の全文は `TODO.md` の TODO-096。

## 目的

`tools/*.py` 3 本を `ytslide` という 1 つの CLI にまとめ、
`tools/` を指す記述を全部書き換えた差分を、規約と設計に照らして見る。

## 読むもの

- `TODO.md` の TODO-096（何を決めたか）
- `archives/agents/TODO-096/implementer-A-report.md`（第 1 段の報告）
- `archives/agents/TODO-096/implementer-B-report.md`（第 2 段の報告）
- `git diff HEAD` と `git status`（新規ファイルは `git diff HEAD --` に出ない
  ので、`git status --porcelain` で `??` のものも読む）
- リポジトリの `CLAUDE.md`（構成と文書の管理方針）

## 見てほしいところ

挙動が変わる項目なので、動くかどうかではなく **正しいか・良いか** を見る。

1. **オプションの名前と意味が保たれているか。** 決めごとは「既存のオプションは
   名前と意味をそのまま移す」。`git show HEAD:tools/measure-duration.py` などで
   元の argparse と `src/ytslide/cli.py` を突き合わせる。
   `--only` だけは `--only 1 --only 2` に変わった（承認済み）
2. **置き場所の解決（`src/ytslide/paths.py`）。** install したとき
   （同梱データを使う）と、リポジトリのチェックアウトから動かしたとき
   （リポジトリ直下を使う）の両方で正しいか。`PLAYER_HTML` の落とし方、
   `--root` を渡したときと渡さないときの違い
3. **`ytslide init` が既にあるファイルを壊さないか。** 途中で失敗したときに
   中途半端な状態が残らないか
4. **`src/ytslide/index.py` のマーカーの正規表現。** 開始マーカーをゆるく
   照合するようにしたことで、意図しないところに当たらないか
   （貪欲・非貪欲、`END` との対応、`index.html` に他の HTML コメントが
   あるとき）
5. **文書とスライドの記述が、実際の CLI と合っているか。**
   `README.md`・`docs/User.md`・`docs/Developer.md`・`CLAUDE.md`・`AGENTS.md`・
   `slides/*.js` に出てくるコマンドの綴りとオプションを、
   `src/ytslide/cli.py` と突き合わせる
6. **同じ主張が 2 か所で食い違っていないか。** 特に
   「インストールが要るのか要らないのか」。プレイヤー側
   （`player.html` + `slides/*.js`）はブラウザで開くだけ、`ytslide` は
   インストールが要る、という切り分けが全部の文書で揃っているか。
   `CLAUDE.md` に `docs/` の写しが増えていないか
7. **書いた本人が写し間違えていないか。** 第 2 段は文書を書き換える担当
   だったので、「元にあったものを写した」で疑っていない箇所がありうる
8. **テストが薄くなっていないか。** `git show HEAD:tools/test_*.py` と
   `tests/test_*.py` を突き合わせ、落ちた assert が無いか見る

## してはいけないこと

- **コードもファイルも直さない。** 見つけたことは報告するだけ
- **原因の切り分けや、境界線上の判断もしない。** 迷ったら
  「実害は未確認」と添えて報告する
- `slides/*.js` の `duration` の値は見なくてよい（測り直しは管理者が後で行う）
- レイアウトや見た目の評価は要らない（ブラウザを起動しなくてよい）

## 報告

`archives/agents/TODO-096/reviewer-report.md` に書く。
指摘は「場所（`ファイル:行`）・何が問題か・なぜ問題か・実害の見込み」の 4 点で、
重いものから並べる。問題が無かった観点は 1 行で済ませる。
**返事は 5 行以内**（終わったか・報告ファイルのパス・いちばん重い指摘）。
