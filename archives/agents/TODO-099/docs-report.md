# 文書実装の報告

- 担当: docs099_worker。モデルは親から継承（詳細 ID と reasoning effort は未確認）。
- 対象: README.md、docs/User.md。

## 変更

- README をインストール → 自分の作業場所 → 最小例 1 枚 → 再生の流れにした。
  uv 導入の公式リンクと Python >=3.13 を補い、CLI 表には使う場面を記載した。
- User.md の冒頭へ詳しい作成手順を置き、操作ガイドは後半へ移動した。
  最小例を保存して本文とナレーションを直す操作、URL の付け方、保存と
  再読み込みを明記。型のコピーは初回再生後の任意操作にした。
- 一覧、測定、HTTP、共有を目的別の任意手順にし、summary/icon が掲載条件でないこと、
  update が全枚の測定と duration 書き戻し後に一覧を生成することを明示した。
- コマンド例を sample に揃え、公開先の URL と localhost/file の違い、同一 LAN の
  IP 確認、web のディレクトリ全体配信を記載。末尾の外部ディレクトリ手順は冒頭へ統合した。

## 確認

- src/ytslide/cli.py と index.py で init、index、measure、update、web の引数と動作、
  summary/icon 省略時の警告と既定値を確認した。
- pyproject.toml の Python 条件と CLI エントリーポイントを確認した。
- Python で対象 2 文書のローカル Markdown リンクのファイルとアンカーを照合し、全件一致。
- 文書から const slideData を含む完全な JS 例を抽出し node --check にすべて成功。
- git diff --check に成功。

## 残る確認

インストール・HTTP・TTS の通信、ブラウザの再現は verifier 担当。
管理者が git ls-remote とリモート内容を確認し、既定 HEAD/main c498d9e には
pyproject.toml が無く、cmd 2f896e9 に CLI があると報告した。これに基づき
README のインストール元を PEP 508 の `ytslide @ git+…@cmd` と
`ytslide[video] @ git+…@cmd` に修正し、cmd を指定する理由を添えた。
隔離環境でのインストール再現は管理者が実施する。
