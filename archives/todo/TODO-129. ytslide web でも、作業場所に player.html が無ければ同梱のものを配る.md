# TODO-129. ytslide web でも、作業場所に player.html が無ければ同梱のものを配る

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 42 | 9,605 | 56,984 | 1,205,700 | 66% |
| reviewer | Opus 5.5 | high | 24 | 2,306 | 43,894 | 376,767 | 22% |
| verifier | Sonnet 5.5 | medium | 20 | 106 | 24,596 | 214,637 | 12% |
| 合計 |  |  | 86 | 12,017 | 125,474 | 1,797,104 | 計 1,934,681 |

- reviewer・verifier とも、定義（`~/.claude/agents/`）のモデル・effort のまま

## きっかけ

`ytslide web` はカレントを `SimpleHTTPRequestHandler` でそのまま配るので、
作業場所に `player.html` が無いと 404 になる。`ytslide init` した作業場所では
起きない（TODO-128 の reviewer が見つけた）。

`/player.html` だけ同梱へ落とし、`--root` も足すと決めた（2026-10-02 に利用者が決めた）。

## やったこと

- `src/ytslide/browser.py` — TODO-128 の `_Handler` を、ログを出す `PlayerHandler` と、
  それを継いでログを止める `_Handler` に分けた。`/player.html` の出どころは
  `paths.PLAYER_HTML`（起動時に一度だけ決まる）をやめ、リクエストのたびに
  作業場所の `player.html` の有無を見て決める（reviewer の指摘 3）
- `src/ytslide/cli.py` — `web` に `--root` を足し、`browser.PlayerHandler` で配る
- `tests/test_cli.py` — `web` を子プロセスで起動し、同梱の `player.html` が返ること、
  作業場所のスライドが返ること、リクエストのログが出ることを見るテストを足した
- `docs/UsersGuide.md` — `web` が同梱の `player.html` を配ること、`--root` が使えることを書いた
- `docs/Developer.md` — `browser.py` と `tests/test_cli.py` の説明を合わせた

## 確かめたこと

`uv run pytest -q` は 41 件通った。verifier が実機で `ytslide web --root` を起動し、
同梱の `player.html`・作業場所のスライド・ログ・起動後に置いた `player.html` への
切り替わり・`--root` 無しでの起動を確かめた。`check` の出力にログが混ざらないことも見た。
壊し方 3 種（同梱へ落とさない・ログを止める・`--root` を無視する）で、テストはどれも落ちた。
詳細は [archives/agents/TODO-129/](../agents/TODO-129/README.md)。

## 分担の振り返り

- **reviewer** は、`web` の語を含まないため依頼の `rg` で拾えなかった古い説明
  （`docs/Developer.md`・docstring）、テストが 404 で約 5 秒待ってから分かりにくく
  落ちること、`player.html` の有無を起動時に一度だけ決めていることを見つけた。
  3 つとも直した
- **verifier** は食い違いを見つけなかった（`check` が画像の 404 で終了コード 1 になったのは、
  依頼で画像を置かせなかったため）
- 見込みとの食い違いは無い。次に同じ規模なら同じ組み方でよいが、reviewer への
  依頼の `rg` は語ではなくファイル名（`browser.py`・`test_cli.py`）でも引かせる。
  verifier の `check` の依頼では `images/` も一緒にコピーさせ、終了コード 0 で見られるようにする
