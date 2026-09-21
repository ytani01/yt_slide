#!/usr/bin/env python3
"""ナレーションの読み上げ秒数を測り、`duration` に入れる値を出す。

`slideData` の `duration` には「Online TTS の音声を `BASE_SPEED_MULTIPLIER`
倍で再生した実測秒数」が入っている（TODO-018）。ナレーションや読みの置換表を
変えると長さが変わるので、当たるスライドを測り直す必要がある。

    tools/measure-duration.py 2 17          # スライド 2 と 17 を測る
    tools/measure-duration.py --all         # すべて
    tools/measure-duration.py --all --write # すべて測って duration を書き戻す
    tools/measure-duration.py --slides user --all --write
    tools/measure-duration.py --text 'ここに下書き'
    tools/measure-duration.py --all --write -n 3   # 3 回測って中央値を採る

`--text` は、差し替える前に案の長さを見るためのもの。スライド一式ごとに置換表が
違うので、測りたいスライド一式と `--slides` を揃えないと違う秒数が出る（既定は
`readme`）。
`-n` は 1 枚を何回測るかで、**中央値**を採る（既定 1）。Online TTS の秒数は
毎回同じとは限らないので、揺れが気になるときに増やす。増やした分だけ Google TTS
へのリクエストも増える。
`--write` は測った値を `duration` に書き込む（変わった枚だけ `17 -> 16` と
出す。付けなければ書き換えずに秒数だけ出す）。`--slides` はどのスライド一式を読むかで、
既定は `DEFAULT_SLIDES`（下で定める）のスライド一式。

読みの置換表は `player.html` の `SPEECH_RULES`（共通）と `slides/<スライド一式名>.js` の
`slidesConfig.rules`（スライド一式だけの語）から読む。`prepareSpeechText()` と同じく
スライド一式側を先、共通を後に当てる。表そのものはここには持たない。

`curl` と `ffprobe` が要る。
"""
import argparse
import itertools
import os
import pathlib
import re
import statistics
import subprocess
import tempfile
import urllib.parse

# リポジトリの外に自分のスライドを置く場合の探し方（TODO-095）。
# 優先順: --root > カレントディレクトリに slides/ があればそこ > リポジトリ。
REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_SLIDES = 'readme'


def find_root(root_arg):
    """`--root` の指定と探し方の優先順に沿ってスライドの置き場所を返す。"""
    if root_arg:
        return pathlib.Path(root_arg).resolve()
    cwd = pathlib.Path.cwd()
    if (cwd / 'slides').is_dir():
        return cwd
    return REPO_ROOT


def set_root(root_arg):
    """ROOT/SLIDES/PLAYER_HTML を決めて module 変数に入れる。

    `player.html` は ROOT 側にコピーがあればそれを使い（実際の再生と
    ずれないよう）、無ければリポジトリのものへ落とす。
    """
    global ROOT, SLIDES, PLAYER_HTML
    ROOT = find_root(root_arg)
    SLIDES = ROOT / 'slides'
    own_player = ROOT / 'player.html'
    PLAYER_HTML = own_player if own_player.exists() else REPO_ROOT / 'player.html'


ROOT = SLIDES = PLAYER_HTML = None
set_root(None)  # 既定（--root を渡さず呼ばれたときと同じ後方互換の場所）

# player.html の写し ---------------------------------------------------
TTS_MAX_CHARS = 180
BASE_SPEED_MULTIPLIER = 1.4
# --------------------------------------------------------------------------

# JS の `[/pattern/flags, 'replacement'],` を 1 つずつ拾う。
# 置換文の `'(?:\\.|[^'\\])*'` は、`\'` を含む文字列も 1 つの引用符として読む。
JS_RULE_RE = re.compile(r"\[/(.+?)/([gi]*), '((?:\\.|[^'\\])*)'\]")


def load_rules(text):
    """JS の `[/pattern/flags, 'replacement']` の並びを RULES 形式に変える。

    パターンの `\\/` は `/`、置換文の `$1` は `\\1`、フラグの `i` は re.I。
    `// ...` で始まる行（コメントアウト）は読み飛ばす。
    """
    text = '\n'.join(
        line for line in text.split('\n') if not line.strip().startswith('//'))
    rules = []
    for pattern, flags, replacement in JS_RULE_RE.findall(text):
        pattern = pattern.replace(r'\/', '/')
        replacement = replacement.replace(r"\'", "'")
        replacement = re.sub(r'\$(\d+)', r'\\\1', replacement)
        rules.append((pattern, replacement, re.I if 'i' in flags else 0))
    return rules


def slides_rules_from_text(text):
    """slidesConfig の本文から rules: の中身を読む（無ければ空）。"""
    m = re.search(r'rules:\s*\[(.*?)\n\s*\],', text, re.S)
    return load_rules(m.group(1)) if m else []


def load_slides_rules(slides):
    """`slides/<slides>.js` の slidesConfig.rules を読む（無ければ空）。"""
    return slides_rules_from_text((SLIDES / f'{slides}.js').read_text(encoding='utf-8'))


def load_common_rules():
    """`player.html` の `const SPEECH_RULES = [ … ];` を読む。"""
    text = PLAYER_HTML.read_text(encoding='utf-8')
    m = re.search(r'const SPEECH_RULES = \[(.*?)\n\s*\];', text, re.S)
    if not m:
        raise SystemExit(f'{PLAYER_HTML} に SPEECH_RULES が見つからない')
    return load_rules(m.group(1))


