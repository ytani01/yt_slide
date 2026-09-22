# TODO-117 reviewer 報告

対象: `git diff`（未コミット）+ 新規ファイル
（`player.html`・`src/ytslide/check.py`・`src/ytslide/cli.py`・
`docs/UsersGuide.md`・`tests/test_check.py`）。TODO-117・TODO-113 の
決定事項と照らして読んだ。

## 検討

1. **`CLAUDE.md:14` のテスト本数の記述が古いまま。**
   `CLAUDE.md` の「構成」節に「テストは `tests/` の 4本
   （`test_cli`・`test_index`・`test_measure`・`test_video`。
   `uv run pytest`）」とあるが、今回 `tests/test_check.py` が増えて 5本に
   なった。ここは「対で保守すべきものの片方だけが変わっていないか」に
   直接該当する（このファイル自体が「見たか」のガイドなので、放置すると
   次に読む人が test_check.py の存在に気付かない）。実害は未確認
   （テストの実行自体には影響しない、案内文だけの食い違い）。

2. **`window.runSlideCheck` が `docs/Developer.md` に載っていない。**
   `CLAUDE.md:28` は「`player.html` を直すなら `docs/Developer.md` に
   直す前に必ず目を通すこと」としているが、`Developer.md` には
   `window.runSlideCheck`（`ytslide check` が依存する新しい公開 API）の
   説明が無い。`player.html` 側にはインラインコメントで「検査の基準は
   ここだけに置く」と書かれてはいるが（player.html:1694-1695）、
   `Developer.md` を先に読む前提の読者はこの契約に気付けない。
   例えば `REQUIRED_KEYS` を将来増減させる変更をした人が、`check.py`・
   `test_check.py` 側の文言が対応する契約だと知らないまま直す恐れがある。
   実害は未確認（今回のレビュー時点では壊れていない）。

3. **JS 側の検査ロジック（`window.runSlideCheck` と `error` リスナー）に
   自動テストが無い。** `tests/test_check.py` は `check.check()` を
   monkeypatch して `cli.py` の出力整形・終了コードだけを見ており
   （これは `test_video.py` の配線テストと同じ形で、妥当）、
   分岐の本体（`REQUIRED_KEYS` の欠け判定、`body/render` の判定、
   画像パス収集、`error` イベントのファイル名フィルタ）は
   Playwright を使った実機確認のみで、その確認用の壊れたスライドは
   リポジトリに残していない（implementer 報告どおり）。
   このリポジトリには元々 Playwright を使う自動テストが 1本も無く
   （`rg -n "playwright" tests/*.py` が無ヒット）、`video.py` の
   スクリーンショット生成ロジックも同様に実機確認どまりなので、
   **既存の慣習からの逸脱ではない**。ただし今回追加された分岐は
   非自明なロジック（キーの欠け判定・重複除去・例外時のスキップ）を
   含んでおり、「壊すと落ちるテストを 1つ残す」の観点では手薄。
   直すかどうかの判断は管理者に委ねる。

4. **`check.py` が `paths.PLAYER_HTML`（同梱データへのフォールバック）を
   使わず、`ROOT/player.html` を HTTP 経由で直接開いている。**
   `paths.py:31` の `set_root()` は、`ROOT` に `player.html` が無ければ
   同梱データ（`DATA/player.html`）へ落とす仕組みを持つ
   （`video.py:106` の `screenshot_slides()` は実際にこの
   `paths.PLAYER_HTML` を `.as_uri()` で開いており、フォールバックの
   恩恵を受ける）。一方 `check.py:30-33` は `directory=str(paths.ROOT)`
   で静的サーバーを立て、`check.py:40` で
   `http://127.0.0.1:{port}/player.html?slides=...` を直接叩くため、
   `ROOT` 側に `player.html` の実体が無いと 404 になり
   `page.evaluate('() => window.runSlideCheck()')` が
   「runSlideCheck is not defined」相当の生の例外で落ちる
   （`_no_slides_error` のような親切なエラーにならない）。
   `ytslide init` は常に `ROOT/player.html` を作るので通常は起きないし、
   `ytslide web` も同じ前提（`cwd` 配下の `player.html` が無いと開けない）
   で動いているため、**新規の弱点ではなく既存の `web` と同じ前提を
   踏襲しているだけ**とも言える。実害は未確認（`player.html` を後から
   消した `--root` を渡したときのみ発現する、境界のケース）。

5. **`missingImages` の重複除去は「最初に出てきたスライドでしか報告しない」。**
   implementer 報告にも「判断が要る点」として明記済み。同じ壊れた画像パスを
   複数スライドで使っていると、2枚目以降は `check` の出力に出てこない。
   TODO-117/TODO-113 の決定事項には重複の扱いまでは書かれていないため、
   仕様違反とは言えないが、利用者からは「他のスライドは直っている」と
   誤読されうる。実害は未確認。

6. **`window.runSlideCheck` 内で `container.innerHTML = html` により
   `<img>` を作ると、`container` を `document` に付けていなくても
   Chromium は暗黙に画像の GET を発行しうる。** 明示的な
   `fetch(src, {method:'HEAD'})` と合わせて二重にネットワークへ触ることに
   なるが、`error` イベントのフィルタは `e.filename` で判定しており
   画像の読み込み失敗イベントには `filename` が無いため
   `slidesSyntaxError` を誤って上書きすることはない（確認済み）。
   検査結果には影響しないはずだが未確認（実機での二重リクエストの発生
   自体は見ていない）。好みの範囲。

