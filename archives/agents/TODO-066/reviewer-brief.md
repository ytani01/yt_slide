# TODO-066 reviewer への依頼

## 目的

TODO-066 で入った差分を、設計とリポジトリの規約に照らして見る。**コードは直さない。**
見つけたことは報告だけする。原因の切り分けや、直すかどうかの判断もしない。
境界線上のものは「実害は未確認」と添えて挙げる。

## 対象

    git status --short
    git diff
    tools/make-video.py        （新規。未追跡なので diff に出ない）
    tools/test_make_video.py   （新規。未追跡なので diff に出ない）

背景は `TODO.md` の「## TODO-066」、依頼した内容は
`archives/agents/TODO-066/implementer-brief.md`、実装側の報告は
`archives/agents/TODO-066/implementer-report.md`。

## 特に見てほしいところ

- **`measure-duration.py` の `tts_url()` 切り出しで、`measure()` の挙動が
  変わっていないか。** URL の組み立て（`TTS_MAX_CHARS` での切り詰めを
  どちら側に置いたか）に食い違いが無いか
- **`split_for_tts()` の境界。** 180 字ちょうど、181 字、区切り記号が無い長文、
  区切り記号が連続する場合に、何が起きるか
- **`.srt` の時刻の積み上げ方。** 末尾の無音を字幕に入れない扱いと、
  クリップの長さの積み上げが合っているか。ずれが溜まる作りになっていないか
- **ffmpeg の組み立て**（実装側が自分で組んだと申告している箇所）。
  静止画・音声・無音の長さの指定に、指定と実際がずれる余地が無いか
- **`README.md` と `docs/User.md` に書いた手順が、実装のオプション名・既定値と
  合っているか**（実行はしなくてよい。verifier が別に実行する）
- **要らない複雑さ**。既存の `tools/measure-duration.py` で足りるものを
  書き直していないか、使われない引数・分岐が無いか

## 見なくてよいもの

- 動画の見た目・画質・レイアウトの評価（別途 verifier が実物を見る）
- 4 本のスライド一式すべてでの検証（`readme` 1 本でよいと決めてある）
- Pyright の `importlib` 周りの型警告（既存の `test_measure_duration.py` と
  同じ書き方で、リポジトリの既存の流儀）

## 報告

`archives/agents/TODO-066/reviewer-report.md` に書く。
**問題の無かった観点は 1 行で、食い違いだけ詳しく。**
返事は「終わったか・報告ファイルのパス・判断が要る点」の 5 行以内。
