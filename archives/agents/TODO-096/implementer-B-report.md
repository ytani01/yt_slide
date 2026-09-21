# TODO-096 実装（第 2 段: 文書とスライドの書き換え）報告

第 1 段で作った `src/ytslide/cli.py`・`pyproject.toml`・
`archives/agents/TODO-096/implementer-A-report.md` を読み、実際のサブコマンド
（`init`・`measure`・`index`・`update`・`video`・`web`）とオプションを
確かめたうえで書き換えた。`--only` は `implementer-A-report.md` の判断どおり
`--only 1 --only 2` の形（`multiple=True`）になっている。

## 変更点

- `.gitignore:12-14` — （第 1 段で追加済みの `/dist/`・`*.egg-info/` を含む。
  第 2 段ではコメント文言のみ整理）
- `player.html:793` — コメント `tools/measure-duration.py` → `ytslide measure`
- `slides/claude-memo.js:7`・`developer.js:8`・`readme.js:7`・`template.js:11`・
  `user.js:8` — コメント `tools/make-index.py が読む` → `ytslide index が読む`
- `slides/developer.js:70-71` — 表の行 `tools/measure-duration.py`・
  `tools/make-video.py` → `ytslide measure`・`ytslide video`
- `slides/developer.js:186` — コード例 `tools/measure-duration.py --slides ...`
  → `ytslide measure --slides ...`
- `slides/readme.js:224`・`slides/template.js:149` — コード例を同様に
  `ytslide measure ...` に書き換え
- `slides/user.js:156,324,345` — コード例・本文中の `tools/make-index.py`・
  `tools/measure-duration.py` → `ytslide index`・`ytslide measure`
- `docs/User.md` — 手順・`duration` の測り方・動画書き出しの各コマンド例を
  `ytslide measure`・`ytslide index`・`ytslide video` に置き換え。
  `--only 1 2` → `--only 1 --only 2`。「他のサーバーへ持っていくとき」と
  「リポジトリの外に自分のスライドを置く」を `ytslide init`／`ytslide web`
  中心の手順に書き直し、`git clone` してリポジトリの場所を覚えておく前置きを削除
- `docs/Developer.md` — 「リポジトリの構成」表の `tools/*.py` の行を
  `src/ytslide/measure.py`・`src/ytslide/video.py`・`tests/test_measure.py`・
  `tests/test_video.py` に置き換え、「プレイヤー側はインストール不要／`ytslide`
  だけインストールが要る」という切り分けを明記。`duration` の測り方の節の
  コマンド例を `ytslide measure` に置き換え
- `README.md` — 「必要なもの」の前に「インストール」の節を新設し、
  `uv tool install 'git+...'`／`'git+...[video]'`／`'.[video]'` と
  `video` を extra に分けた理由を記載。ファイル一覧の表から `tools/*.py` の
  行を消し、`src/ytslide/`・`tests/`・`pyproject.toml` の行に置き換え。
  `duration`・動画書き出しのコマンド例を `ytslide measure`・`ytslide video`
  に置き換え
- `CLAUDE.md` の「構成」— `tools/make-index.py` → `ytslide index`、
  プレイヤー側とインストール要否の切り分けを追記、テスト 3 本の名前を
  `tests/test_index.py`・`tests/test_measure.py`・`tests/test_video.py` に更新
- `AGENTS.md` の「検証」— テスト名を `tests/test_measure.py`・
  `tests/test_video.py`（`uv run pytest`）に更新

`index.html` のマーカーは第 1 段で直っているため、この回では触っていない。
`src/ytslide/` と `tests/` は触っていない。

## ナレーションを変えた枚（測り直しが必要）

| ファイル | 何枚目（コメントの通し番号） | 変更後のナレーション |
|---|---|---|
| `slides/readme.js` | Slide 8（「duration の測り方」） | `duration は目分量で決めません。ytslide measure というコマンドで実際の読み上げ秒数を測って入れます。` |
| `slides/developer.js` | Slide 2（「リポジトリの構成」） | `リポジトリの中身は player.html が本体、slides の下にスライドデータがあります。duration を測ったり動画に書き出したりするコマンドは、ytslide という CLI をインストールして使います。プレイヤー自体はビルドも依存関係のインストールも不要で、CDN から Tailwind などを読み込みます。` |
| `slides/developer.js` | Slide 6（「duration は実測値」） | `durationにはOnline TTSの音声を実際に測った秒数を入れています。読み上げの置換表を直したら、対象のスライドのdurationをytslide measureで測り直してください。` |
| `slides/user.js` | Slide 5（「手順3 index.html を作り直す」） | `slidesConfigにsummaryとiconを書いて、ytslide indexを走らせると、index.htmlの一覧が作り直されます。` |
| `slides/user.js` | Slide 12（「duration の測り方」） | `duration には、読み上げ音声を測った秒数を入れます。ytslide measure に文章を渡すと、そのまま使える秒数が出ます。` |
| `slides/user.js` | Slide 13（「まとめて書き換える」） | `ytslide measure に write を付けて実行すると、測った結果で duration を直接書き換えてくれます。変わった枚だけ表示されます。` |

