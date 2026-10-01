# TODO-128. 作業場所に player.html が無くても、作業場所のスライドを書き出す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 54 | 12,037 | 59,383 | 1,719,745 | 69% |
| reviewer | Opus 5.5 | high | 26 | 2,355 | 39,098 | 414,941 | 18% |
| verifier | Sonnet 5.5 | medium | 26 | 573 | 28,301 | 305,745 | 13% |
| 合計 |  |  | 106 | 14,965 | 126,782 | 2,440,431 | 計 2,582,284 |

- reviewer・verifier とも、モデル・effort は `~/.claude/agents/` の定義のまま
  （Agent ツールで渡したモデルも定義と同じ）
- 決着のコミットの前に集計したので、終点は集計した時刻まで

## きっかけ

`paths.set_root()` は作業場所に `player.html` が無いと同梱データ側へ落とすが、
`video`・`pdf` は `file://` でその `player.html` を開くので、ページは同梱側の
`slides/<名前>.js` を読んでいた。同梱側に同じ名前があると、エラーにならずに
違うスライドで書き出す。`check` は作業場所を HTTP で配って `/player.html` を
開くので 404 になっていた（TODO-112 の reviewer が実測）。
エラーで止めるのではなく、同梱の `player.html` で作業場所を読ませると
利用者が決めた（2026-10-02）。

## やったこと

- `src/ytslide/browser.py` に `serve_root()` と `open_player()` を足した。
  作業場所を 127.0.0.1 の空いたポートで HTTP で配り、`/player.html` だけ
  `paths.PLAYER_HTML`（作業場所にあればそれ、無ければ同梱）を返す。
  リクエストのログは出さない（`video`・`pdf` の出力を変えないため）
- `check.py`・`pdf.py`・`video.py` を `open_player()` に寄せた。`video`・`pdf` は
  `file://` から HTTP に変わった
- `tests/test_browser.py` に 2 本（作業場所に `player.html` が無いとき・あるとき）
- `docs/Developer.md` の構成の表で `browser.py` と `test_browser.py` の行を更新

## 確かめたこと

- 着手前（main）: readme の 2枚目と template の画像入りスライドを `file://` と
  HTTP で 1920×1080 に撮り、PNG がバイト単位で同じ。template の 1枚目は初回だけ
  16 画素違ったが、`file://` 同士でも同じだけ揺れ、2 回目は HTTP と一致した
  （初回描画の揺れで、開き方の違いではない）
- reviewer: 要修正 0 件（`?query` の扱い、パスの判定、後始末の順序と例外時の停止、
  pypdf の確認が chromium の起動より前のままか、docs と docstring）
- verifier: `player.html` の無い作業場所に `slides/readme.js`（template の写しで
  題を書き換えたもの）を置き、`pdf` は 19 ページで 1ページ目に書き換えた題、
  画像のページも欠けなし。`check` は問題なし、画像を消すと終了コード 1 で 404 を報告。
  `video --only 1` のフレームに書き換えた題が映った。pytest 40 本、ruff 通過。
  `translate_path` の上書きを外すとテストが 404 で落ちる
- verifier が挙げた「作業場所に `player.html` があっても同梱を返す」は誤読
  （`paths.PLAYER_HTML` が作業場所を優先し、`test_serve_root_prefers_own_player` が
  確かめている）。動画の端の暗い帯は表紙の背景の円で、`file://` でも同じに映る

## 残ること

- `ytslide web`（`cli.py` の `web`）は、作業場所に `player.html` が無いと今も
  `/player.html` が 404 になる（reviewer の指摘）。`ytslide init` した作業場所では
  起きない。直すかは別の項目として利用者に聞く

## 分担の振り返り

- reviewer は要修正を見つけず、範囲外の `web` の 404 を見つけた。verifier は
  実際の書き出しで作業場所のスライドが使われることを確かめ、テストが壊すと
  落ちることも示した。verifier の「判断が要る点」2 つはどちらも main の確認で
  問題なしと分かった
- 見込みどおりの編成で食い違いは無い
- 次に同じ規模（数ファイル・分岐 1 か所）なら同じ組み方でよいが、verifier の依頼に
  「作業場所に `player.html` を置いた場合」も 1 行入れる。今回はそれが無かったため
  誤読の確認を main がやることになった
