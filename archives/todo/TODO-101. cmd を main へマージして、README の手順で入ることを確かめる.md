# TODO-101. `cmd` を `main` へマージして、README の手順で入ることを確かめる

|        | main                  | 担当     |
|--------|-----------------------|----------|
| 見込み | Sonnet 5 / effort low | verifier |
| 実施   | Opus 5 / effort high  | verifier |

| 担当     | モデル   | effort | output | cache_creation | 料金の割合 |
|----------|----------|--------|--------|----------------|-----------|
| main     | Opus 5   | high   | 8,611  | 21,986         | 76%       |
| verifier | Sonnet 5 | medium | 13,049 | 41,324         | 24%       |
| 合計     |          |        | 21,660 | 63,310         | 概算 $1.7 |

- verifier は定義のモデル（sonnet）・effort のまま。上書きしていない
- 1 回目の確認で失敗が出たあと、**担当を立て直さず同じ verifier に続けて
  頼んだ**。計測の組み直しが要らず、2 回目は 8 ツール呼び出しで済んだ

## きっかけ

`origin/main` は `pyproject.toml` を持たず、TODO-096 で `ytslide` コマンドに
まとめた変更は `cmd` にあって `main` に入っていなかった。TODO-099 で書き直した
`README.md` はインストール元に `main` を指しているので、**書いたとおりに
実行しても CLI は入らない**状態だった。

`README.md` を `@cmd` 付きにする案は、マージ後に嘘になるため採らなかった。

## やったこと

- `cmd`（79b239b）を `main` へ fast-forward マージし、push した
- **GitHub の既定ブランチが `main` ではなく `develop` だったことが分かった。**
  `uv tool install 'git+https://github.com/ytani01/yt_slide'` は ref を
  指定していないので既定ブランチを取る。`develop` は c498d9e のままで
  `pyproject.toml` を持たず、README どおりのコマンドは終了コード 2 で
  失敗していた（verifier が実測）
- 既定ブランチを `develop` から `main` へ変更した
  （`gh repo edit ytani01/yt_slide --default-branch main`）
- `develop` も `main` へ fast-forward して push した。
  HEAD・`main`・`develop` がすべて 79b239b で揃っている

## 決めたこと

- **既定ブランチを `main` にし、`develop` も `main` に揃える**（両方やる）。
  README に `@main` を明示する案は採らなかった。`[video]` 付きの書き方が
  複雑になり、`git clone` した人が古いコードを得る問題も残るため

## 確かめたこと

既定ブランチを直したあと、README どおりの文字列（ref 指定なし）で実測した。
利用者の既存の環境を壊さないよう、`UV_TOOL_DIR`・`UV_TOOL_BIN_DIR` を
一時ディレクトリへ向けて実行し、終わったら消した。
`~/.local/share/uv/tools/`・`~/.local/bin/ytslide` が変わっていないことも
確認済み。

- `uv tool install 'git+https://github.com/ytani01/yt_slide'` が成功し、
  `ytslide 0.7.2.dev14+g79b239b10` が入る（終了コード 0）
- `uv tool install 'git+https://github.com/ytani01/yt_slide[video]'` も
  成功し、`playwright`・`greenlet`・`pyee`・`typing-extensions` が入る
  （`playwright install chromium` は README でも別手順なので実行していない）
- `ytslide --version` と、README の表にある 6 つのサブコマンド
  （`init` / `index` / `measure` / `update` / `web` / `video`）の
  `--help` がすべて終了コード 0
- `git ls-remote` で HEAD・`main`・`develop` が同じコミットを指す

## 分担の振り返り

- **verifier が見つけたもの**: README どおりのコマンドが失敗すること、
  その原因が既定ブランチであること。これは項目を立てたときに見落としていた。
  `git ls-remote` で `origin/main` の中身は確かめていたが、
  **ref を指定しないインストールがどのブランチを取るかは確かめていなかった**
- **見込みとの食い違い**: 「マージして確かめるだけ」の項目として
  effort low を見込んだが、既定ブランチの問題が出て、利用者への確認と
  GitHub 側の変更、再確認が挟まった。料金は $1.7。
  担当（verifier だけ）は見込みどおりで、コードを変えていないので
  reviewer は要らなかった
- **次に同じ規模なら**: 公開した手順を確かめる項目では、
  **`git ls-remote --symref origin HEAD` で既定ブランチを先に見る**。
  「ローカルの main が正しいこと」と「他人が既定で取るものが正しいこと」は
  別で、後者を確かめないと README の検証にならない。
  再確認は担当を立て直さず同じ verifier に続けて頼むのがよく、
  2 回目は 1 回目の半分以下のツール呼び出しで済んだ
