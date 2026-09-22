# TODO-117 verifier 報告

## 自動検証

- `uv run pytest -q` — 30件中29件通過、1件失敗（`tests/test_measure.py::test_all_slides_rules_load`、
  `common_rules` が 23件ではなく25件という assert）。`git stash -u` で
  作業ツリーの差分を丸ごと退避し、変更前のコードでも同じテストを単体実行して
  同じ理由で落ちることを実測で確認した。TODO-117 の変更（`measure.py` は
  今回の差分に含まれない）とは無関係の既存の失敗と判断できる
- `uv run ruff check src/ tests/` — `All checks passed!`（終了コード0）

## チェックリスト4項目の実機確認

いずれも `/tmp/claude-649/.../scratchpad/todo117/` に、リポジトリの
`player.html` をそのまま置き、`slides/x.js` に最小のスライド一式（2枚）を
自作して `uv run ytslide check --root <tmp> --slides x` を実行して確認した。
確認後、一時ディレクトリは削除済み（リポジトリには何も残していない）。

1. **構文エラーを捕まえ、ファイル名・行番号・エラー内容を出す。**
   `narration: 'ひとつめ。'` の行末カンマを抜いて壊したところ、
   `slides/x.js:14:9 でエラー: Uncaught SyntaxError: Unexpected identifier 'body'`、
   終了コード1。ファイル名・行番号（行:列）・エラー内容がすべて出ている。
   確認できた。

2. **必須キーの欠け・存在しない画像パスの検査結果を `window` に残す。**
   `ytslide check` の出力が `window.runSlideCheck()` の戻り値をそのまま
   使っている（`check.py` の実装どおり）ことを前提に、下記5パターンで
   端末出力を確認した。いずれも期待どおりの文言・終了コード1。
   - `title` を削除 → `スライド 1: title が無い`
   - `narration` を削除 → `スライド 1: narration が無い`
   - `duration` を削除 → `スライド 1: duration が無い`
   - `body`・`render` 両方無し → `スライド 1: body/render が無い`
   - 存在しない画像パス（`<img src="images/no-such.jpg">`）→
     `スライド 1: images/no-such.jpg が見つからない (404)`
   何も壊していない正常なスライド（2枚とも `title`・`narration`・`duration`・
   `body` が揃っている）では `slides/x.js: 問題なし`、終了コード0。
   確認できた。

3. **`ytslide check` が Playwright で `player.html` を開き、結果を端末に出し、
   問題があれば終了ステータスを0以外にする。** 上記6パターンすべてで
   `EXIT` を確認済み（正常時0、異常6パターンすべて1）。確認できた。

4. **`docs/UsersGuide.md` への追記。**
   - 「`ytslide` のサブコマンド」表に
     `| ytslide check | 書き間違いが無いか検査する（構文エラー・必須キーの欠け・存在しない画像パス） |`
     の行がある（`docs/UsersGuide.md:220`）
   - 「別のディレクトリからコマンドを使う」の対応コマンド一覧に `check` が
     含まれている（`docs/UsersGuide.md:204`）
   - 「測定と動画に要るパッケージ」に
     `ytslide video`・`ytslide check` — 加えて `ffmpeg`・Playwright…
     とあり、`check` が Playwright を要ることが明記されている
     （`docs/UsersGuide.md:236`）
   - README.md には `ytslide` のサブコマンド一覧が無いこと（変更不要が
     正しいこと）を `rg -n "ytslide (measure|video|web|check)" README.md`
     で再確認した。ヒット0件、実装報告・レビュー報告どおり。

4項目とも確認できた。

## 変更されたファイルと指示範囲の一致

`git status`:
- 変更: `CLAUDE.md`・`docs/Developer.md`・`docs/UsersGuide.md`・`player.html`・
  `src/ytslide/cli.py`
- 新規: `archives/agents/TODO-117/`・`src/ytslide/check.py`・`tests/test_check.py`

TODO-117 のチェックリスト4項目（`player.html` 2件・`ytslide check`・
`docs/UsersGuide.md`）に加えて、`src/ytslide/cli.py`（`check` サブコマンドの
配線）、`src/ytslide/check.py`（新規、Playwright 経由の実装本体）、
`tests/test_check.py`（新規テスト）が変わっているが、これらは
implementer 報告に記載があり、`ytslide check` の実装に必須の範囲。
`CLAUDE.md`・`docs/Developer.md` の変更は reviewer 報告の検討事項1・2
（テスト本数の記述・`window.runSlideCheck` の説明の不足）を main が対応した
ものと一致している。指示に無い範囲の変更は見当たらなかった。

## 確かめられなかったこと・判断できないこと

- reviewer 報告の検討事項3〜6（JS側ロジックの自動テスト不在、
  `check.py` が `paths.PLAYER_HTML` のフォールバックを使わず404時に
  親切なエラーにならない境界ケース、`missingImages` の重複除去の仕様、
  画像読み込みの二重リクエスト）は、いずれも main が「実害未確認・対応
  しない」と判断済みの事項であり、今回はその判断の妥当性を検証する
  依頼ではなかったため確かめていない
- `paths.PLAYER_HTML` のフォールバックが効かない境界ケース
  （`--root` 先に `player.html` が無い場合）は今回のシナリオでは
  再現していない（依頼された6パターンに含まれないため）。念のため
  軽く触れておくと、これは reviewer 報告の検討事項4そのものであり、
  境界線上の判断のため報告のみにとどめる
- `duration` と実測の食い違いを見ないという仕様（TODO-113 の決定事項）は
  実装に含まれておらず、確認対象にも含めていない（意図どおり）