## 確認して問題が無かった点

- **決定事項どおりの範囲。** 検査ロジックは `player.html` の
  `window.runSlideCheck` だけに置かれ、`check.py` は Playwright で開いて
  結果を読むだけ（`check.py:1-7` のモジュール docstring も同じ説明）。
  見ている範囲も構文エラー・`title`/`narration`/`duration`/`body`または`render`
  の欠け・存在しない画像パスの 3つに限られ、`duration` と実測の食い違いは
  見ていない。TODO-078 の帯も使わず、TODO-041 の「読み込めませんでした」に
  文言を足すだけ（player.html:594-600）になっている。
- **`error` リスナーの位置。** `document.write` より前（player.html:574-583）
  に置かれており、TODO-113 で実測済みの手法どおり。`e.filename` を
  `/slides/${slidesName}.js` で終わるかどうかで絞っているため、他の
  `<script>`（Tailwind・FontAwesome 等）のエラーを拾わない
  （画像の読み込み失敗イベントには `filename` が付かないので、これも
  誤検出しない。上の 6 を参照）。
- **`window.runSlideCheck` の非同期処理。** `for` ループ内で
  `await fetch(...)` を毎回待っており、`fetch` の `await` 忘れは無い。
  `check.py` 側も `page.evaluate('() => window.runSlideCheck()')` を
  `sync_playwright` の同期 API で呼んでおり、Playwright が Promise の解決を
  待ってから返す（`await` 忘れの余地が無い書き方）。
- **`http.server` の起動・終了。** ポート 0 で bind しており、`ytslide check`
  同士を並行実行してもポート衝突しない。サーバースレッドは daemon かつ
  `try/finally` で `httpd.shutdown()` と `thread.join()` を必ず呼んでおり、
  `sync_playwright()` 内で例外が起きても finally は実行される
  （`page.goto`/`page.evaluate` が例外を投げても `httpd` は後始末される）。
  `browser.close()` 自体は例外時に呼ばれない経路があるが、これは
  `video.py:114` の既存のパターンと同じで、今回新たに持ち込まれた弱点では
  ない。
- **`cli.py` の `check` サブコマンドの作法。** `--slides`・`--root`・
  `click_common_opts` のオプション定義、`_no_slides_error` によるエラー
  文言、`paths.set_root(root)` の呼び出し順は `measure`/`video` と同じ形。
  終了ステータスは `result['ok']` が偽なら `ctx.exit(1)`、既存コマンドの
  失敗時の扱い（`click.ClickException`/`UsageError` は自動で非 0）と
  矛盾しない。
- **TODO-041 の挙動を壊していないか。** `player.html:591-604` の
  「読み込めませんでした」ブロックは、既存の「一覧へ戻る」リンク生成
  （`indexLink` 周り）をそのまま残し、`canvas.textContent` に文字列を
  追記しているだけ。`slidesSyntaxError` が無いときは元の文言のまま
  （`+ ''`）で、見た目も変わらない。
- **テストの中身（配線・出力整形の部分に限れば）。** `--root` の配線が
  効いていることを `test_video_command_root_wiring` と同形で確認しており、
  `ok`・構文エラー・キー欠け・画像欠けの 4 パターンで出力文言と終了コード
  （0/1/2）をそれぞれ検証している。`check.check()` の戻り値の形
  （`ok`/`syntaxError`/`missingKeys`/`missingImages`）を偽データで差し替える
  やり方は `cli.py` 側のロジックを確かめるには十分。JS 側の弱さは上の
  「検討 3」を参照。
- **コメント。** `player.html` のコメントは「なぜ」（`document.write` より
  前に置かないと間に合わない、検査の基準はここだけに置く、など）を書いて
  おり「何を」の繰り返しになっていない。`check.py` のモジュール docstring
  も同様。
- **範囲。** `README.md` は変更不要という implementer の判断
  （`rg -n "ytslide (measure|video|web|check)" README.md` 無ヒット）を
  実際に再実行して確認した。ヒット無し、変更していないのは妥当。
  `pyproject.toml` も `video` extra への相乗りのみで変更不要、確認済み
  （既に `playwright` が `video` extra に入っている）。

## pyright の警告について

`check.py`・`cli.py`・`test_check.py` で `click`・`paths`・`ytslide` 等の
import が解決できないという pyright の診断は、`.venv` を認識できていない
ことによる誤検出と確認できた。

```
$ uv run python -c "import ytslide.check; import ytslide.cli; print('OK', ytslide.check.__file__)"
OK /net/fs/.../yt_slide/src/ytslide/check.py
```

`uv run pytest -q` は 30 件中 29 件通過（失敗 1 件は
`tests/test_measure.py::test_all_slides_rules_load`、`measure.py` は今回の
差分に含まれておらず無関係。`git diff --stat` でも `measure.py` は変更
対象に無い）。`uv run ruff check src/ tests/` も `All checks passed!`。
このリポジトリに `pyright`/`mypy` の設定・依存関係は無い
（`rg -n "pyright|mypy" pyproject.toml` 無ヒット）ので、pyright の警告は
このセッションの IDE 側の設定（`.venv` を interpreter として指していない）
に起因するものであり、コード側の欠陥ではないと判断できる。

## まとめ

要修正に当たる指摘は無し。検討事項は 6件（うち 1・2 は文書と実装の
対応漏れ、3〜6 は設計上の判断が要る点）。実害が明確なものは無く、
いずれも「実害は未確認」と添えたとおり境界的なケースにとどまる。
