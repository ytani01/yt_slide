# 文書の実装

利用者が TODO-099 本体の実施を承認した。担当ファイルは README.md と
docs/User.md のみ。TODO.md の TODO-099 に従い、スライド作成者が最初の
1 枚を作って再生し、編集を繰り返し、任意で一覧更新・測定・共有へ進める
内容に改稿する。文書は main の代わりに実装担当が執筆する。

他の担当も作業中。slides/user.js、TODO.md、コードは変更しない。
他の変更を戻さず、対象外の既存説明は保つ。対象文書は全文読んで整合を取る。
README は最短の導線とインストール正本、User.md は詳しい手順。
具体例は sample、作業場所は ~/my-slides とする。
レビュー反映: 最初は最小例を sample.js に保存して自分用に直し、1枚を再生する。
19枚の template.js の削除作業を初回に強制せず、型のコピーはその後の任意手順。
別端末はOSのネットワーク設定でLAN内IPを確認して http://<IP>:8000/ を開く。
web は作業ディレクトリ全体を配信することを添える。
CLI 実装を根拠にし、機能は追加しない。docs に TODO 番号を書かない。

uv の導入は公式案内 https://docs.astral.sh/uv/getting-started/installation/
へのリンクでよい。Python >=3.13 の条件は pyproject.toml にある。
インストール手順の Git URL が既定ブランチを指すことに留意し、ローカル版の
検証結果を公開済み版の検証と取り違えない。検証担当はローカル版を隔離して使う。

最低限の確認: Markdown の参照先、記載コマンドと CLI の一致、sample の
コード例の JS 構文、git diff --check。通信・全手順実測は後の verifier が行う。
完了後 archives/agents/TODO-099/docs-report.md に変更点と検証結果を残し、
5 行以内で完了状況・報告先・残る判断だけ返す。コミットは main が行う。

