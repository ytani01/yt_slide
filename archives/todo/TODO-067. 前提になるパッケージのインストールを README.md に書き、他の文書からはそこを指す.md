# TODO-067. 前提になるパッケージのインストールを `README.md` に書き、他の文書からはそこを指す

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5 / effort high | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 12,381 | 69,227 | 91% |
| verifier | Sonnet 5 | medium | 4,515 | 29,993 | 9% |
| 合計 |  |  | 16,896 | 99,220 | 概算 $1.8 |

- verifier は定義（`~/.claude/agents/verifier.md`）のまま。上書きしていない
- 立ててから着手まで TODO-066・TODO-060・TODO-068 を挟んだので、集計は
  `--since '2026-09-20 07:51:37'`（TODO-068 の決着コミット）で切った

## きっかけ

スライドを**見るだけならブラウザ 1 つで足りる**が、`tools/` のスクリプトには
前提が要る。`measure-duration.py` は `curl` と `ffprobe`、`make-video.py` は
さらに `ffmpeg` と Python の `playwright`・chromium。**入れ方はどこにも
書いていなかった。**

道具を使うのは開発者だけではない。`docs/User.md` はスライドを作る人に
両方のスクリプトを使わせている。

## やったこと

**入れ方の本体は `README.md` の「必要なもの」節に置いた。** 両方の読者の入口で、
`tools/` の表もすでにここにある。「すぐ試す」と「自分のスライドを作る」の間。

- **`apt` と `pip` のコマンドまで書いた。** そのまま貼れる形にし、
  他の OS では読み替える前提だと添えた
- **確認した環境を 1 行で書いた。** `Debian 12 (bookworm) / curl 7.88.1 /
  ffmpeg 5.1.9 / Python 3.14.7 / playwright 1.63.0`。個々のパッケージには
  版を付けない（古びる箇所を増やさない）
- **「見るだけならブラウザだけ」を先頭に書いた。** それがこのプロジェクトの
  作りなので、書かないと誤解される
- **どのスクリプトに何が要るかを 2 行で併記した。** `make-video.py` しか
  使わない人に `ffmpeg` と Playwright を入れさせる理由が分かる
- `docs/User.md` の 2 箇所と `docs/Developer.md` の 1 箇所を、
  `../README.md#必要なもの` へのリンクに置き換えた

## 確かめたこと

verifier に照合させた（[archives/agents/TODO-067/](../agents/TODO-067/)）。
`apt install` は実行させず、`command -v`・`--version`・`dpkg -S` で確かめた。

- `curl` 7.88.1・`ffmpeg`/`ffprobe` 5.1.9・Python 3.14.7・playwright 1.63.0・
  chromium が実在し、README の記載と一致
- `ffprobe` は `ffmpeg` パッケージから来ている（`sudo apt install curl ffmpeg`
  の 1 行で 3 つ揃う）
- 2 本のスクリプトが実際に呼ぶ外部コマンドと import が、README のツール別の
  記載と一致
- `../README.md#必要なもの` のリンク先が実在

verifier の指摘 2 点は main が判断した。

- **OS 表記。** 実機の `/etc/os-release` は素の Debian 12 なので、書いていた
  「Raspberry Pi OS bookworm」を落として `Debian 12 (bookworm)` に直した
  （`ffmpeg 5.1.9-0+deb12u1+rpt1` の `rpt1` は Raspberry Pi のリポジトリ由来だが、
  OS 名として書くのは別の話）
- **`docs/User.md`・`docs/Developer.md` に残る `ffmpeg`/`ffprobe` の言及。**
  「PNG と mp3 を `ffmpeg` で連結する」「17 枚は `ffprobe` で測定した」という
  仕組みの説明で、前提パッケージの列挙ではない。集約の対象外として残した

## 分担の振り返り

- **verifier は版の食い違いを 1 つ見つけた**（OS 表記）。README を書いた main は
  `ffmpeg` のバージョン文字列の `rpt1` を見て Raspberry Pi OS だと思い込んでおり、
  `/etc/os-release` を読み直していない。**自分が根拠にした出力を、別の担当が
  別のコマンドで取り直す**のが効いた形
- **見込み（verifier のみ）と食い違わなかった。** 分岐も挙動も変わらないので
  reviewer は入れていない。文書だけの項目だが「書いたとおりに試せる」ので
  main の自己確認では済ませなかった（TODO-017）
- **次に同じ規模なら同じ組み方でよい。** 料金は verifier が 9%。ただし
  依頼文で「`player.html` の中身・スライドの再生確認・見た目の測定は見なくてよい」と
  名指しで外したのが効いている。外さなければ確認の範囲が広がっていた
