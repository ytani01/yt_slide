# TODO-130. UsersGuide では Claude Code を使うやり方を標準にする

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装・文書）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort 不明 | main（実装・文書）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | 不明 | 68 | 22,957 | 88,418 | 2,604,492 | 70% |
| reviewer | Opus 5.5 | high | 44 | 197 | 70,518 | 970,611 | 27% |
| verifier | Sonnet 5.5 | medium | 12 | 73 | 21,852 | 112,213 | 3% |
| 合計 |  |  | 124 | 23,227 | 180,788 | 3,687,316 | 計 3,891,455 |

- reviewer・verifier は定義（`~/.claude/agents/`）のモデルと effort のまま
- main の effort は記録に残っておらず、セッション中に確かめていない

## きっかけ

UsersGuide は手で `slides/<名前>.js` を書く流れが標準で、Claude Code は
「AI に作ってもらう」の後ろの 1 節にあった。2026-10-02 に利用者が、「手順」を
Claude Code の流れに書き換え、手で書くやり方は後ろへ移して残す、`init` の
既定でも `CLAUDE.md` を置く、と決めた。

## やったこと

- `src/ytslide/cli.py` — `init` のオプションを `--claude/--no-claude`（既定 True）に
  した。旧来の `--claude` もそのまま通る。生成する `CLAUDE.md` の
  「`ytslide init --claude` で生成した」を「`ytslide init` で生成した」に
- `tests/test_cli.py` — 既定で `CLAUDE.md` を置くこと、`--no-claude` で置かないこと、
  二度目の `init --claude` で上書きしないことを確かめる形に
- `docs/UsersGuide.md` — 「手順」を「1. 自分の作業場所を用意する（`init` で
  `CLAUDE.md` も）→ 2. Claude Code に作ってもらう → 3. 確かめる」にし、流れの
  mermaid 図を手順の冒頭へ。ZIP で試す・手で書く・他の AI に頼む、は新しい
  「## 別のやり方」へ移した。clone した中で作る場合は直下の `CLAUDE.md` が
  開発者向けなので、別の場所で `init` するよう書き換えた（reviewer の指摘）。
  `update` は「時間表示を合わせるなら」の書き方に揃えた（同）
- `README.md`・`docs/Developer.md` — `--claude` の記述と、UsersGuide の旧見出しへの
  リンクを合わせた
- `slides/users-guide.js` — 3〜6枚目を「準備する → Claude Code に作ってもらう →
  確かめる → 別のやり方」に組み替え、`ytslide measure --write` で `duration` を
  測り直した（利用者が着手中に決めた。TODO.md の節に項目を足した）

## 確かめたこと

- reviewer — 要修正 1 件（clone の案内）と検討 2 件（`update` の書き方、旧
  `--claude` のテスト）。すべて反映した。テストは既定を False に戻す・
  `--no-claude` を無視する・`CLAUDE.md` を上書きする、の 3 通りの変異で落ちる。
  README と docs の `#アンカー` 39 件が実在の見出しを指す
- verifier — 空ディレクトリで UsersGuide の「1.」を再現し、文書どおりのファイルが
  でき、`CLAUDE.md` が `CLAUDE_MD` と一致。再実行で上書きしない。`--no-claude`・
  `--claude`・`--help` も確認。`uv run pytest -q` 41 passed、
  `ytslide check --slides users-guide` 問題なし

報告は `archives/agents/TODO-130/` にある。

## 分担の振り返り

- **reviewer** は、移した文が新しい文脈で別の手順を指してしまう箇所（clone の
  案内）を見つけた。main は移動の差分だけを見ていて拾えなかった。**verifier** は
  食い違いを見つけなかった（再現は 1 回で通った）
- 見込みと編成は一致した。途中で `slides/users-guide.js` の組み替えが加わったが、
  担当は増やさずに済んだ
- 次に同じ規模（文書の組み替え + CLI の既定の変更）をやるなら同じ組み方でよい。
  reviewer のトークンは cache_read が大半なので、依頼で「見なくてよいもの」に
  スライドの JS 全体を外し、3〜6枚目だけを名指しすれば減らせた
