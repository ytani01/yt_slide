# TODO-065 verifier-report

対象: `tools/measure-duration.py` に `-n`（`--repeat`）を足し、n 回測って中央値を採る変更。

## 1. `python3 tools/test_measure_duration.py`

```
$ python3 tools/test_measure_duration.py
OK
exit=0
```

OK。

## 2. `--text 'テストです' -n 3`

```
$ python3 tools/measure-duration.py --text 'テストです' -n 3
下書き: 原文 5 字 / 読み 5 字 / 実測 3 回の中央値 1.152s / BASE_SPEED_MULTIPLIER=1.4 倍速 0.82s -> duration: 1
exit=0
```

`3 回の中央値` が出ている。OK。

## 3. `--text 'テストです'`（`-n` 省略）

```
$ python3 tools/measure-duration.py --text 'テストです'
下書き: 原文 5 字 / 読み 5 字 / 実測 1.152s / BASE_SPEED_MULTIPLIER=1.4 倍速 0.82s -> duration: 1
exit=0
```

`回の中央値` は出ていない。従来と同じ表示。OK。

## 4. `--slides readme 1 -n 2`

```
$ python3 tools/measure-duration.py --slides readme 1 -n 2
スライド 1: 原文 86 字 / 読み 92 字 / 実測 2 回の中央値 16.224s / BASE_SPEED_MULTIPLIER=1.4 倍速 11.59s -> duration: 12
exit=0
```

スライド番号と `-n` が一緒に効いている。OK。

## 5. `--all --write`（`slides/claude-memo.js` で確認）

事前に `git status --short slides/claude-memo.js` が空であることを確認済み。

```
$ python3 tools/measure-duration.py --slides claude-memo --all --write
スライド 1: 原文 65 字 / 読み 64 字 / 実測 13.584s / BASE_SPEED_MULTIPLIER=1.4 倍速 9.70s -> duration: 10
スライド 2: 原文 120 字 / 読み 131 字 / 実測 28.896s / BASE_SPEED_MULTIPLIER=1.4 倍速 20.64s -> duration: 21
スライド 3: 原文 148 字 / 読み 145 字 / 実測 26.256s / BASE_SPEED_MULTIPLIER=1.4 倍速 18.75s -> duration: 19
スライド 4: 原文 154 字 / 読み 174 字 / 実測 32.136s / BASE_SPEED_MULTIPLIER=1.4 倍速 22.95s -> duration: 23
スライド 5: 原文 130 字 / 読み 148 字 / 実測 25.800s / BASE_SPEED_MULTIPLIER=1.4 倍速 18.43s -> duration: 18
スライド 6: 原文 176 字 / 読み 171 字 / 実測 32.496s / BASE_SPEED_MULTIPLIER=1.4 倍速 23.21s -> duration: 23
スライド 7: 原文 161 字 / 読み 170 字 / 実測 35.616s / BASE_SPEED_MULTIPLIER=1.4 倍速 25.44s -> duration: 25
スライド 8: 原文 132 字 / 読み 129 字 / 実測 25.968s / BASE_SPEED_MULTIPLIER=1.4 倍速 18.55s -> duration: 19
スライド 9: 原文 139 字 / 読み 144 字 / 実測 27.168s / BASE_SPEED_MULTIPLIER=1.4 倍速 19.41s -> duration: 19
スライド 10: 原文 150 字 / 読み 150 字 / 実測 28.992s / BASE_SPEED_MULTIPLIER=1.4 倍速 20.71s -> duration: 21
スライド 11: 原文 143 字 / 読み 137 字 / 実測 26.016s / BASE_SPEED_MULTIPLIER=1.4 倍速 18.58s -> duration: 19
スライド 12: 原文 114 字 / 読み 121 字 / 実測 20.784s / BASE_SPEED_MULTIPLIER=1.4 倍速 14.85s -> duration: 15
スライド 13: 原文 127 字 / 読み 129 字 / 実測 24.288s / BASE_SPEED_MULTIPLIER=1.4 倍速 17.35s -> duration: 17
スライド 14: 原文 112 字 / 読み 112 字 / 実測 23.760s / BASE_SPEED_MULTIPLIER=1.4 倍速 16.97s -> duration: 17
スライド 15: 原文 121 字 / 読み 119 字 / 実測 23.064s / BASE_SPEED_MULTIPLIER=1.4 倍速 16.47s -> duration: 16
スライド 16: 原文 130 字 / 読み 127 字 / 実測 24.504s / BASE_SPEED_MULTIPLIER=1.4 倍速 17.50s -> duration: 18
スライド 17: 原文 160 字 / 読み 172 字 / 実測 33.048s / BASE_SPEED_MULTIPLIER=1.4 倍速 23.61s -> duration: 24
claude-memo.js: 変更なし
exit=0

$ git diff --stat slides/claude-memo.js
（出力なし = 変更なし）
```

すべてのスライドで既存の `duration` と一致し、書き換えは発生しなかった
（`変更なし`）ため `git checkout` は不要だった。実行後に
`git status --short slides/claude-memo.js` で未変更を再確認済み。OK。

## 6. `-n 0` / `-n -1`

```
$ python3 tools/measure-duration.py --text 'x' -n 0
usage: measure-duration.py [-h] [--text TEXT] [--all] [--write]
                           [--slides SLIDES_NAME] [-n REPEAT]
                           [slides ...]
measure-duration.py: error: -n は 1 以上
exit=2

$ python3 tools/measure-duration.py --text 'x' -n -1
usage: measure-duration.py [-h] [--text TEXT] [--all] [--write]
                           [--slides SLIDES_NAME] [-n REPEAT]
                           [slides ...]
measure-duration.py: error: -n は 1 以上
exit=2
```

両方とも終了ステータス 2（非 0）で止まる。OK。

## 7. `docs/User.md` の `-n` の説明

追加された記述:

```
`-n <回数>` を付けると、その回数だけ測って**中央値**を採る（既定は 1）。
Online TTS の秒数は毎回同じとは限らないので、揺れが気になるときに使う。
```

実際の挙動（中央値、既定 1、`repeat` 回だけ `fetch_duration` を呼ぶ）と食い違いは無い。OK。

## まとめ

7 項目すべて確認し、食い違いは見つからなかった。判断が要る点は無し。
