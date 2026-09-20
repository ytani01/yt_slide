# TODO-073. リポジトリの入口に `index.html` を置く

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |
| 実施 | Sonnet 5 / effort medium | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Sonnet 5 | medium | 4,593 | 73,831 | 67% |
| verifier | Sonnet 5 | medium | 3,981 | 27,183 | 17% |
| 合計 |  |  | 8,574 | 101,014 | 概算 $0.6 |

- 集計は `--since 2026-09-20 18:50:59`（直前の項目のコミット時刻）で切った。
  始点のコミットから着手までに別項目の作業が挟まっている
- 割合は表の 2 行で 84%。残りは `/clear` 前の Opus 5 の 1 メッセージ

## きっかけ

`yt_slide/` の URL を開くとディレクトリ一覧かサーバーのエラーになり、
`player.html` を自分で探すことになった。「URL を渡せばそのまま見てもらえる」
という `README.md` の説明と食い違っていた。

## やったこと

- `index.html` を新規作成。`readme`・`user`・`developer`・`claude-memo` への
  リンクを並べる一覧ページ（Tailwind・Google Fonts・FontAwesome を
  `player.html` と同じ外部から取る）。`player.html` は触っていない
- `docs/User.md` の「手順」に「`index.html` へ `<li>` を 1 つ足す」を追加し、
  「公開」に入口の説明を足した
- `README.md` に入口の説明とファイル構成の行を足した
- `CLAUDE.md` の「構成」に `index.html` を足した（verifier の指摘）

`slides/template.js` は一覧に載せていない（4 つの一覧にすると決めたため。
`template` は書き写す元で、見せるスライドではない）。

## 確かめたこと

verifier が Playwright で実測した（報告は `archives/agents/TODO-073/verifier-report.md`）。

- ディレクトリの URL で `index.html` が返る
- 4 つのリンクとも `player.html` が開き、1 枚目が描画され、読み込みエラーは無い
- 幅 390px で横スクロールが出ない
- `docs/User.md` の手順どおり `<li>` を足すと一覧に出る

## 分担の振り返り

- verifier: 4 点とも通った。見つけたのは `CLAUDE.md` の「構成」に
  `index.html` が無かったこと 1 件（文書の追従漏れ）。動作の不具合は無かった
- 見込みと食い違いは無い。実装は main が 1 ファイル 1 コマンドで済み、
  実装担当を分ける規模ではなかった
- 次に同じ規模（静的な 1 ページ＋文書追記）なら、同じ組み方でよい。
  確認の依頼に「文書の索引（`CLAUDE.md` 等）に追従漏れが無いか」を
  1 行足すと、main が後から拾う手間が減る
