# TODO-099 の見直し

2026-09-21。利用者の依頼は、スライド作成者の観点から TODO-099 を見直すこと。
当初の対象は TODO の内容。その後、利用者が TODO-099 本体の実施を指示した。

main が現行の文書と CLI を照合して TODO を修正し、別の reviewer が
初回作成・編集・一覧更新・測定・共有の流れと実装との整合を確認する。
書式だけの変更ではないため、AGENTS.md に従って確認を分けた。
本文の実装後は同じ reviewer に差分確認を依頼し、その後に verifier が手順と画面を実測する。

- main: Codex（GPT-6。詳細なモデル ID・reasoning effort は確認手段がないため未記録）
- reviewer: gpt-5.6-sol / high
- 依頼: [review-brief.md](review-brief.md)
- 結果: [review-report.md](review-report.md)

元の TODO にある Claude 側の担当見込みは変更していない。
TODO-099 本体が完了した際に、この見直しと実装を区別して記録する。


## 実装の分担

- 文書: docs099_worker（worker、親から継承）。README.md と docs/User.md。
- スライド: slides099（implementer、gpt-5.6-terra / medium）。slides/user.js。
- main: 指摘の反映、測定、統合、完了記録。
- reviewer: 同じ担当を再利用し、文書とスライドの整合を確認する。
- verifier: gpt-5.6-luna / medium。手順とブラウザの再現。

3 ファイルの改稿と実測があるため実装も分担した。最初に文書を割り当てた
implementer は適用された指示で文書を編集できず、変更せずに終了した。
文書担当を worker に切り替えた。Claude の token・料金の集計は使わない。

レビューの指摘3件は、最小例から始める、LAN 内 IP の調べ方と URL を示す、
3枚目を短い案内に絞って文字サイズの下限を検証する、という形で反映した。
