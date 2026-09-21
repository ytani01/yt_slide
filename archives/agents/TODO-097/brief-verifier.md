# TODO-097 verifier への依頼

## 目的

TODO-097 で直した文書（未コミットの作業ツリー）が、実際の `ytslide` の
実装と食い違っていないかを確かめる。**実測で確かめる。** 読み合わせだけの
報告は受け付けない。

## 対象

`git diff` で出る 5 ファイル。

```
git diff --stat   # AGENTS.md CLAUDE.md README.md docs/Developer.md docs/User.md
```

## 確認すること

1. **テストの本数と名前。** `uv run pytest` を実行し、本数・ファイル名・
   結果を報告する。`CLAUDE.md`・`docs/Developer.md`・`AGENTS.md` の記述と
   突き合わせる
2. **`docs/Developer.md`「リポジトリの構成」の表。** 挙げた各ファイルが
   実在し、書いた役割が中身と合っているか（特に足した
   `src/ytslide/index.py`・`tests/test_index.py`・`tests/test_cli.py` の 3 行）
3. **`README.md`「インストール」のサブコマンド表。** `ytslide --help` の
   一覧と過不足なく一致するか。各行の説明が実際の挙動と合っているか
4. **`--root` の有無。** 「`--root` があるのは `measure`・`index`・`update`・
   `video`。`init` と `web` は無い」（`docs/User.md`）を各サブコマンドの
   `--help` で確かめる
5. **コマンド例が動くか。** 空の一時ディレクトリ（`/tmp` ではなく
   スクラッチパッド配下）で `ytslide init` → `ytslide web -p <空きポート>`
   を実際に動かす。`ytslide update` は Online TTS への通信が要るので、
   通らなければ `--help` までで良い。**通らなかったことも報告する**
6. **README から `docs/User.md#リポジトリの外に自分のスライドを置く` への
   リンク**が、実在する見出しを指しているか

## 見なくてよいもの

- 日本語の言い回し・文体の good/bad
- `archives/` の中身、TODO-096 以前の記述の妥当性
- `player.html`・`slides/*.js` の表示や読み上げ（今回は触っていない）

## 守ること

- **コードも文書も直さない。** 見つけたことは報告だけ
- **原因の切り分けや、境界線上の判断もしない。**「実害は未確認」と添えて
  報告する
- 一致したものは 1 行で良い。**食い違いだけ詳しく**書く
- 測った値・実行したコマンドとその出力を報告に載せる（載っていなければ
  測っていないものとして扱う）

## 報告

`archives/agents/TODO-097/verifier-report.md` に書く。
返事は「終わったか・報告ファイルのパス・判断が要る点」の **5 行以内**。
