# TODO-117. スライドの書き間違いを事前に見つけ、失敗の理由を画面に出す

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | implementer + reviewer + verifier |
| 実施 | Sonnet 5 / effort 不明 | implementer + reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Sonnet 5 | 不明 | 19,859 | 123,247 | 38% |
| reviewer | Sonnet 5 | high | 26,690 | 86,162 | 27% |
| implementer | Sonnet 5 | medium | 18,920 | 68,395 | 23% |
| verifier | Sonnet 5 | medium | 9,089 | 47,978 | 11% |
| 合計 |  |  | 74,558 | 325,782 | 概算 $3.3 |

- main の effort は、このセッションでは確認する手段が無かった
- implementer・reviewer・verifier はいずれも定義（`~/.claude/agents/*.md`）どおりの
  モデル・effort で動き、上書きはしていない

## きっかけ

TODO-113 で方針を決めた。スライドは JavaScript ファイルなので、カンマの
抜け・括弧の閉じ忘れ・必須キーの書き忘れで読み込みに失敗する。今は
「スライドのデータ slides/x.js を読み込めませんでした。」としか出ず、行番号も
分からない。非プログラマが書く前提（TODO-103）では、どのファイルの何行目が
怪しいかが分かる必要がある。

## やったこと

- `player.html`: `document.write` でスライド JS を読み込む前に
  `window.addEventListener('error', …, true)` を仕込み、`slides/<名前>.js`
  の構文エラーを filename・lineno・colno・message で捕まえるようにした
  （TODO-113 で実測済みの手法）。既存の「読み込めませんでした」の案内に、
  捕まえた構文エラーがあれば `slides/x.js:12:9 でエラー: <message>` を続けて
  出すようにした
- `player.html`: `window.runSlideCheck` という async 関数を追加した。
  `slideData` が無ければ構文エラーの情報を返し、あれば各スライドの必須キー
  （`title`・`narration`・`duration`・`body`/`render` のどちらか）の欠けを
  `missingKeys` に、各スライドの `render()`（無ければ `body`）が返す HTML から
  `<img src>` を拾って `fetch(src, {method:'HEAD'})` で存在確認した結果を
  `missingImages` に集める。検査の基準はここ 1 か所だけに置いた
- `src/ytslide/check.py`（新規）: `ytslide web` と同じ `http.server` を
  一時的に立て（ポート 0、別スレッド）、Playwright で `player.html` を開き
  `window.runSlideCheck()` の結果をそのまま返す。画像の 404 は HTTP 経由で
  ないと分からないため（TODO-113）、`file://` ではなく HTTP で開く
- `src/ytslide/cli.py`: `check` サブコマンドを追加。`--slides`・`--root` は
  `measure`/`video` と同じ形。結果を端末に出し、問題があれば `ctx.exit(1)`
- `docs/UsersGuide.md`: サブコマンド表・`--root` 対応コマンドの一覧・測定と
  動画に要るパッケージの一覧に `ytslide check` を足した。README.md 側には
  サブコマンドを列挙している箇所が無く、変更不要だった
- `docs/Developer.md`: 「全体の作り」節に、検査の基準は `window.runSlideCheck`
  1 か所に置く旨を追記した（reviewer 報告への対応）
- `CLAUDE.md`: テストの本数を「4本」から「5本」（`test_check` を追加）に直した
  （reviewer 報告への対応）
- `tests/test_check.py`（新規）: `check.check()` を差し替えて Playwright に
  触れない範囲で、`--root` の配線と、`ok`・構文エラー・キー欠け・画像欠けの
  4 パターンの出力文言・終了ステータスを確認した

## 確かめたこと

- verifier が、一時ディレクトリに作った最小のスライド一式を使い、
  構文エラー・`title`/`narration`/`duration`/`body`+`render` それぞれの欠け・
  存在しない画像パス・正常なスライドの 6 パターンで `ytslide check` を実行し、
  期待どおりの文言と終了ステータスになることを確認した（壊したスライドは
  確認後に削除、リポジトリには残していない）
- `uv run pytest -q`（30 件中 29 件通過。失敗 1 件は `tests/test_measure.py`
  の既存の失敗で、`git stash` して変更前でも同じ理由で落ちることを implementer
  が確認済み。今回の変更とは無関係）
- `uv run ruff check src/ tests/` が通過
- `docs/UsersGuide.md` に `ytslide check` の説明が載っていることを目視で確認

## 分担の振り返り

- **implementer** が player.html・check.py・cli.py・docs・テストをまとめて
  実装し、実機で 4 通りの壊れたスライドを試して文言と終了ステータスを確認した。
  最初から通しで実装でき、手戻りは無かった
- **reviewer** は要修正 0 件、検討事項 6 件（うち文書の対応漏れ 2 件、
  境界ケース・設計判断が 4 件）を見つけた。文書の対応漏れ 2 件（`CLAUDE.md`
  のテスト本数、`docs/Developer.md` への `window.runSlideCheck` の記載）は
  main が直接直した。残り 4 件は実害未確認・既存の慣習を踏襲しているだけと
  判断し、対応しないことにした
- **verifier** は reviewer の指摘とは独立に、TODO-117 のチェックリスト
  4 項目を実機で確認し、全項目 OK と報告した
- 見込みどおり implementer + reviewer + verifier の 3 分担で足りた。
  食い違いは無い
- 次に同じ規模（player.html の検査ロジック + CLI サブコマンド + 文書）の
  項目をやるなら、同じ組み方でよい。reviewer が見つけた「文書の対応漏れ」は
  実装担当に「変更点を docs/CLAUDE.md まで含めて洗い出す」よう依頼文に
  一言足しておくと、reviewer の指摘が減らせるかもしれない
