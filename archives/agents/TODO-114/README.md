# TODO-114 の分担

項目の内容と結果は
[archives/todo/TODO-114](../../todo/TODO-114.%20他に無い点を%20README%20とスライドではっきり書く.md)
にある。ここには分担の理由と、各担当の報告を置く。

## 分担にした理由

| 担当 | 何を頼んだか | なぜ分けたか |
|------|--------------|--------------|
| verifier（1回目） | 5 点と、テキストの利点 7 項目が今の実装で本当にできるか | **書く前に確かめさせた。** 見立てのまま書くと、実装より強い主張がそのまま残る（TODO-088 と同じ） |
| main | README・`docs/User.md`・`slides/readme.js` の執筆 | 何を訴求するかを利用者と決める工程が入るため。wording（Haiku）には渡せない |
| wording | `.md` の推敲 | 書いた本人は自分の日本語を疑えない |
| verifier（2回目） | 書いたものが実装と合っているか、コマンド例が動くか、スライドが表示されるか | 書いた本人は「合っているはず」で済ませてしまう |

**reviewer は立てていない。** 挙動も分岐も変わらず、変えたのは文書と
スライドのデータだけのため。

**verifier は 2 回とも同じ担当に続けて頼んだ**（立て直すと事実確認の
材料を集め直すことになる）。

## 報告

- [verifier-facts-report.md](verifier-facts-report.md) — 1回目。5 点の事実確認
- [wording-report.md](wording-report.md) — `.md` の推敲
- [verifier-report.md](verifier-report.md) — 2回目。**`slides/readme.js` を
  `git checkout --` で消した事故の報告を含む**
- [verifier-report2.md](verifier-report2.md) — 作り直した `slides/readme.js` の表示確認

## 検証で作ったファイル

`sample.csv`・`gen_slides.py`・`generated.js` は、「データからスライドを
機械的に作れる」ことを実際に動かして確かめたときのもの。