def prepare(text, slides=DEFAULT_SLIDES):
    """prepareSpeechText() と同じ置換を掛ける（スライド一式側を先、共通を後）。"""
    # re.A が要る。付けないと Python の \b は日本語を語の一部と見なすので、
    # 「slidesフォルダ」のように和文が続く語で JS と結果が食い違う。
    for pattern, replacement, flags in load_slides_rules(slides) + load_common_rules():
        text = re.sub(pattern, replacement, text, flags=flags | re.A)
    return text


def tts_url(text):
    """Google Translate TTS の URL を組み立てる（TTS_MAX_CHARS で切る）。"""
    return ('https://translate.google.com/translate_tts?ie=UTF-8&tl=ja'
            '&client=tw-ob&q=' + urllib.parse.quote(text[:TTS_MAX_CHARS], safe=''))


def fetch_duration(url):
    """読み上げ音声を取ってきて、その長さを秒で返す。"""
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
        tmp = f.name
    try:
        subprocess.run(['curl', '-sS', '-f', '-o', tmp, url], check=True)
        out = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', tmp],
            check=True, capture_output=True, text=True).stdout.strip()
    finally:
        os.unlink(tmp)
    return float(out)


def measure(text, slides=DEFAULT_SLIDES, repeat=1):
    """repeat 回測り、実測秒数の中央値と BASE_SPEED_MULTIPLIER 倍での秒数を返す。

    Online TTS の秒数は毎回同じとは限らないので、中央値を採る（TODO-065）。
    """
    spoken = prepare(text, slides)
    url = tts_url(spoken)
    raw = statistics.median(fetch_duration(url) for _ in range(repeat))
    return spoken, raw, raw / BASE_SPEED_MULTIPLIER


# duration の直後に narration が来る並びを当てにしている（slideData の書き方）。
DURATION_RE = re.compile(r"(duration: )(\d+)(,\n *narration: ')")


def narrations(text):
    """スライド一式の本文から narration を並び順に取り出す。"""
    return re.findall(r"narration: '(.*?)',\n", text)


def apply_durations(text, updates):
    """{スライド番号: 秒数} を当てた本文と、変わった分 [(番号, 旧, 新)] を返す。"""
    changed = []
    counter = itertools.count(1)

    def replace(m):
        number = next(counter)
        old = int(m.group(2))
        new = updates.get(number, old)
        if new != old:
            changed.append((number, old, new))
        return f'{m.group(1)}{new}{m.group(3)}'

    written = DURATION_RE.sub(replace, text)
    return written, changed, next(counter) - 1


def write_durations(src, updates):
    """{スライド番号: 秒数} を書き込み、変わった分を [(番号, 旧, 新)] で返す。"""
    text = src.read_text(encoding='utf-8')
    written, changed, found = apply_durations(text, updates)
    if found != len(narrations(text)):
        raise SystemExit(f'{src} の duration が {found} 個しか見つからない。'
                         'slideData の書き方が変わっていないか確かめること')
    if changed:
        src.write_text(written, encoding='utf-8')
    return changed


def main():
    parser = argparse.ArgumentParser(
        description='ナレーションの読み上げ秒数を測る')
    parser.add_argument('slides', nargs='*', type=int, help='スライド番号')
    parser.add_argument('--text', help='下書きの文字列を直接測る')
    parser.add_argument('--all', action='store_true', help='すべてのスライド')
    parser.add_argument('--write', action='store_true',
                        help='測った値をスライド一式の duration に書き戻す')
    # dest を slides_name にする。位置引数の 'slides'（スライド番号のリスト）と
    # dest が衝突するため（TODO-058）。
    parser.add_argument('--slides', dest='slides_name', default=DEFAULT_SLIDES,
                        help=f'slides/<名前>.js の <名前>（既定は {DEFAULT_SLIDES}）')
    parser.add_argument('-n', '--repeat', type=int, default=1,
                        help='1 枚を測る回数。中央値を採る（既定 1）')
    parser.add_argument('--root', help='スライドの置き場所（既定はカレントディレクトリの'
                        ' slides/、無ければリポジトリ）')
    args = parser.parse_args()

    set_root(args.root)

    if args.repeat < 1:
        parser.error('-n は 1 以上')

    src = SLIDES / f'{args.slides_name}.js'
    if (args.slides or args.all) and not src.exists():
        parser.error(f'{src} が無い')

    jobs = []
    if args.text:
        jobs.append((None, '下書き', args.text))
    if args.slides or args.all:
        found = narrations(src.read_text(encoding='utf-8'))
        ids = range(1, len(found) + 1) if args.all else args.slides
        for i in ids:
            jobs.append((i, f'スライド {i}', found[i - 1]))
    if not jobs:
        parser.error('スライド番号か --text か --all を渡す')
    if args.write and not (args.slides or args.all):
        parser.error('--write はスライド番号か --all と一緒に渡す')

    updates = {}
    for number, label, text in jobs:
        spoken, raw, scaled = measure(text, args.slides_name, args.repeat)
        cut = (f' ★TTS_MAX_CHARS={TTS_MAX_CHARS} 字で切れる'
               if len(spoken) > TTS_MAX_CHARS else '')
        times = f'{args.repeat} 回の中央値 ' if args.repeat > 1 else ''
        print(f'{label}: 原文 {len(text)} 字 / 読み {len(spoken)} 字{cut}'
              f' / 実測 {times}{raw:.3f}s'
              f' / BASE_SPEED_MULTIPLIER={BASE_SPEED_MULTIPLIER} 倍速'
              f' {scaled:.2f}s -> duration: {round(scaled)}')
        if number is not None:
            updates[number] = round(scaled)

    if args.write:
        changed = write_durations(src, updates)
        for number, old, new in changed:
            print(f'スライド {number}: duration {old} -> {new}')
        print(f'{src.name}: {len(changed)} 枚を書き換えた'
              if changed else f'{src.name}: 変更なし')


if __name__ == '__main__':
    main()
