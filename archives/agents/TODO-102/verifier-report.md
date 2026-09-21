# TODO-102 verifier-report

作業ディレクトリ: `/net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide`
ブランチ: develop（未コミット）

## 1. `uv run pytest`

```
cd /net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide && uv run pytest
```

結果: `26 passed in 1.10s`。終了コード 0。

## 2. 変更ファイルの一致

```
git status --short
```

```
 M README.md
 M docs/Developer.md
 M docs/User.md
 M slides/readme.js
?? archives/agents/TODO-102/
```

指示どおり 4 ファイルのみ変更（`archives/agents/TODO-102/` は今回の報告置き場で対象外）。
`git diff --stat` も確認：

```
 README.md         | 172 +++++++++---------------------------------------------
 docs/Developer.md |   6 ++
 docs/User.md      |  41 ++++++++++++-
 slides/readme.js  | 129 +++++-----------------------------------
```

## 3. `slides/readme.js` の 6 枚を Playwright で確認

スクリプト: `/tmp/claude-649/.../f0af7285-.../scratchpad/check_slides.py`
（`file://<repo>/player.html?slides=readme` を開き、ArrowRight で送りながら
1280x720 と 390x844 の 2 サイズで各 6 枚をスクリーンショット）

実行:
```
.venv/bin/python check_slides.py
```

- 出力の `slideNum`/`totalSlides` はいずれのサイズでも `01/6`〜`06/6` と
  一致し、6 枚で揃っている（10 枚から減らした形跡や欠番なし）。
- 撮った PNG（12 枚、目視確認済み）:
  - `/home/ytani/tmp/playwright-mcp/TODO-102-readme-1-1280.png` 〜 `TODO-102-readme-6-1280.png`
  - `/home/ytani/tmp/playwright-mcp/TODO-102-readme-1-390.png` 〜 `TODO-102-readme-6-390.png`
- 12 枚すべて目視した結果、本文のはみ出し・重なり・見切れ、黒画面・白画面・
  空の枠、いずれも見当たらない。落とした 4 枚（slidesConfig と slideData／
  1 枚の要素／`render()` の書き方／duration の測り方）の内容も残っていない。
- モバイル（390 幅）のスライド 5「入っているスライド」の表は文字が小さいが、
  枠内に収まっており見切れてはいない（デザインの好みは対象外のため報告のみ）。

## 4. 4 枚目のリンク

スクリプト: `/tmp/claude-649/.../f0af7285-.../scratchpad/check_link.py`

```
.venv/bin/python check_link.py
```

出力:
```
slide before click: 04
user_link: [{"href": "player.html?slides=user", "target": null, "onclick": "event.stopPropagation()", "text": "スライドの作り方（user）"}]
gh_link: [{"href": "https://github.com/ytani01/yt_slide/blob/main/docs/User.md", "target": "_blank", "onclick": "event.stopPropagation()", "text": "docs/User.md"}]
navigated to: file:///.../player.html?slides=user#1
new page title: player.html で別のスライドを作る - 使い方 slide_num: 01
```

- `player.html?slides=user` へのリンクをクリックすると実際に `slides=user`
  のスライドへ遷移し、1 枚目が表示された（`onclick="event.stopPropagation()"`
  が効き、スライドクリックによる再生/一時停止に横取りされない）。
- GitHub リンクの href は指示どおり
  `https://github.com/ytani01/yt_slide/blob/main/docs/User.md`。

GitHub URL の到達確認:
```
curl -I --max-time 20 "https://github.com/ytani01/yt_slide/blob/main/docs/User.md"
```
→ `HTTP/2 200`

## 5. コンソールエラー・失敗リクエスト

`check_slides.py` の中で `page.on('console', ...)`（type=='error' のみ収集）
と `page.on('requestfailed', ...)` を仕込んで 1280x720 / 390x844 の両方で
記録。結果はどちらも:
```
"console_errors": [],
"failed_requests": []
```
0 件。

## 6. アンカーの到達確認

