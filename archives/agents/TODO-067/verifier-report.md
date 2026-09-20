# TODO-067 verifier 報告

対象: `git diff` の `README.md` / `docs/User.md` / `docs/Developer.md`、
`tools/measure-duration.py`、`tools/make-video.py`。`apt install` は実行していない。

## 1. 環境の実測

すべて README「必要なもの」の記載と一致。

```
$ curl --version | head -1
curl 7.88.1 (aarch64-unknown-linux-gnu) libcurl/7.88.1 ...
$ ffmpeg -version | head -1
ffmpeg version 5.1.9-0+deb12u1+rpt1 ...
$ ffprobe -version | head -1
ffprobe version 5.1.9-0+deb12u1+rpt1 ...
$ dpkg -S /usr/bin/curl
curl: /usr/bin/curl
$ dpkg -S /usr/bin/ffmpeg
ffmpeg: /usr/bin/ffmpeg
$ dpkg -S /usr/bin/ffprobe
ffmpeg: /usr/bin/ffprobe
$ python3 --version
Python 3.14.7
$ python3 -m playwright --version
Version 1.63.0
$ ls ~/.cache/ms-playwright
chromium-1234  chromium-1243  chromium_headless_shell-1234  chromium_headless_shell-1243  ffmpeg-1011  .links
$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
```

- `ffprobe` は `ffmpeg` パッケージから来ている（`dpkg -S` で確認）。README の
  「`sudo apt install curl ffmpeg` で curl・ffmpeg・ffprobe が揃う」という記載と一致。
- chromium は `~/.cache/ms-playwright` に実在。
- OS は Debian 12 (bookworm)（README は「Raspberry Pi OS bookworm」と書いており、
  `/etc/os-release` の `PRETTY_NAME` は `Debian GNU/Linux 12 (bookworm)` — Raspberry Pi OS
  は Debian ベースで bookworm 系のため矛盾ではないが、`ID=debian` であって
  `raspbian` 等の表記は無い。実害は未確認、判断は任せる）。

## 2. ツールと前提の対応（grep で実装と突き合わせ）

`tools/measure-duration.py`:
```
subprocess.run(['curl', '-sS', '-f', '-o', tmp, url], check=True)
subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', ...])
```
→ 呼ぶ外部コマンドは `curl`・`ffprobe` のみ。README の記載と一致。

`tools/make-video.py`:
```
from playwright.sync_api import sync_playwright
subprocess.run(['curl', ...])
subprocess.run(['ffmpeg', ...])   # 複数箇所
subprocess.run(['ffprobe', ...])
```
さらに `measure-duration.py` を `importlib` で読み込んで使っている（`curl`・`ffprobe` は
そちら経由でも呼ばれる）。README は「`tools/make-video.py` — 加えて `ffmpeg`・
Playwright（Python, chromium）」と書いており、`curl`・`ffprobe` は
`measure-duration.py` の節で既出のため省いた形。実装が呼ぶ外部コマンド・import
（curl, ffmpeg, ffprobe, playwright）と README の記載に過不足なし。

## 3. リンク

- `docs/User.md:93` と `docs/User.md:175` の `[README の「必要なもの」](../README.md#必要なもの)`、
  `docs/Developer.md:19` の同リンク — いずれも `../README.md` は `docs/` から見て
  リポジトリルートの `README.md` に実際に解決する（`test -f` で確認）。
- `README.md:31` に `## 必要なもの` の見出しが実在し、アンカーの文字列と一致。

## 4. 置き換え漏れの grep

```
$ grep -rn -E 'ffmpeg|ffprobe|curl|[Pp]laywright|chromium' README.md docs/ | grep -v archives
README.md:38:sudo apt install curl ffmpeg   # curl・ffmpeg・ffprobe
README.md:39:pip install playwright         # make-video.py だけが使う
README.md:40:playwright install chromium
README.md:43:- `tools/measure-duration.py` — `curl`・`ffprobe`
README.md:44:- `tools/make-video.py` — 加えて `ffmpeg`・Playwright（Python, chromium）
README.md:46:Debian 12（Raspberry Pi OS bookworm）/ curl 7.88.1 / ffmpeg 5.1.9 / Python 3.14.7 /
README.md:47:playwright 1.63.0 で確認した。他の OS では入れ方を読み替える。
docs/Developer.md:83:実測秒数**を入れる。`slides/claude-memo.js` の 17 枚は `ffprobe` で測定し、
docs/User.md:169:- 各スライドの PNG（1920×1080）と読み上げの mp3 を作り、`ffmpeg` で連結する
```

README 側はすべて「必要なもの」節の中（31〜47 行目）。
`docs/` 側に残っている 2 件はインストール手順ではなく、動作の説明文の中の
言及（「`ffprobe` で測定し」「`ffmpeg` で連結する」）。前提パッケージの列挙・
インストール手順としての重複ではない。問題かどうかの判断はせず、箇所と文だけ
報告する。

## 結論

- 検証コマンドはすべて成功（終了コード 0 相当。エラー終了したものなし）
- README の「必要なもの」の記載（コマンド・版・パッケージの対応）は、この環境の
  実測および `tools/` 2 本の実装と過不足なく一致
- 変更ファイルは `git diff --stat` の 3 件（README.md, docs/User.md, docs/Developer.md）
  のみで、指示の範囲と一致。コードは変更していない

## 判断が要る点 / 確かめられなかったこと

- README は OS を「Raspberry Pi OS bookworm」としているが、この環境の
  `/etc/os-release` は `ID=debian` の素の Debian 12 (bookworm) だった。
  Raspberry Pi OS は Debian ベースなので矛盾ではなさそうだが、断定はできない
  （判断は管理者へ）
- `docs/User.md:169`・`docs/Developer.md:83` に残る `ffmpeg`・`ffprobe` への言及が
  「必要なもの」への集約から漏れているのか、説明文として残すのが適切なのかは
  判断していない