**`slides/developer.js` の Slide 2 は、`grep "tools/"` には掛からなかったが
（文字列は「tools に」で `/` を含まない）、直後の表で `tools/*.py` を
`ytslide` のサブコマンドに書き換えたのと矛盾しないよう、あわせてナレーションも
書き直した。** 判断が要る点としてこの下にまとめてある。

`slides/template.js` の Slide 5（コードと端末画面）と Slide 16（本文と脚注）は
`body`（表示だけの HTML）に `tools/measure-duration.py` の表示例があったが、
**ナレーション自体は変えていない**ため測り直しは不要（例示として書いてある
コマンド文字列を差し替えただけ）。

## 完了条件 2 で確かめたコマンド

- `ytslide index --help`・`measure --help`・`video --help`・`web --help`・
  `init --help` — すべて `--help` で通った
- `ytslide measure --text 'ここに読み上げる文章'`（`docs/User.md` の例と同じ
  引数）→
  `下書き: 原文 10 字 / 読み 10 字 / 実測 2.376s / BASE_SPEED_MULTIPLIER=1.4 倍速 1.70s -> duration: 2`
  （ドキュメントの出力例と一致）
- 空の一時ディレクトリで `ytslide init` → `index.html: 1 件のスライドを書いた`。
  続けて `ytslide web -p 8098` を起動し、別シェルから
  `curl -sS -o /dev/null -w '%{http_code}' http://localhost:8098/index.html`
  → `200`。確認後停止（`docs/User.md` の「リポジトリの外に自分のスライドを
  置く」の手順どおり）
- 同じ一時ディレクトリで `ytslide init` のあと `slides/mine.js`
  （`template.js` をコピー）を作り、`ytslide measure --slides mine --all`
  → 5 枚ぶんの測定結果が出力された（`docs/User.md` の
  `ytslide measure --slides mine --all` の例と同じ綴り）
- 別のカレントディレクトリから `ytslide index --root <その一時ディレクトリ>`
  → `index.html: 2 件のスライドを書いた`（`docs/User.md` の
  `ytslide index --root ~/my-slides` の例と同じ綴り）
- `ytslide measure --slides user --all --write` や
  `ytslide video --slides readme` はネットワーク・ffmpeg・Playwright が要る
  うえ実行するとリポジトリの `duration` を書き換えてしまうため、`--help` の
  綴り確認のみ（指示どおり）
- `uv run pytest -q` → `21 passed`（第 1 段からの変更なし。この回では
  `src/ytslide/`・`tests/` を触っていないことの確認を兼ねる）

## 残る懸念

1. **`slides/developer.js` Slide 2 のナレーションを、厳密には
   `grep "tools/"` に掛からない行まで書き直した。** 文字どおりの対象範囲を
   超える判断のため、上の表に理由を添えて明記した。書き直しすぎと判断されれば
   元の文言に戻す（その場合は測り直し不要になる）
2. **`slides/developer.js` Slide 2 の表・末尾の注記
   （「ビルドも依存関係のインストールも不要。Tailwind・Google Fonts・
   FontAwesome は CDN 頼み」）は、`ytslide` のインストールが要ることには
   触れないまま残した。** この文言自体に `tools/` の文字列は無く、
   `grep` の対象範囲にも掛からないため今回は変えていない。プレイヤー側は
   実際にインストール不要なので誤りではないが、表の見出し「ファイル」に
   `ytslide measure`／`ytslide video`（コマンド）が並ぶ点が気になるなら
   見出しごと直す別項目が要る
3. 実際に `ytslide measure --slides user --all --write` などを実行して
   `duration` を測り直すのは、指示どおり管理者が別途まとめて行う想定
