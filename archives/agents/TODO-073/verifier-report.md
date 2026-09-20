# verifier 報告 TODO-073

結論: 指示された 4 点とも確認できた。失敗なし。

## 1. index.html が返る
`python3 -m http.server 8123` で `http://localhost:8123/` を Playwright(chromium) で開いた。
status 200、title「yt_slide - スライド一覧」、`<a>` の href は 4 つ
(readme / user / developer / claude-memo の `player.html?slides=<名前>`)。サーバーは kill 済み(PID 消滅を ps で確認)。

## 2. 4 リンクのクリック遷移(1280x800、3 秒待ち)
| スライド | title | 1 枚目 | console error |
|---|---|---|---|
| readme | yt_slide - ファイル 2 つで動くナレーション付きプレゼン | 「SLIDE 01 / 10」 yt_slide | なし |
| user | player.html で別のスライドを作る - 使い方 | 「SLIDE 01 / 14」 USAGE GUIDE | なし |
| developer | player.html を直す人へ - 開発者向けガイド | 「SLIDE 01 / 11」 DEVELOPER GUIDE | なし |
| claude-memo | Claude Code 活用法 - プレゼン動画プレイヤー | 「SLIDE 01 / 17」 WORKFLOW PRESENTATION | なし |

「読み込めませんでした」は body に出ず。console は warning 1 件のみ
(`cdn.tailwindcss.com should not be used in production`。player.html 由来で既存)。

## 3. 幅 390px
scrollWidth 390 / innerWidth 390(横スクロールなし)。4 リンクとも left 16 〜 right 374 で収まる。
スクリーンショット目視はしていない(数値のみ)。

## 4. README.md / docs/User.md の追記
スクラッチにコピー(`/tmp/claude-649/t073/`、リポジトリ外)し、user の `<li>` を写して
`slides=demo` に直して追加 → 一覧に「demo / デモ」が出て、クリックで player.html が開いた
(demo.js は user.js のコピーなので title は user と同じ)。
「`<li>` を 1 つ足せば出る」は書いたとおりに動く。
(注) 私の置換は正規表現が広く、readme の `<li>` も重複して入った。テスト側の不手際で、対象の不具合ではない。

## 差分の範囲
- 変更: README.md、docs/User.md。新規(未追跡): index.html。`player.html` は無変更(`git diff --stat -- player.html` が空)。
- 指示範囲と一致。

## 気づいたこと(実害は未確認・報告のみ)
- CLAUDE.md「構成」の節は `index.html` に触れていない(今回の diff 対象外)。
- `slides/template.js` は一覧に無い(意図と思われるが、指示に明記がなく未確認)。
- 一覧のアイコン・フォントは CDN 依存。オフライン時の見え方は未確認。
