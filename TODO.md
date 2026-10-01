# TODO

**残っている項目: TODO-130。** これまでに 129 件を決着させた。
新しく足すときは「完了済み」の上に節を作る。**番号は `TODO-131` から。**

---

## TODO-130. UsersGuide では Claude Code を使うやり方を標準にする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装・文書）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

- [ ] `ytslide init` が既定で `CLAUDE.md` も置く。要らなければ `--no-claude` で外す
- [ ] `tests/test_cli.py` を新しい既定に合わせる
- [ ] `docs/UsersGuide.md` の「手順」を、`ytslide init` → `claude` に頼む → 確かめる、
      の流れに書き換える。手で書く・他の AI に頼むやり方は後ろの節（別のやり方）へ移して残す
- [ ] `README.md`・`docs/Developer.md`・`init` の生成する `CLAUDE.md` の中の
      `init --claude` の記述を合わせる（`rg -n -e "--claude" --glob '!archives'` で拾う）

今の UsersGuide は手で `slides/<名前>.js` を書く流れが標準で、Claude Code は
「AI に作ってもらう」の後ろの 1 節にある。

**決めたこと**（2026-10-02 に利用者が決めた）— 「手順」を Claude Code の流れに
書き換え、手で書くやり方は後ろへ移して残す。`init` の既定でも `CLAUDE.md` を置く。

`init` の挙動が変わるので reviewer を入れる。UsersGuide の手順は書いたとおりに
試せるので、その再現は verifier に分ける。

---

## 完了済み

決着した項目は `archives/todo/` にある（1 項目 1 ファイル）。
一覧は [archives/index.md](archives/index.md)（新しい順）。やらないと決めたものは
ファイル名に（対応しない）が付いていて、理由も書いてある。蒸し返す前に読むこと。
