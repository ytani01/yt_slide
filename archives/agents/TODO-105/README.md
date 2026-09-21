# TODO-105 の担当

main が README・ガイドと必要なスライドを修正する。説明と実装の照合を
reviewer、掲載手順の再現を verifier に分け、reviewer の確認後に verifier を起動する。
文書が中心だが、保存して再生できる手順を扱うため、独立した確認が必要。

## reviewer への依頼

- `git diff -- README.md docs/User.md slides/readme.js slides/user.js` を対象に、
  TODO-105 のやることと実装を照合する。検索は
  `rg -n 'インストール|init|AI|公開|コピー|音|最小の例' README.md docs/User.md slides/{readme,user}.js`。
- README は入口、詳細は User.md、公開は必要ファイルと URL の短い案内という方針を保つ。
- 資料の入手、CLI が必要な範囲、完全な例、AI への依頼と保存先、音声案内を確認する。
- コード・文書は編集せず、境界線上の判断は報告だけ。報告は reviewer-report.md に残す。
  一致事項は簡潔に、問題点だけ根拠とともに書く。返事は完了状況・報告先・判断事項の 5 行以内。

## verifier への依頼

- reviewer の指摘反映後、空の一時ディレクトリで User.md の準備手順と最小例の保存を再現する。
  ブラウザは Playwright、画面は 1280×720 と 390×844。
- `player.html?slides=sample` を file URL で開き、本文と Online Voice の音声再生を確認する。
  ネット接続等で確認できない場合は事実と制約を記録し、成功扱いにしない。
- 変更した readme/user のスライドをブラウザで開き、文字の欠けと送り操作を確認する。
  無変更のスライドのレイアウト測定は不要。
- 文書の相対リンク・見出しリンク、公開ファイルと URL の整合性も確認する。
- コード・文書は編集せず、境界線上の判断は報告だけ。再現スクリプトと測定値はこのディレクトリに残す。
  報告先は verifier-report.md。返事は完了状況・報告先・判断事項の 5 行以内。
