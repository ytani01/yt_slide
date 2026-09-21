# TODO-095 reviewer 報告

対象: `git diff docs/User.md tools/`（`tools/measure-duration.py`
`tools/make-index.py` `tools/make-video.py` `tools/test_measure_duration.py`
`docs/User.md`）。コードは直していない。実測に使った一時ディレクトリは
確認後に削除し、`tools/` は元の diff の状態に戻した（`git status`・
`git diff --stat` で確認済み、テスト 3 本も再実行して OK）。

## 要修正

### 1. `docs/User.md` の新しい節の手順どおりに実行すると `make-index.py` が落ちる（実測）

`docs/User.md:360-389`「リポジトリの外に自分のスライドを置く」の手順は
`mkdir -p ~/my-slides/slides` と `player.html` のコピーだけで
`~/my-slides/index.html` を作らない。そのまま続く例
（`docs/User.md:388`）で

```
~/yt_slide/tools/make-index.py --root ~/my-slides
```

を実行すると、`index.html` が無いので未処理の `FileNotFoundError` で
落ちる。手順を実際に再現して確認した:

```
$ python3 tools/make-index.py --root /tmp/.../my-slides-test
Traceback (most recent call last):
  ...
FileNotFoundError: [Errno 2] No such file or directory: '.../index.html'
```

`docs/User.md:313`「一覧が要るときだけ」とあるので `index.html` 無しの
運用自体はあり得るが、その場合は `make-index.py --root` の例を出すべき
ではない。文書の手順と実装のどちらかが合っていない。

根拠: 実測（上記コマンドと出力）。`tools/make-index.py:129`
（`INDEX_HTML.read_text(...)`）に存在チェックが無いのが原因。
`tools/measure-duration.py`・`tools/make-video.py` 側は
`src.exists()`（スライド一式の `.js`）を `parser.error()` で扱っており、
`make-index.py` だけ対称になっていない。

同じ原因で、`--root` に存在しないパス・`index.html` を持たないディレクトリ・
ディレクトリではなくファイルを渡した場合も同様に未処理の
`FileNotFoundError` / `NotADirectoryError` になることを実測で確認した
（`measure-duration.py`・`make-video.py` は同条件で `parser.error` の
親切なメッセージになる）。

### 2. `make-index.py`・`make-video.py` の `--root` 配線がテストで検出できない（実測）

`tools/test_measure_duration.py` には `find_root()`/`set_root()` の優先順を
確かめるテストが足された（狙いどおり、cwd 優先順位を壊すと落ちることを
実測で確認した）。しかし `make-index.py` 自身の `set_root()`（`md.find_root()`
を呼ぶ側）と `make-video.py` の `main()` が `md.set_root(args.root)` を
呼ぶ配線には、対応するテストが無い。

実測: それぞれ次のように意図的に壊しても、既存のテストは通ったまま
（確認後、元の diff の内容に戻し、`git diff --stat` で復元を確認済み）。

- `tools/make-index.py` の `set_root()` 内
  `ROOT = md.find_root(root_arg)` を `ROOT = md.REPO_ROOT` に変える
  （`--root`・cwd 優先を無視する）→ `python3 tools/test_make_index.py` は
  `OK`
- `tools/make-video.py` の `main()` 内 `md.set_root(args.root)` の呼び出しを
  丸ごと外す（`--root` を渡しても常定のデフォルトのまま）→
  `python3 tools/test_make_video.py` は `OK`

TODO-095 のチェックリストは「`tools/test_*.py` を新しい探し方に合わせる」
（複数形）としており、`test_make_index.py`・`test_make_video.py` も対象に
読める。いまの状態では、この 2 本の `--root` 配線が壊れても既存テストは
気づかない。

## 検討

### 3. Pyright の None 関連の警告は、確認した限り実害なし

指示にあった `measure-duration.py:108, 113, 222` /
`make-index.py:58, 81, 129, 131, 132` の
`reportOptionalOperand` / `reportOptionalMemberAccess` を実際に
`pyright` で再現した（11 件）。追ってみると、両ファイルとも
`ROOT = SLIDES = ... = None` の直後に `set_root(None)` を呼んでおり、
これらのグローバルを参照するすべての関数（`load_slides_rules` /
`load_common_rules` / `main` / `slide_names` / `load_slide` 等）は
`set_root()` が最低 1 回済んだ後にしか呼ばれない経路しか無い
（`make-index.py` は独自の `set_root()` が `md.find_root()` を使うだけで
`md.ROOT` 自体には触れないので、この点は無関係）。実際に全スクリプトと
3 本のテストを動かしても None 由来の例外は起きていない。Pyright は
「`global` 経由で関数の外から書き換わる」フロー解析まではしないため
誤検出と判断する（未確認の断定はしていないが、実測でクラッシュを
再現できなかった、という限りでの確認）。型注釈やセンチネル値での
黙らせ方は実装判断なので、ここでは指摘するだけに留める。

### 4. `make-video.py --out` の既定値が cwd 基準のまま

`tools/make-video.py:211` の `--out` の既定 `'video'` は cwd からの相対で、
`--root` で外部ディレクトリを指した場合でも `ROOT` 配下ではなく
呼び出し側の cwd 直下に `video/` ができる。この diff で変えた範囲外
（元から cwd 相対）であり、TODO-095 の決めたこと（探し方の優先順）にも
`--out` の言及は無いので指摘に留める。外部ディレクトリを cwd にせず
`--root` だけで呼ぶ運用（`docs/User.md` の「別の場所から呼ぶ」の例）とは
噛み合わない可能性があるが、実際に動画を書き出す検証はしていない
（`implementer-report.md` にも「Playwright・ffmpeg が絡む重い処理のため
実行していない」とある）。

## 確認できたこと（問題なし）

- `ROOT`/`SLIDES`/`PLAYER_HTML` は「引数を読んだ後に決める」設計どおりで、
  `make-video.py` の `md.PLAYER_HTML` 参照は関数内（呼び出し時に評価）
  であり、`main()` が `md.set_root(args.root)` を呼んだ後に
  `make_video()` → `screenshot_slides()` の順で実行されるので、
  インポート直後の値を掴む経路は見つからなかった。
- cwd 判定 `(cwd / 'slides').is_dir()` は、`slides` がファイルなら False、
  シンボリックリンクで実体がディレクトリなら True（`is_dir()` は
  シンボリックリンクを解決する）。ディレクトリシンボリックリンクの
  ケースは仕様どおりと考えられる（実測はしていない）。
- 後方互換: リポジトリのトップで `--root` 無しに呼ぶと
  `find_root(None)` は `cwd == REPO_ROOT` を返し、従来と同じ場所になる。
  `tools/` をカレントディレクトリにした場合は `tools/slides` が無いので
  `REPO_ROOT` に落ちる（許容できる動きと考える）。
- `docs/User.md` の新しい節に TODO 番号は無い。`Developer.md` の
  「場所を選ばない」・`docs/User.md` の「他のサーバーへ持っていくとき」と
  新しい節の記述は、上記 1 の `index.html` の件を除いて食い違いは
  見つからなかった。
- 足されたテストのうち `find_root()` の優先順（`--root` > cwd の
  `slides/` > リポジトリ）と `PLAYER_HTML` の選び方（コピー優先／
  リポジトリへの後退）は、それぞれ実際にロジックを壊すと落ちることを
  実測で確認した（上の「要修正 2」に書いた 2 点を除く）。
