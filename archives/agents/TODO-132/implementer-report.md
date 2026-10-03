# TODO-132 implementer の報告

## 変更点

新しいファイル:

- `vendor/tailwind.js` — `https://cdn.tailwindcss.com` は `/3.4.17` へ 302 する。`https://cdn.tailwindcss.com/3.4.17` をそのまま取ったもの（407,279 バイト）
- `vendor/fontawesome/css/all.min.css`（6.5.1。ライセンスのヘッダーはそのまま）、`vendor/fontawesome/webfonts/fa-{brands-400,regular-400,solid-900,v4compatibility}.woff2`
  - ttf は置いていない。CSS の `src` が woff2 → ttf の順なので、woff2 が読めれば ttf は取りに行かない（Playwright で ttf へのリクエストは出ず、`Font Awesome 6 Free 900: loaded` だった）
- `sw.js` — 同じオリジンの GET だけを network-first で扱う。200 のときだけ `cache.put`（206 は入れられないため）。外れたら `caches.match`。navigate のときだけ `ignoreSearch` で引き直す（スクリプトや画像で別の `?` のものを返さないように、ページに絞った）。`install` で `skipWaiting`、`activate` で `clients.claim`
- `manifest.webmanifest`（name/short_name は `yt_slide`、start_url `index.html`、standalone、背景色とテーマ色 `#020617`）
- `icon.svg`（ヘッダーのロゴに合わせて sky→lime のグラデーションに再生マーク）、`icon-512.png`（`rsvg-convert` で icon.svg から作った）
- `archives/agents/TODO-132/offline_check.py` — 下の Playwright での確認に使ったスクリプト（verifier が使い回せる）

変えたファイル:

- `player.html:14-34` — Tailwind を `vendor/tailwind.js` に。manifest・icon・apple-touch-icon の link。Service Worker の登録（http(s) のときだけ）
- `player.html:40-41` — Font Awesome を `vendor/fontawesome/css/all.min.css` に
- `player.html:1078-1080` — `voiceEngineMode === 'online' && navigator.onLine !== false` のときだけ Online TTS。それ以外は Web Speech の経路へ。選択と保存値は触らない
- `index.html:7-26`, `index.html:30` — player.html と同じ置き換え（`index.py` はマーカーの間しか書かないので、生成側に head は無い）
- `src/ytslide/paths.py:20-30` — `OFFLINE_FILES`・`VENDOR`・`is_player_file()`
- `src/ytslide/browser.py:55-65` — `PlayerHandler` は `player.html` に加え、`OFFLINE_FILES` と `vendor/` 以下も作業場所に無ければ同梱を返す。相対パスは `super().translate_path()` が正規化したものから `relpath` で出す（`..` を通さない）。`urllib.parse` の import を外した
- `src/ytslide/cli.py:100` — `_copy_data` を `read_bytes`/`write_bytes` に（woff2・png を写すため）
- `src/ytslide/cli.py:114-121` — `init` が `sw.js`・アイコン・`vendor/` 以下を写す
- `src/ytslide/cli.py:135-140` — `init` が manifest を写し、`yt_slide` を作業場所の名前に置き換える（index.html と同じ扱い）
- `pyproject.toml:32-36` — force-include に `sw.js`・`manifest.webmanifest`・`icon.svg`・`icon-512.png`・`vendor`（ディレクトリ）
- `tests/test_cli.py:38-44` — init が `sw.js`・`icon-512.png`・`vendor/tailwind.js`・`fa-solid-900.woff2` を同じ中身で写し、manifest の name が作業場所名になる
- `tests/test_cli.py:65-66` — force-include に `OFFLINE_FILES` と `vendor` があること
- `tests/test_browser.py:100-102` — 作業場所に無い `sw.js`・`vendor/fontawesome/css/all.min.css` を同梱から返す
- `docs/Developer.md` — 構成の表に `vendor/` と sw.js など、CDN の記述を直し、`## オフラインで開く`（70 行目〜。mermaid の flowchart 1つ）を足した
- `docs/UsersGuide.md` — `### 他のサーバーへ持っていくとき`（599 行目〜）に写すファイルの一覧と手順、オフラインの説明。ほかに同じファイル内で「CDN から読む」「オフラインでは崩れる」と書いていた 4か所を今の挙動に合わせた
- `TODO.md` — チェックボックス 4つに印

### 設計から足したこと（理由）

