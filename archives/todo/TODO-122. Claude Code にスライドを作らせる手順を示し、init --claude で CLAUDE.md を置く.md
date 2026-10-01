# TODO-122. Claude Code にスライドを作らせる手順を示し、init --claude で CLAUDE.md を置く

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort high | main（実装・文書・スライド）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort high | main（実装・文書・スライド）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | high | 146 | 44,457 | 127,153 | 6,592,508 | 79% |
| reviewer | Opus 5.5 | high | 60 | 4,183 | 69,440 | 1,422,635 | 17% |
| verifier | Sonnet 5.5 | medium | 24 | 178 | 33,692 | 270,478 | 4% |
| 合計 |  |  | 230 | 48,818 | 230,285 | 8,285,621 | 計 8,564,954 |

- reviewer・verifier とも、定義（`~/.claude/agents/`）のモデル・effort のまま
- verifier の output 178 は少なすぎる。`subagents/` のログに最終行が残らない分の
  取りこぼしと見られる（todo-workflow skill の注意どおり）

## きっかけ

`docs/UsersGuide.md` の「AI に作ってもらう」は、チャット型の AI に添付し、
返ってきたコードを手で保存する前提で書いてあった。Claude Code ならファイルを
直接読み書きし、`ytslide check`・`measure`・`update` も自分で実行できるので、
手順が変わる。また `init` した作業場所には `docs/UsersGuide.md` が無く、
Claude Code に書式を読ませられなかった。

決めたこと（利用者）:

- `UsersGuide.md` は GitHub の URL を読ませず同梱して置く（オフラインでも読め、
  入れた版とずれない）。`--claude` を付けなくても置く
- `CLAUDE.md` はテンプレートのファイルを置かず、`init` のコードに文字列で持つ。
  生成するのは `--claude` のときだけ（ファイルにすると Claude Code が自分への
  指示と取り違えるおそれがある）
- Playwright は、使うコマンドを実行したときに入れ方を添えて知らせる。
  `init --claude` の時点では調べない

## やったこと

- `src/ytslide/cli.py` — `init` に `--claude` を足し、`CLAUDE_MD`（文字列）を
  `CLAUDE.md` に書く。同梱データのコピーを `_copy_data()` にまとめ、
  `docs/UsersGuide.md` もいつも置く。どれも既にあれば上書きしない
- `src/ytslide/browser.py`（新規）— `check` と `video` が使う chromium の起動を
  1 か所にまとめた。パッケージが無いとき・`p.chromium.launch()` が失敗したときに、
  入れ方（`git+https://…[video]`、チェックアウトなら `'.[video]'`、
  `<sys.executable> -m playwright install chromium`）を添えて `ClickException` で止める。
  `uv tool install` した環境では `playwright` コマンドが PATH に出ないので、
  chromium の入れ方は `ytslide` の Python から実行する形にした
  （この機械では PATH 上の `playwright` は npm 版で、旧手順は別物を叩いていた）
- `src/ytslide/check.py`・`video.py` — 上の `chromium()` を使う形に変えた
- `pyproject.toml` — `docs/UsersGuide.md` を `force-include` に足した
- `docs/UsersGuide.md` — 「Claude Code で作る」の節（mermaid の流れ図つき）を
  「AI に作ってもらう」の次に足した。`init` の説明、サブコマンド表、
  「測定と動画に要るパッケージ」の chromium の入れ方（`"$(uv tool dir)/ytslide/bin/python" -m playwright install chromium`）を直した。
  作業場所には README も Developer.md も無いので、それらへの相対リンクを GitHub の URL にした
- `README.md`・`docs/Developer.md`・`CLAUDE.md` — `init --claude`、`browser.py`、
  テストの本数（6 本）を足した
- `slides/users-guide.js` — 6 枚目「Claude Code で作る」を足した（以降の
  `// Slide N` を振り直し）。読みは利用者が聞いて確定した
- テスト — `tests/test_cli.py` に `init` が `UsersGuide.md` を置く・`--claude` で
  `CLAUDE.md` を置く・2 回目に上書きしない・`force-include` に載っている、を足した。
  `tests/test_browser.py`（新規）でパッケージが無いとき・chromium を起動できないとき・
  途中で例外が出ても閉じることを見る

reviewer の指摘で直したもの: `CLAUDE_MD` の「`--slides` を付ける」を
`check`・`measure`・`update`・`video` に限った（`index` に付けると落ちる）、
`test_browser.py` に「2 行目以降を出さない」と「閉じる」の確認を足した、
同梱した `UsersGuide.md` の相対リンクを GitHub の URL にした。

見送ったもの（reviewer の検討 3・5）:

- chromium だけが無いときも、パッケージの入れ方を含む 3 行を全部出す。
  分けると分岐が増えるわりに、1 行目のエラー文で原因は読める
- `CLAUDE_MD` に `curl`・`ffprobe` が無いときの対処は書かない。TODO-122 の範囲外
  （`measure` は無ければそのまま失敗し、UsersGuide に入れ方がある）

## 確かめたこと

詳しくは [archives/agents/TODO-122/](../agents/TODO-122/README.md)。

- `uv run pytest -q` 35 passed、`ruff check` 問題なし
- wheel に `ytslide/data/docs/UsersGuide.md` が入る。wheel を `uvx --from` で
  使い、`init`・`init --claude`・2 回目の `init` が想定どおり（verifier）
- video extra 無しの `check` と、`PLAYWRIGHT_BROWSERS_PATH` を空にした `check` が、
  入れ方を添えて止まる（reviewer・verifier）
- 文書の `"$(uv tool dir)/ytslide/bin/python" -m playwright install --dry-run chromium` が通る
- 5 つの壊し方（1 行目に切る処理、`close()`、`if claude:`、UsersGuide のコピー、
  `force-include`）が、どれもテストで落ちる（verifier）
- `ytslide check --slides users-guide` が問題なし。6 枚目は 1280×720 で本文が溢れない。
  ページ全体が 755px で縦に 35px スクロールするのは他のスライドでも同じで、
  この項目とは関係ない（main が `readme#1`・`users-guide#5` と比べた）

## 分担の振り返り

- **reviewer** — 要修正 0、検討 5。`--slides` を付けられないコマンド（実測）、
  テストを通ってしまう壊し方 2 つ（実測）、同梱した UsersGuide のリンク切れを見つけた。
  3 つとも main は気づいていなかった
- **verifier** — 食い違い無し。ページ全体のスクロールを報告したが、既存のものだった
- **見込みとの食い違い** — 無し
- **次に同じ規模なら** — 同じ組み方でよい。ただし verifier の依頼から、
  reviewer が既に実測した分（`PLAYWRIGHT_BROWSERS_PATH` での chromium 無し）を
  外せば、その分の往復を削れた。同梱して配る文書を増やす項目では、
  「配った先でリンクが切れないか」を reviewer の観点に最初から書いておく
