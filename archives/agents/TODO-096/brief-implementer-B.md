# TODO-096 実装（第 2 段: 文書とスライドの書き換え）

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
（ブランチ `cmd`）。項目の全文は `TODO.md` の TODO-096。

第 1 段で `tools/*.py` は `src/ytslide/` へ移り、`tools/` は消えた。
**先に `src/ytslide/cli.py` と `pyproject.toml` と
`archives/agents/TODO-096/implementer-A-report.md` を読み、
実際のサブコマンドとオプションを確かめてから書くこと。**
文書に書くコマンドは、実際に動くものでなければならない。

## 目的

`tools/` のスクリプトを名指ししている記述を、`ytslide` のサブコマンドに
書き換える。インストールが要るようになったことも書く。

## 対象範囲

```
grep -rn "tools/" --include="*.md" --include="*.js" --include="*.html" . | grep -v archives/ | grep -v '^./TODO.md'
```

で出るところ全部（`TODO.md` と `archives/` は触らない）。
`README.md`、`CLAUDE.md`、`AGENTS.md`、`docs/User.md`、`docs/Developer.md`、
`player.html` のコメント、`slides/` の 5 本
（`readme.js`・`user.js`・`developer.js`・`template.js`・`claude-memo.js`）。
`index.html` のマーカーは第 1 段で直っているので触らない。

`src/ytslide/` 以下と `tests/` は触らない。

## 書き換えの対応

| 今 | これから |
|---|---|
| `tools/make-index.py` | `ytslide index` |
| `tools/measure-duration.py` | `ytslide measure` |
| `tools/make-video.py` | `ytslide video` |
| `tools/test_make_index.py` など 3 本 | `tests/` の 3 本（`uv run pytest`） |

オプションは名前も意味も変わっていないので、
`tools/measure-duration.py --slides user --all --write` は
`ytslide measure --slides user --all --write` になる。

`video` の `--only` だけは打ち方が変わった（`--only 1 2` ではなく
`--only 1 --only 2`）。文書に出てくるなら新しい形に直す。

`~/yt_slide/tools/make-index.py --root ~/my-slides` のように、リポジトリからの
相対パスで呼んでいたところは、`ytslide index --root ~/my-slides` にする。
そもそもパスを知らなくてよくなったのが今回の狙いなので、
「リポジトリの場所を覚えておく」といった前置きが残っていたら消す。

## 書き足すこと

- **`README.md` にインストールの手順。** 「必要なもの」の節の近くに置く。

  ```
  uv tool install 'git+https://github.com/ytani01/yt_slide'          # measure と index
  uv tool install 'git+https://github.com/ytani01/yt_slide[video]'   # video も使う
  ```

  リポジトリのチェックアウトからなら `uv tool install '.[video]'`。
  `video` を extra に分けた理由（Playwright が重い）も 1 行で書く。
  `curl`・`ffprobe`・`ffmpeg`・chromium が要る話は今ある記述を活かす
- **`README.md` のファイル一覧の表**から `tools/` の行を消し、
  `src/ytslide/` と `tests/` と `pyproject.toml` の行にする
- **`CLAUDE.md` の「構成」**を直す。「ビルドも依存関係のインストールも不要」は
  もう正しくない。**プレイヤー側（`player.html` と `slides/*.js`）は今も
  ブラウザで開くだけで動き、インストールが要るのは `ytslide` だけ**という
  切り分けが読み取れるように書く。テストの 3 本の名前も直す
- **`AGENTS.md` の「検証」**のテスト 2 本の名前を直す（`uv run pytest`）
- **`docs/User.md` の「リポジトリの外に自分のスライドを置く」あたり**は、
  `ytslide init` 1 つで済むようになったので、手順をそれに合わせて書き直す。
  `player.html` や `index.html` を手でコピーする案内が残っていたら
  `ytslide init` に寄せる。`ytslide web` で手元で確かめられることも書く

## 守ること

- **今ある文体と用語をそのまま使う。** 「スライド一式」「読み上げ秒数」など、
  このリポジトリで使っている語から外れない。新しい言い回しを作らない
- **正本を増やさない。** `CLAUDE.md` に説明の写しを置かない
  （`CLAUDE.md` の「触る前に読むもの」の方針）。`docs/` には TODO 番号を書かない
- **`slides/*.js` の `duration` は触らない。** ナレーションを変えると
  読み上げ秒数が変わるが、測り直しは管理者が後でまとめて行う。
  **どのスライド一式の何枚目のナレーションを変えたかを、報告に必ず並べる**
  （例: `user.js` の 12・25 枚目）。これが無いと測り直せない
- スライドの本文（HTML）だけを変えてナレーションを変えていない枚は、
  測り直しが要らない。報告ではナレーションを変えた枚と分けて書く

## 完了条件

1. 上の `grep` が `TODO.md` と `archives/` の外で 1 件も出ない
2. 文書に書いたコマンドが実際に動く。**`README.md` と `docs/User.md` に
   書いたコマンド例は、`--help` で綴りを確かめるか、実際に叩いて確かめる**
   （`video` と、ネットワークが要るものは `--help` の確認でよい）
3. ナレーションを変えた枚の一覧が報告にある

## 報告

`archives/agents/TODO-096/implementer-B-report.md` に書く。
変更点（ファイルごとに 1〜2 行）、ナレーションを変えた枚の一覧、
完了条件 2 で叩いたコマンドと結果、残る懸念。
**返事は 5 行以内。** コミットはしない。
