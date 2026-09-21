"""ナレーションの読み上げ秒数を測り、`duration` に入れる値を出す。

`slideData` の `duration` には「Online TTS の音声を `BASE_SPEED_MULTIPLIER`
倍で再生した実測秒数」が入っている（TODO-018）。ナレーションや読みの置換表を
変えると長さが変わるので、当たるスライドを測り直す必要がある。

読みの置換表は `player.html` の `SPEECH_RULES`（共通）と `slides/<スライド一式名>.js` の
`slidesConfig.rules`（スライド一式だけの語）から読む。`prepareSpeechText()` と同じく
スライド一式側を先、共通を後に当てる。表そのものはここには持たない。

`curl` と `ffprobe` が要る。
"""
import itertools
import os
import re
import statistics
import subprocess
import tempfile
import urllib.parse

import click

from . import paths

TTS_MAX_CHARS = 180
BASE_SPEED_MULTIPLIER = 1.4

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
        rules.append((pattern, replacement, re.IGNORECASE if 'i' in flags else 0))
    return rules


def slides_rules_from_text(text):
    """slidesConfig の本文から rules: の中身を読む（無ければ空）。"""
    m = re.search(r'rules:\s*\[(.*?)\n\s*\],', text, re.DOTALL)
    return load_rules(m.group(1)) if m else []


def load_slides_rules(slides):
    """`slides/<slides>.js` の slidesConfig.rules を読む。

    ファイルが無ければ空を返す。`ytslide init` した先にはスライド一式が
    無いので、`--text` だけを測るときはここで止めない（TODO-100）。
    """
    src = paths.SLIDES / f'{slides}.js'
    if not src.exists():
        return []
    return slides_rules_from_text(src.read_text(encoding='utf-8'))


def load_common_rules():
    """`player.html` の `const SPEECH_RULES = [ … ];` を読む。"""
    text = paths.PLAYER_HTML.read_text(encoding='utf-8')
    m = re.search(r'const SPEECH_RULES = \[(.*?)\n\s*\];', text, re.DOTALL)
    if not m:
        raise click.ClickException(f'{paths.PLAYER_HTML} に SPEECH_RULES が見つからない')
    return load_rules(m.group(1))


def prepare(text, slides=paths.DEFAULT_SLIDES):
    """prepareSpeechText() と同じ置換を掛ける（スライド一式側を先、共通を後）。"""
    # re.ASCII が要る。付けないと Python の \b は日本語を語の一部と見なすので、
    # 「slidesフォルダ」のように和文が続く語で JS と結果が食い違う。
    for pattern, replacement, flags in load_slides_rules(slides) + load_common_rules():
        text = re.sub(pattern, replacement, text, flags=flags | re.ASCII)
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


def measure(text, slides=paths.DEFAULT_SLIDES, repeat=1):
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
        raise click.ClickException(
            f'{src} の duration が {found} 個しか見つからない。'
            'slideData の書き方が変わっていないか確かめること')
    if changed:
        src.write_text(written, encoding='utf-8')
    return changed
