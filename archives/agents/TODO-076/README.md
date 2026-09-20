# TODO-076 の分担

main が `player.html` と `docs/User.md` を変更する。
イベント処理とキーボード操作の挙動が変わるため、reviewer が差分を確認し、
修正が済んだあとに verifier が Playwright で実測する。
音声エンジン内部やスライド内容の再評価は対象外。

- reviewer: ガイド内の操作が再生へ漏れないか、説明が既存操作と一致するか、フォーカスと名前を確認する。
- verifier: 1280×800 とタッチ設定の 390×844 で開閉、Tab、フォーカス復帰、キー・タッチ操作と画面内の収まりを確認する。境界線上の判断は報告だけにする。

報告: [reviewer](reviewer-report.md)、[verifier](verifier-report.md)。
完了記録: [TODO-076](../../todo/TODO-076.%20プレイヤーに操作ガイドを付ける.md)。

## 検証担当の交代

初回 verifier のスクリプトに、Space でモーダルを閉じた後もモーダル中として
キーを試す、ボタンのフォーカスを残したまま通常ショートカットを試す、
マウスのドラッグをスワイプとして扱う問題があった。main が手順を確認して
担当を停止し、reviewer にスクリプト修正と実測を引き継いだ。初回結果は採用しない。手順上の問題は [initial-verifier-report.md](initial-verifier-report.md) に記録した。
