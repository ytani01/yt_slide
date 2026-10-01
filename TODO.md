# TODO

**残っている項目: TODO-129。** これまでに 128 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-130` から。**

---

## TODO-129. ytslide web でも、作業場所に player.html が無ければ同梱のものを配る

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] 作業場所に `player.html` が無いとき、`ytslide web` が `/player.html` を
      同梱のものから配る
- [ ] `ytslide web` に `--root` を足す（無ければ今までどおりカレント）
- [ ] `docs/UsersGuide.md` の `ytslide web` の説明を合わせる

`ytslide web` はカレントを `SimpleHTTPRequestHandler` でそのまま配るので、
作業場所に `player.html` が無いと 404 になる。`ytslide init` した作業場所では
起きない（TODO-128 の reviewer が見つけた）。

**決めたこと** — `/player.html` だけ同梱へ落とし、`--root` も足す
（2026-10-02 に利用者が決めた）。

TODO-128 で足した `browser._Handler` を流用できるが、あちらはリクエストの
ログを出さない。`web` は人が見るサーバーなので、ログは今までどおり出す。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
