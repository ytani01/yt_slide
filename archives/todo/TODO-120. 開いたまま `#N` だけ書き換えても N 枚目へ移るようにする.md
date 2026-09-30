# TODO-120. 開いたまま `#N` だけ書き換えても N 枚目へ移るようにする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 32 | 4,702 | 42,500 | 741,839 | 68% |
| reviewer | Opus 5.5 | high | 16 | 87 | 35,350 | 181,411 | 19% |
| verifier | Sonnet 5.5 | medium | 14 | 134 | 23,733 | 123,524 | 13% |
| 合計 |  |  | 62 | 4,923 | 101,583 | 1,046,774 | 計 1,153,342 |

- reviewer・verifier とも定義（`~/.claude/agents/`）のモデル・effort のまま

## きっかけ

`player.html` は `#N` を起動時に 1 回だけ読む（TODO-074）。`#` の後ろだけが
変わってもブラウザはページを読み直さないので、アドレスバーで `#4` を `#7` に
書き換えても表示は 4 枚目のままだった。slide_backgammon の TODO-052 で見つかった。

## やったこと

- `player.html` の `startApp()` で `hashchange` を受け、
  `renderSlide(startIndexFromHash(), true)` を呼ぶ。不正な番号は起動時と同じく
  1 枚目に寄せる。`renderSlide()` の `replaceState` は `hashchange` を起こさないので
  繰り返さない
- `docs/Developer.md` の「表示中のスライド番号を URL に載せる」を書き直した
  （追従しない → 追従する。戻る・進むでも移ることを reviewer の指摘で足した）
- `docs/UsersGuide.md` の「このスライドを見て」と渡す、に 1 文足した

## 確かめたこと

verifier が Playwright（chromium、1280x720）で実測した
（`archives/agents/TODO-120/verifier-report.md`、`verify.py`）。

- `#4` → `location.hash='#7'` で表示 07・URL `#7`
- `#abc`・`#999` で表示 01・URL `#1`
- 移った後 500ms で `hashchange` は 1 回だけ
- `page.goto` で `#4` → `#7` と続けて開くと 07
- 足した行を消すと上の 1・2・4 が落ちる

## 残ること

- `uv run pytest` の `tests/test_measure.py::test_all_slides_rules_load` が
  `assert 25 == 23` で落ちる。変更を退避した HEAD でも同じなので、この項目の
  差分が原因ではない。原因は未調査

## 分担の振り返り

- reviewer は要修正 0 件。戻るボタンでも移るようになる点と、UsersGuide の
  言い回しを検討として挙げ、両方とも文書に反映した。verifier は項目 1〜6 を
  実測し、既存のテスト失敗を見つけた
- 見込みと食い違いは無い
- 次に 1 行の挙動変更をやるときも同じ組み方でよいが、reviewer の cache_creation が
  output に比べて大きい。依頼で `player.html` の読む範囲を関数名で絞れば減らせる
