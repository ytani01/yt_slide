# TODO-114 事前の事実確認（verifier）

作業ディレクトリ: yt_slide（ブランチ develop）。文書・コードは変更していない。
検証で作ったファイルは `archives/agents/TODO-114/`（`sample.csv`, `gen_slides.py`,
`generated.js`）のみ。最終 `git status --short` はこのディレクトリの新規分だけ。

## 1. AI に書かせられる — できる

- `slides/template.js` のテンプレートは実測 **19種**。
  `grep -n "^    // ── " slides/template.js | wc -l` → `19`。
  ファイル冒頭のコメント「19種のうち 16種は body だけで書ける」の数と一致。
- `docs/User.md` 93〜141行に「AI に作ってもらう」節があり、依頼文の例（新規作成 1件、
  修正 1件）が実在する。

## 2. 依存関係が無い — 条件付きでできる

- 見る側: `player.html` はスライドを `document.write('<script src="slides/xxx.js">')`
  （574行）で読み込んでいる。`fetch()` は使っていないので `file://` で直接開いても
  CORS に引っかからない。ブラウザだけで見られる（実装読みで確認、実際にサーバー無しで
  開いての目視確認はしていない＝未実行）。
- 作る側: `player.html` + `slides/<名前>.js` のコピー・編集＋ブラウザだけで、
  「1枚を再生する」までは完結できる（テンプレコピペ→保存→ブラウザで開く、の経路）。
- **`ytslide` が無いとできない操作（列挙）**:
  - `ytslide index` — 複数スライド一式から `index.html` の一覧を自動生成
  - `ytslide measure` — ナレーションの読み上げ秒数を自動計測（`duration` は手動概算でも動く）
  - `ytslide video` — MP4 と `.srt` への書き出し
  - `ytslide init` — 雛形の自動生成（手でコピーすれば代用可）
  - `ytslide web` — `http.server` での配布（ブラウザで直接開けば不要）
  - 上記どれも「1枚を再生する」の最短経路には不要で、書き出し・一覧・自動計測など
    付加機能でのみ要る。これは実装（`player.html` 574行、`src/ytslide/cli.py` の
    サブコマンド一覧）を読んだ上での列挙で、動作は 7. で `--help` の終了コードのみ確認。

## 3. 読み上げ・字幕・自動送りが最初から付く — できる

- `player.html` に `SpeechSynthesisUtterance` によるナレーション読み上げ（994行）、
  `caption-text` / `subtitle-banner` による字幕表示（395, 408, 1155行）、
  `slideTransitionTimeout` による自動送り（921, 946, 1031, 1078行）の実装を確認。

## 4. MP4（＋`.srt`）に書き出せる — 条件付きでできる（未実行）

- `src/ytslide/video.py` に `make_video()`（161行）があり、`out_mp4` と
  `out_srt`（200, 203〜204行）を書き出す実装を確認。`build_srt()`（126行）で
  `.srt` を組み立てている。
- 実行は試みたが**未実行**。`ytslide` コマンドは `/home/ytani/.local/share/uv/tools/ytslide/bin/python`
  という別環境（uv tool install）で動いており、そちらには playwright が入っていない。
  ```
  $ ytslide video --slides readme --only 1 --out /tmp/.../yt_slide_video_test
  Error: playwright が入っていない。uv tool install '.[video]' で入れる
  ```
  （手元の `python3`（別環境）には playwright 1.63.0 が入っているが、`ytslide` の
  実行環境とは別なので今回はこの条件では動かせない。指示どおり「入れなくてよい」ので
  そのまま未実行として報告する。）

## 5. テキストなので git・grep・sed が効く — できる（実測）

- **git diff**: `slides/readme.js` の `title` の文字列 1 か所を書き換えて
  `git diff` を取ったところ、変更が 1 行の削除・1 行の追加として行単位で読めた
  （差分は確認後 `git checkout -- slides/readme.js` で復元、`git status --short` で
  クリーンを確認済み）。
- **grep（rg）**: `rg -n "narration" slides/*.js` で全スライド横断ヒット 72件、
  `rg -c "player.html" slides/*.js` で各ファイルごとの出現数を確認（用語の横断検索が効く）。
- **sed**: `sed -n 's/player\.html/PLAYER_TEST/gp' slides/readme.js`
  を実ファイルは書き換えず標準出力のみで確認し、置換結果が妥当であることを確認
  （`-i` は使っていない。実ファイル未変更を `git status --short slides/` で確認済み）。

## 6. 自動生成（データやログからスライドを機械的に作れる）— できる（実測）

- `archives/agents/TODO-114/sample.csv`（title, body, narration, duration の CSV 2行）
  から `archives/agents/TODO-114/gen_slides.py` で `generated.js` を生成。
  `slidesConfig` と `slideData` が定義された形になっており、`node --check generated.js`
  は exit=0（構文エラー無し）。`player.html` が期待する 2つの定数が揃っていることを
  目で確認（実際に `player.html` へ読み込ませての表示確認はしていない＝未実行）。

## 7. 自動化（更新検知→MP4 書き出し等が組める）— できる（部分実測）

- `ytslide` の各サブコマンド（`index`, `init`, `measure`, `update`, `video`, `web`）は
  すべて `--help` が非対話で終了し、`exit=0` を確認（実際の書き出しまでは走らせていない、
  指示どおり不要）。

## 8. AI（LLM）と相性がよい — 裏付けあり（範囲を限定）

- 裏付けが取れた点: スライド 1式が `slides/<名前>.js` という単一のテキストファイルで
  完結している（4, 5, 6 の実測より）。`slides/template.js`（19種、構文の実例）と
  `docs/User.md`（依頼文の例と書式の説明、93〜141行）を渡せば AI に書式が伝わる材料が
  揃っている（1 で確認）。生成物（AI の出力）をそのまま `slides/<名前>.js` として保存すれば
  `player.html?slides=<名前>` で動く経路がある（`player.html` 574行の読み込み方式より）。
- **裏付け無し**: 「AI が実際にこの書式で正しく書けるか」（AI の出力品質そのもの）は
  今回の確認範囲外で確かめていない。

## 9. エディタを選ばない／形式に閉じ込められない — できる

- `file -i slides/*.js` はいずれも `text/plain; charset=utf-8`
  （`developer.js` のみ `file`（拡張子なし判定）は `HTML document, ...UTF-8 text` と出たが、
  これは中身に HTML タグの文字列が多いための `file` コマンドの内容判定であり、
  `file -i` では他と同じ `text/plain; charset=utf-8`。実体はどれも UTF-8 の平文テキストで、
  専用エディタや専用形式を要求しない）。

## 判断が要る点・確かめられなかったこと

- 4: `ytslide video` の実行そのものは環境の制約（`ytslide` 専用 venv に playwright 未導入）で
  未実行。指示どおり「入れなくてよい」扱いとしたが、MP4 書き出しの実動作は今回未確認。
- 2, 6: 「ブラウザで file:// を直接開いて表示・読み上げまで動くか」「生成した js を
  実際に player.html に読み込ませて表示されるか」は実装読みと構文チェックまでで、
  ブラウザでの目視確認はしていない。
- 8: LLM の出力品質（実際に正しい書式で書けるか）は確認範囲外。