`grep -n '\](\(#\|[A-Za-z].*\.md#\)' README.md docs/User.md docs/Developer.md`
で `#` 付きリンクを洗い出し、リンク先ファイルの `^#+ ` 見出しと、
指示された規則（小文字化、空白は `-`、記号は除去）で機械的に突き合わせた。

確認したリンクと突き合わせ結果（すべて一致）:

| リンク元 | リンク先アンカー | 対応する見出し | 判定 |
|---|---|---|---|
| README.md:47 | `docs/User.md#手順` | `## 手順` | 一致 |
| README.md:69 | `docs/User.md#ytslide-のサブコマンド` | `` ## `ytslide` のサブコマンド `` | 一致（バッククォート除去→小文字化→空白をハイフン） |
| docs/User.md:41 | `#最小の例` | `## 最小の例` | 一致 |
| docs/User.md:61 | `#プレイヤーの操作ガイド` | `## プレイヤーの操作ガイド` | 一致 |
| docs/User.md:68 | `#body-で書く標準` | `` ## `body` で書く（標準） `` | 一致（バッククォート・全角括弧除去→ハイフン） |
| docs/User.md:95, 330, 418 | `#測定と動画に要るパッケージ` | `### 測定と動画に要るパッケージ` | 一致（新設分。空白なしなのでハイフン化の影響なし） |
| docs/User.md:109 | `#narration-と-duration` | `` ## `narration` と `duration` `` | 一致 |
| docs/User.md:129 | `#公開` / `#動画に書き出す` | `## 公開` / `## 動画に書き出す` | 一致 |
| docs/User.md:474 | `Developer.md#場所を選ばない` | `### 場所を選ばない`（Developer.md） | 一致 |
| docs/Developer.md:33 | `../README.md#インストール` | `## インストール`（README.md） | 一致 |

新設の 2 つ（`#ytslide-のサブコマンド`、`#測定と動画に要るパッケージ`）を
含め、食い違いは見つからなかった。

## 7. duration の測り直しが実際に反映されているか

`slides/readme.js` を書き換えずに `uv run ytslide measure --slides readme --all`
（`--write` なしの実測のみ）を実行し、出力の `-> duration: N` を、
現在のファイルの `duration:` の値（13, 12, 15, 14, 14, 13）と突き合わせた。

```
スライド 1: ... -> duration: 13
スライド 2: ... -> duration: 12
スライド 3: ... -> duration: 15
スライド 4: ... -> duration: 14
スライド 5: ... -> duration: 14
スライド 6: ... -> duration: 13
```

6 枚とも完全に一致。4 枚目の narration を変えた後の duration が
実測どおりに書き直されていることを確認した。
（`--write` 付きの実行はファイルを書き換える操作のため、確認担当の
権限上ここでは行っていない。`--write` なしでも比較には十分と判断した。）

## 確認できなかったこと・判断が要ること

- `--write` を伴う `measure` コマンドそのものの実行は行っていない
  （ファイルを書き換えてしまうため、確認担当としては避けた）。
  `--write` なしの実測値との突き合わせで、書かれている duration が
  現在の narration と整合していることは確認済み。
- モバイル表示のスライド 5 の表の文字サイズについては、見切れてはいないが
  やや小さい。デザインの好みは対象外との指示のため、判定はせず事実のみ
  報告する。
- それ以外、指示された確認項目（1〜5）はすべて実行し、食い違いは見つから
  なかった。

## 実行コマンド一覧

```
cd /net/fs/vol0/home.localhost.1-ytani/ytani/public_html/yt_slide && uv run pytest
git status --short
git diff --stat
.venv/bin/python /tmp/.../check_slides.py
.venv/bin/python /tmp/.../check_link.py
curl -I --max-time 20 "https://github.com/ytani01/yt_slide/blob/main/docs/User.md"
grep -n '\](\(#\|[A-Za-z].*\.md#\)' README.md docs/User.md docs/Developer.md
grep -n '^#\+ ' README.md docs/User.md docs/Developer.md
uv run ytslide measure --slides readme --all
```