- **初回の読み込みをページ側でキャッシュに入れる。** 最初に開いたときの読み込みは Service Worker を通らないので、`sw.js` だけだと「一度開いただけ」ではオフラインで開けない（2回目の読み込みからになる）。まだ受け持たれていないページ（`!navigator.serviceWorker.controller`）だけ、`load` と `document.fonts.ready` の後に、ページ自身と `performance.getEntriesByType('resource')` の同じオリジンの URL を `caches.open('ytslide')` に `add` する。ファイルの一覧は持たない
- **`icon-512.png` を足した。** Android Chrome のインストール条件は 144px 以上のアイコンで、SVG（`sizes: any`）を条件として数えるかは確かめられなかった。iOS の apple-touch-icon も SVG を使えない。PNG 1枚で両方を満たす

## 検証

| コマンド | 結果 |
|---|---|
| `uv run pytest -q` | 41 passed、終了コード 0 |
| `uv run ruff check src tests` | All checks passed |
| `rg -n 'cdn.tailwindcss\|cdnjs' player.html index.html src/` | 0件（rg の終了コード 1） |
| `uv build --wheel` → `unzip -l` | `ytslide/data/` に vendor 以下 6ファイル・sw.js・manifest・icon 2つが入っている |
| `uv run --extra video ytslide check --slides readme` | 「問題なし」、終了コード 0（SW を登録しても check は変わらない） |

Playwright（`uv run ytslide web -p 8765` をリポジトリで起動し、`offline_check.py http://localhost:8765`）。オンラインで `player.html?slides=readme` と `index.html` を開いたあと `context.set_offline(True)`:

- SW が activate した後、キャッシュに入っていたもの: `/player.html?slides=readme`、`/slides/readme.js`、`/vendor/fontawesome/css/all.min.css`、`/vendor/fontawesome/webfonts/fa-solid-900.woff2`、`/vendor/tailwind.js`
- オフラインで開いた値:

| ページ | title | controlled | onLine | header の display / border-bottom-width | FA 900 | `fonts.check('900 16px "Font Awesome 6 Free"')` | アイコンの `::before` font-family | 読めないと出たか |
|---|---|---|---|---|---|---|---|---|
| `player.html?slides=readme` | 読めた（readme の題） | true | false | flex / 1px | loaded | true | "Font Awesome 6 Free" | 出ない |
| `player.html?slides=readme#3` | 同上 | true | false | flex / 1px | loaded | true | 同上 | 出ない |
| `index.html` | `yt_slide - スライド一覧` | true | false | （header 無し） | loaded | true | 同上 | 出ない |
| `player.html?slides=developer`（開いていない） | ページは開く（ignoreSearch） | true | false | flex / 1px | loaded | true | 同上 | 出る（`slides/developer.js` が無いので想定どおり） |

- 読み上げ: オンラインで再生ボタン → コンソールに何も出ない（Online TTS の経路）。オフラインで再生ボタン → 先に `SpeechSynthesis error, falling back to Online TTS` が出る（Web Speech の経路に入った）。ヘッドレスの Chromium には音声合成エンジンが無いので、そこから既存の扱いで Online TTS へ落ち、`ERR_INTERNET_DISCONNECTED` → 「音声エラー」の表示になった。`#voice-select` は `online` のまま、localStorage に書き込みは無かった
- `file://`（オフラインのコンテキスト）: header の display flex、FA 900 の check true、`controller` は無し、pageerror 0件

## 残る懸念・判断が要る点

- **オフラインで Web Speech が失敗すると、既存の扱いで Online TTS へ落ちて「音声エラー」になる。** 指示どおり既存の扱いを残した。オフラインなら落ちても無駄なので、そのときは Online へ落とさず安全タイマーだけで進める案もある（判断は main へ）。実機の日本語音声があれば起きない
- **Android Chrome でインストールできるかは実機で確かめていない。** manifest（name・start_url・display standalone・512px の PNG）と fetch ハンドラー付きの SW は揃えた。https であることが前提
- **`http://<LAN の IP>` では Service Worker が使えない**（安全なコンテキストでないため）。`'serviceWorker' in navigator` の判定で何もしないので壊れはしない。オフラインを試せるのは https か localhost だけ
- **キャッシュは消さない。** 一度開いたファイルは古いものが残り続ける（network-first なので、つながっていれば新しいものを返す）。容量の上限やキャッシュの名前を版で変える仕組みは入れていない
- **同じオリジンの別リポジトリ（`ytani01.github.io/yt_slide/` と `/slide_backgammon/`）はキャッシュ `ytslide` を共有する。** キーはフルの URL なので混ざらない。SW の scope もそれぞれのディレクトリ
- **範囲外で、今の挙動と合わなくなった記述**（触っていない）:
  - `README.md:48`・`README.md:114`「表示にも読み上げにもネット接続は要る」
  - `slides/readme.js:122`、`slides/developer.js:55,77,87,105`（CDN 頼み・ネット接続は必須）
  - `slides/users-guide.js` は UsersGuide.md の写しなら、写す手順の節の更新が要るかもしれない（中身は見ていない）
  - `docs/Developer.md:37` 付近の「テストは `tests/` の 4本」は実際は 6本（今回の変更とは無関係の古い記述）
