# TODO-103 verifier 報告

検証環境: scratchpad に `player.html` と `slides/` を `\cp` でコピーし、
docs/User.md「最小の例」のコードをそのまま `slides/sample.js` として保存。
`python3 -m http.server` で配信し、Playwright（chromium, node）で実測した。
（`file://` ではなく http で確認。`?slides=` の fetch は http のほうが
実際の公開・共有時に近いため）

## 確認 1（最重要）装飾なしの `body` が実際に読めるか

**実測値**

| | デスクトップ (1280x800) | スマホ (390x844) |
|---|---|---|
| `<p>` の `font-size`（computed, 未スケール） | 16px | 16px |
| `<p>` の `color`（computed） | rgb(248, 250, 252) = `#f8fafc` | rgb(248, 250, 252) = `#f8fafc` |
| `<p>` の `getBoundingClientRect()` | width 815.9 / height 24 | width 319.0 / height 8.95 |
| `.video-viewport` の `getBoundingClientRect()` | width 918 / height 516.4 | width 358 / height 201.4 |
| `.video-viewport` の `background-color` | rgb(15, 23, 42) = `#0f172a` | 同左 |
| `--vp-scale`（.video-viewport に適用される transform の倍率） | 0.956 | 0.373 |

- **文字が背景に沈んでいるか**: 沈んでいない。文字色 `#f8fafc` と
  背景色 `#0f172a` は仕様どおりで、両サイズともコントラストは保たれている。
  スクリーンショットでも明瞭に見える。
- **文字が小さすぎて読めないか**: **スマホでは実害あり**。
  `.video-viewport` は `transform: scale(var(--vp-scale))` で縮小表示される
  仕組みで、スマホでは倍率が 0.373 しか無い。装飾なしの `<p>` は
  ブラウザ既定の 16px のままなので、実際に画面へ出る大きさは
  16px × 0.373 ≈ 6px 相当（実測の `<p>` 行の高さは 8.95px、枠の高さ
  201.4px に対し約 4.4%）。スクリーンショット
  （`~/tmp/playwright-mcp/todo103-mobile.png`）でも本文がほぼ判読できない
  大きさで表示された。
  - 変更前の例（`clamp(1.15rem, 2.8cqw, 2.1rem)`、960px 基準で解決される
    ため 2.8cqw ≈ 26.9px）であれば、同じ縮小率でも 26.9px × 0.373 ≈ 10px
    相当になり、装飾なしより約 1.7 倍大きく表示されたはずである
    （こちらは実装を戻して実測してはいない。計算による見積もり）。
  - デスクトップでは倍率が 0.956 とほぼ 1 のため、16px でも実用上問題
    ない大きさで表示された（スクリーンショット参照）。
- **提案（提案のみ、ファイルは直していない）**: 「最小の例」に
  最低限の `font-size` 指定（例えば控えめな `clamp()`）を足すか、
  `player.html` 側に `.video-viewport p` の既定サイズを cqw ベースで
  少し大きく設定することを検討してよいのではないか。どちらを選ぶかは
  判断が要る。

**スクリーンショット**
- デスクトップ: `~/tmp/playwright-mcp/todo103-desktop.png`
- スマホ: `~/tmp/playwright-mcp/todo103-mobile.png`
- 両方ともチャットに添付済み

## 確認 2 デモ URL が実際に開くか

- `https://ytani01.github.io/yt_slide/` → `curl --max-time 20`: HTTP 200
- `https://ytani01.github.io/yt_slide/player.html?slides=template` →
  `curl --max-time 20`: HTTP 200。Playwright で開き `waitUntil: networkidle`
  後、画面上の総数表示が `/ 19` であることを確認
  （スクリーンショット `~/tmp/playwright-mcp/todo103-template-demo.png`）
- **19 種類の照合**: リポジトリの `slides/template.js` にある
  `// ── N. 名前 ──` 形式のコメントを数えると **19 個**
  （1〜19、`grep -n "── [0-9]" slides/template.js` で確認）。
  デモの表示 `/ 19` と一致した。

## 確認 3 文書どうしの食い違い

- README のコード例（`title`/`duration`/`narration`/`body`、`icon` は省略）と
  `docs/User.md` の「最小の例」（同じ 4 項目に加え `icon` あり）は、
  食い違いではない。`icon` は `docs/User.md` の「`slides/<名前>.js` の中身」
  節で「省略できる」と明記されており、両者は矛盾しない
- 手順 2 に足した「`slides/template.js` からコピーして始めてもよい」の
  1 段落と、手順 3 の既存段落「型をコピーするときは…」は、**二重に
  なっていない**。手順 2 側は「その道もある」という案内で「手順は次の 3.」
  と明示的に手順 3 へ誘導しており、手順 3 側でコピーの具体的な操作
  （`?slides=template` で開く → 1 枚をコピー → 差し替える）を説明する
  役割分担になっている。順序も手順 2 → 3 の流れのままで、逆転していない
- 内部リンクの実在確認（github-slugger ライブラリで GitHub のアンカー
  生成を再現して照合）:
  - `[`render()` の書き方](#render-の書き方)` → 見出し `` ## `render()` の書き方 `` の
    スラグは `render-の書き方` で **一致**
  - `[「body で書く」](#body-で書く標準)` → 見出し `` ## `body` で書く（標準）`` の
    スラグは `body-で書く標準` で **一致**
  - ただし github-slugger は GitHub 本体のスラグ生成器そのものではなく
    近似実装（remark 等で広く使われるもの）。実際の github.com 上での
    表示確認はしていない。**GitHub 上で開いてアンカーへ飛ぶかまでは
    未確認**
- `[LICENSE](LICENSE)` は実在し、`MIT License`（`Copyright (c) 2026
  Yoichi Tanibayashi`）で始まる。README の「MIT License」の記述と一致
- 「このリポジトリのスライドもそうやって作った」（AI に書かせた）の根拠:
  `archives/todo/TODO-051. README.md と docs の内容をスライドにする.md`
  に、implementer（Sonnet 5）3 人が並列で `slides/readme.js`・
  `slides/usage.js`（現 `user.js`）・`slides/developer.js` を
  `README.md`/`docs/` の内容から書き起こした記録がある。事実として
  妥当と判断できる

## 変更ファイルの範囲

`git diff` で見た限り、変更は `README.md` と `docs/User.md` のみで、
`TODO.md` の指示範囲と一致している。変更していない節の文面は見ていない。

## 確かめられなかったこと・判断が要ること

- スマホでの本文の大きさが「実害」かどうかは実測で示したが、
  **どこまで直すべきか（最小の例に何を足すか）は判断が要る**。
  提案は上記に書いたが、選ぶかどうかは管理者の判断
- 内部リンクのアンカーは近似ライブラリでの照合にとどまり、
  **実際の github.com 上での遷移は未確認**
- 「クリップボード等が無く読み上げの再生や TTS の挙動」は指示どおり
  見ていない
- デザインの良し悪し・配色の趣味は指示どおり評価していない
