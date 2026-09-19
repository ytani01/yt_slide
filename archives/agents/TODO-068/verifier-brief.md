# TODO-068 verifier への依頼

## 目的

TODO-068 の実装が依頼どおりか、**実測して**確かめる。
**コードは直さない。** 見つけたことは報告するだけにする。
境界線上の判断もしない（「実害は未確認」と添えて報告する）。

## 対象

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`

実装の依頼書は `archives/agents/TODO-068/implementer-brief.md`、
報告は `archives/agents/TODO-068/implementer-report.md`、
レビューの報告は `archives/agents/TODO-068/reviewer-report.md`。

## 確かめること（すべて実測。静的な読み合わせで済ませない）

1. **`tools/test_measure_duration.py` が通る**（`python3` で実行し、終了コードも見る）
2. **共通表が 23 ルール読めている。** `python3` で `load_common_rules()` を呼び、
   長さと中身を、移動前の `git show HEAD:slides/_rules.js`（HEAD は TODO-068 の
   実装前のコミット）から読んだものと突き合わせる。**測った値を報告に載せる**
3. **置換結果が移動の前後で一致する。** `tools/measure-duration.py` の
   `prepare()` を `python3` で呼び、4 つのスライド一式
   （`readme`・`user`・`developer`・`claude-memo`）の全ナレーションについて、
   実装前（`git stash` か `git worktree` で HEAD の状態を用意する）と
   実装後の**置換後の読み上げ文が完全一致する**ことを確かめる。
   `slides/developer.js` のスライド 3 だけは文面を変えたので一致しなくてよい
   （その 1 枚は除いて比べ、除いたことを報告に書く）
4. **わざと壊すと落ちる。** `player.html` の `SPEECH_RULES` の囲い
   （`const SPEECH_RULES = [` の行）を一時的に崩し、
   `tools/test_measure_duration.py` が落ちることを確かめる。
   **確かめたら必ず元に戻し、`git diff` で差分が戻る前と同じことを確認する**
5. **ブラウザで `player.html` を開いて読み上げが変わらない。**
   `python3 -m http.server` で配信し、Playwright（chromium）で
   `player.html?slides=developer` を開いて、`prepareSpeechText()` を
   直接呼んだ結果を全スライドぶん取り出す。3 の Python 側の結果と一致することを
   確かめる。**音を鳴らす必要は無い**
6. **`slides/_rules.js` が消えていて、配布が 2 ファイルで動く。**
   リポジトリの外のディレクトリに `player.html` と `slides/developer.js` だけを
   同じ位置関係で置き、`python3 -m http.server` で配信して開く。
   404 が出ないこと（ネットワークのリクエストのうちローカルを指すものが
   `slides/developer.js` だけであること）を確かめる

## 見なくてよいもの

- `archives/` 以下、`TODO.md`
- **レイアウトの測り直しは要らない**（文字サイズ、要素の位置、はみ出しの確認は不要）
- `duration` の測り直し（`slides/developer.js` のスライド 3 は implementer が
  測り済み。**再測定しない**。値が書き換わっていることだけ `git diff` で見る）
- `tools/make-video.py` とそのテスト

## 報告

`archives/agents/TODO-068/verifier-report.md` に書く。
**一致したものは 1 行、食い違いだけ詳しく。** 実測したコマンドと、
測った値（件数・一致した本数など）を必ず載せる。
返事は 5 行以内（終わったか・報告ファイルのパス・判断が要る点）。

---

## 追加（reviewer の指摘への対応分）

`README.md` と `slides/readme.js` の「ファイル 3 つ」を「ファイル 2 つ」に
直した（配布が 2 ファイルになったため）。詳しくは
`implementer-brief.md` の末尾の「## 追加」。

- **3 の突き合わせ**（置換後の読み上げ文の一致）では、`slides/readme.js` の
  ナレーションを変えた枚も除いて比べること。除いた枚を報告に書く
- **6 の配布の確認**は `slides/readme.js` でも同じことを 1 回やる
  （`player.html` + `slides/readme.js` の 2 ファイルだけで 404 が出ないこと）
- 文面が `implementer-brief.md` の「## 追加」に書いた文言と一致しているかを見る。
  **文言の良し悪しは見ない**（利用者が決めたもの）
