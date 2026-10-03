# TODO-132. スマホでネットにつながっていなくても動くようにする（対応しない）

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5 / medium） |
| 実施 | Opus 5.5 / effort medium | implementer（Opus 5.5 / medium）+ reviewer（Opus 5.5 / high） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 72 | 20,793 | 135,021 | 2,442,578 | 33% |
| implementer | Opus 5.5 | medium | 116 | 5,212 | 112,404 | 4,098,919 | 54% |
| reviewer | Opus 5.5 | high | 36 | 3,649 | 83,150 | 973,171 | 13% |
| 合計 |  |  | 224 | 29,654 | 330,575 | 7,514,668 | 計 7,875,121 |

- implementer は定義のモデルが sonnet。Service Worker と読み上げの分岐が込み入るので Opus 5.5 に上書きした
- verifier はやめると決めた時点でまだ起こしていない

## きっかけ

slide_backgammon のセッションからの依頼（利用者の指示）。スマホでネットに
つながっていなくても、スライドを開いて再生できるようにしたい。`player.html` と
`index.html` は Tailwind（cdn.tailwindcss.com）・Font Awesome（cdnjs）・
Google Fonts を CDN から読み、Online の読み上げは translate.google.com を使う。

着手時に決めたこと（利用者）:

- Tailwind は CDN の script をそのままリポジトリに置く（使うクラスだけの書き出しはしない）
- フォントは入れない。オフラインでは端末のフォント
- `file://` は取り込んだ分で見た目が崩れなければよい。Service Worker は http(s) のときだけ登録する

## やらないと決めた理由

一通り実装した（`vendor/` への取り込み、network-first の `sw.js`、
`manifest.webmanifest` とアイコン、オフライン時は Web Speech で読み、それも
失敗したら無音で `duration` だけ待つ、`ytslide init`・`web`・force-include の対応、
文書の更新）。しかしオフラインで使うには問題が多く、利用者の判断で差分を
すべて捨てた。

- 保存されるのは表示したファイルだけ。見ていないスライドの画像などが欠ける
- ホーム画面のアイコンから開くと、オフラインで開けない経路がある。
  manifest の `start_url` が `index.html` で、`/` や `player.html?slides=x`
  しか開いていないとキャッシュに無い（reviewer が Playwright で実測、`net::ERR_FAILED`）
- `player.html` が manifest を読むと、Android で `?slides=` 付きのページを
  ホーム画面に置いても一覧が開くおそれがある（未確認）
- フォントは端末のものになる。Google Fonts の CSS は `max-age=86400` で、
  ブラウザのキャッシュでは 1 日しか持たない（実測）。iPhone では折り返しが変わりうる
- 読み上げは端末の声になり、日本語の声が無ければ無音で進む
- iPhone の Safari は 7 日開かないと保存が消え、ホーム画面のアプリとは保存場所が別
- 実機（Android・iPhone）ではどれも確かめていない

開いたときにスライド一式（js・画像・使う文字のフォント）をまとめて保存する案も
出したが、これも「やらない」と決まった。

## 確かめたこと

- implementer: `uv run pytest` 41 件が通り、Playwright でオフラインにして
  再読み込みしても player.html・index.html が表示された（報告に測った値）
- reviewer: 上の `start_url` の問題を実測で見つけた。ほかに `ytslide web` の
  既定ポートに SW が残る懸念、テストが無いことなどを挙げた

報告と確認用のスクリプトは `archives/agents/TODO-132/` にある。

## 分担の振り返り

- **implementer** は指示の範囲を実装し、設計に足りない点（初回の読み込みは
  SW を通らない、SVG だけではインストールできるか不明）と範囲外の古い記述を
  自分で見つけた。**reviewer** は「ホーム画面からオフラインで開けない」を実測で
  示し、これがやめる判断の決め手の 1 つになった
- 見込みとの食い違いは verifier を起こさなかったことだけ。やめると決まったため
- 次に「プラットフォームの制約で成り立つか分からない」項目をやるなら、
  実装の前に調査だけの担当（Sonnet 5 / medium）を立て、キャッシュの期限・
  iPhone の保存の制限・ホーム画面から開く URL といった制約を先に並べて
  利用者に見せる。今回は実装と reviewer の後で制約が分かり、
  implementer の分（全体の 54%）が丸ごと無駄になった
