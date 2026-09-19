# TODO-059 の分担

「HTML 1 枚で動く」を「ファイル 3 つを置くだけで」に直した項目。

| 担当 | 何を頼んだか | 報告 |
|------|--------------|------|
| wording | `README.md` と `slides/readme.js` の 6 箇所の書き換え | [wording-report.md](wording-report.md) |
| main | 見出しの手直し、`duration` の測り直し | — |
| verifier | 残存の grep、対象外が変わっていないこと、`duration`、画面の確認 | [verifier-report.md](verifier-report.md) |

## この分担にした理由

- 事実の言い換えだけで分岐は変わらないので、**reviewer は入れない**
  （TODO.md に立てたときからそう決めていた）
- 文言の書き換えは wording に出した。書き換える箇所と、保つもの
  （HTML の構造・クラス、「ビルドもインストールも不要」）、対象外のもの
  （`'1 枚目'` などのサンプル）を依頼文に名指しで書いた。**突き合わせる対象が
  6 箇所**で、Haiku に渡せる範囲に収まっている
- 画面が崩れていないかは静的な読み合わせでは分からないので、verifier に
  **Playwright・1920×1080・`renderSlide(n, true)` で切り替え**まで指定して
  実測させた
- 見出しを縮めたあとの撮り直しは、担当を立て直さず**同じ verifier に続けて**
  頼んだ（計測環境の組み直しを避けるため）

verifier は TODO-065 の確認も兼ねている。