- Tailwind の Play CDN の script はコンソールに「本番では使わないで」という警告を出す（CDN のときから同じ）

---

## 追加分（TODO.md の 2項目。利用者の判断を受けて）

### 変更点

- `player.html:1140-1155` — Web Speech の `utterance.onerror` で、`navigator.onLine === false` なら Online TTS へ落とさない。通知（`showAudioError`）は出さず、状態表示を「読み上げなし (オフライン)」にする。安全タイマー（`slideTransitionTimeout`）を消して、消音中と同じ `(slide.duration / playbackRate) * MS_PER_SECOND` 後に `onSlideAudioFinished()`。待ちのコールバックは `runId === speechRunId` のときだけ進める（`stopSpeech()` の後に古い待ちで進まないように）。オンラインのときの扱いは変えていない
- `README.md:48-50`・`README.md:116` — 「表示にも読み上げにもネット接続は要る」を、Online Voice だけがネットを要ること・一度開けばオフラインでも開けることに直した
- `slides/readme.js` スライド 4（すぐ試す）— ナレーションの「表示と読み上げにはネット接続が必要です。」→「ネット接続が要るのは、オンラインの読み上げだけです。」。duration 16 → 17
- `slides/developer.js` スライド 2（リポジトリの構成）— ナレーションの「CDN から Tailwind などを読み込みます」→「Tailwind などもリポジトリに入っています」、本文の「CDN 頼み」→「Tailwind・FontAwesome は vendor/ に同梱」。duration 21 → 20
- `slides/developer.js` スライド 3（場所を選ばない）— ナレーション・本文の 3か所を、同梱のファイルも相対パスであること、http(s) で一度開けばオフラインでも開けること、外部から取るのは Online Voice の音声と Google Fonts だけ、に直した。duration 16 → 17
- `slides/users-guide.js` — 変えていない。「CDN」「ネット接続」「公開」「写す」「Online Voice」のどれも出てこない（`rg` で 0件）。UsersGuide.md の全文の写しではなく、今回直した節に当たるスライドが無い
- `docs/Developer.md` — 「オフラインで開く」の読み上げの段落と、「再生失敗の通知」の Web Speech の項を、オフラインでの新しい扱いに合わせた
- `docs/UsersGuide.md:637-639` — オフラインで声が無ければ音を出さずに進む、を足した
- `TODO.md` — 追加の 2項目に印

### 検証

| コマンド | 結果 |
|---|---|
| `uv run pytest -q` | 41 passed、終了コード 0 |
| `uv run ruff check src tests` | All checks passed |
| `uv run ytslide measure --slides readme 4 --write`、`--slides developer 2 3 --write`（3 は文言を直した後にもう一度） | 終了コード 0。上の duration に書き戻した |
| `uv run ytslide index` | index.html は変わらない（head の差分だけ） |
| `uv run --extra video ytslide check --slides readme` / `developer` | どちらも「問題なし」 |

Playwright（`archives/agents/TODO-132/offline_speech_check.py`。`uv run ytslide web -p 8765` に対して、ヘッドレスの Chromium は Web Speech が必ず失敗する）:

| 条件 | readme 1枚目の duration | 再生から `#2` に進むまで | 再生 1秒後の状態表示 | 通知 | translate_tts へのリクエスト |
|---|---|---|---|---|---|
| オフライン、Online Voice のまま | 19 | 21.1 秒（19 + 待ち 2 秒） | 読み上げなし (オフライン) | 出ない | 0 |
| オンライン、Online Voice | 19 | 21.1 秒 | 朗読中 (Online Voice) | 出ない | 2 |

オンラインで `Web Speech (自動)` を選んで再生すると、`SpeechSynthesis error, falling back to Online TTS` が出て translate_tts へ 1件のリクエスト、状態は「朗読中 (Online Voice)」（今までどおり落ちる）。

文言を変えた 3枚（developer 2・3、readme 4）は 1280x900 で `#slide-canvas` の scrollHeight/clientHeight が 428/428、横にはみ出す要素 0。developer 3 はスクリーンショットでも、枠の中に収まって欠けていないことを見た。

### 残る懸念

- オフラインで Web Speech が `onstart` だけ出して `onend` も `onerror` も来ないときは、今までどおり安全タイマー（文字数から出した秒数）で進む。この経路は変えていない
- `navigator.onLine` は「つながっていない」とだけ正しく言える（true でも実際にはネットに届かないことがある）。そのときは今までどおり Online TTS へ落ちて「音声エラー」になる
