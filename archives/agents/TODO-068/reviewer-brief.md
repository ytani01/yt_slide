# TODO-068 reviewer への依頼

## 目的

TODO-068 の差分をレビューする。**コードは直さない。** 見つけたことは
報告するだけにする。原因の切り分けや、境界線上の判断もしない
（「実害は未確認」と添えて報告する）。

## 対象

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`

    git diff
    git status

実装の依頼書は `archives/agents/TODO-068/implementer-brief.md`、
報告は `archives/agents/TODO-068/implementer-report.md`。

## 何をやった項目か

`slides/_rules.js` を廃止し、共通の読みの置換表 `SPEECH_RULES` を
`player.html` の `prepareSpeechText()` の直前へ戻した。
`tools/measure-duration.py` の `load_common_rules()` の読み先も `player.html` に
変えた。文書 4 本とスライド一式 4 本の言及も直した。

## 特に見るところ

- **`load_common_rules()` のパース。** `const SPEECH_RULES = [` 〜 `];` の
  囲いの正規表現が、`player.html` の中身に対して正しく当たるか。
  広く当たりすぎていないか（`JS_RULE_RE` を `player.html` 全体に当てる形に
  なっていないか）、逆に取りこぼしが無いか。**囲いを誤ると共通表が空になり、
  置換が全部素通りするだけで例外は出ない**（`assert len(common_rules) == 23`
  以外は落ちない）ので、そこを重点的に見る
- **置換表の中身と並び順が移動前と同一か。** `git show HEAD:slides/_rules.js` と
  突き合わせる。1 ルールでも順が入れ替わると読みが変わる
- **`player.html` 内での `SPEECH_RULES` の定義位置。** `prepareSpeechText()` から
  見えるか（同じ `<script>` の中か、先に評価されるか）
- **文書とスライドの記述が実装と合っているか。** 特に `docs/User.md` の
  「他のサーバーへ持っていくとき」の数（3 つ → 2 つ）と、
  `docs/Developer.md` の「`_rules.js` はスライド一式より先に読む必要がある」の
  ような、もう成り立たない説明が残っていないか
- **`_rules.js` への言及が残っていないか**（`archives/` と `TODO.md` を除く）:

      grep -rn '_rules' --include='*.md' --include='*.js' --include='*.py' --include='*.html' . | grep -v '^./archives/' | grep -v __pycache__

## 見なくてよいもの

- `archives/` 以下、`TODO.md`（決着のときに管理者が直す）
- スライドのレイアウトの測り直し、`duration` の値の妥当性
- `slides/developer.js` の文面そのもの（利用者と決めた文言をそのまま入れている。
  **依頼書の文面と一致しているか**だけ見る）
- `tools/make-video.py` とそのテスト

## 報告

`archives/agents/TODO-068/reviewer-report.md` に書く。
**一致したものは 1 行、食い違いだけ詳しく。** 要修正か検討かを分けて書く。
返事は 5 行以内（終わったか・報告ファイルのパス・判断が要る点）。
