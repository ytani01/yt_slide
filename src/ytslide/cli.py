#
# (c) 2026 Yoichi Tanibayashi
#
import functools
import http.server
import pathlib

import click

from . import __version__, paths
from . import check as check_mod
from . import index as index_mod
from . import measure as measure_mod
from . import video as video_mod
from .click_utils import click_common_opts
from .mylog import getLogger, loggerInit

_log = getLogger("main")


@click.group()
@click_common_opts(__version__)
def cli(ctx, debug):
    """ナレーション付きスライドを作る・測る・書き出す CLI。"""
    loggerInit(debug)
    _log.debug(ctx)
    _log.debug(debug)


def _skip_if_exists(path):
    """既にあれば「すでにある: <名前>」と出して True（飛ばす）を返す。"""
    if path.exists():
        click.echo(f'すでにある: {path.name}')
        return True
    return False


def _no_slides_error(src):
    """`slides/<名前>.js` が無いときのエラーを、候補を添えて返す。

    候補は `index_mod.slide_names()` と同じ並び（`readme` が先頭）にする。
    呼び出し元で `paths.set_root()` が済んでいること（`slide_names()` は
    `paths.SLIDES` を見る）。
    """
    names = index_mod.slide_names()
    hint = (f'あるのは {", ".join(names)}。--slides で指定する' if names
            else f'{src.parent} に .js が無い')
    return click.UsageError(f'{src} が無い\n       {hint}')


# `init --claude` で置く CLAUDE.md。テンプレートのファイルにすると Claude Code が
# 自分への指示と取り違えるおそれがあるので、ここに文字列で持つ（TODO-122）。
CLAUDE_MD = """\
# CLAUDE.md

ナレーション付きで自動再生するスライドを作る作業場所。
`ytslide init --claude` で生成した。

## 触る前に読むもの

**スライドを書く前に `docs/UsersGuide.md` を読む。** `slides/<名前>.js` の
書き方、テンプレート、`narration` と `duration`、読みの直し方、`ytslide` の
サブコマンドはそこにある。

## 決まりごと

- 書くのは `slides/<名前>.js` だけ。`player.html` は編集しない。
  `index.html` は手で直さず `ytslide index` で作り直す
- ファイル名は英数字・`_`・`-` だけ
- 見た目は `slides/template.js` のテンプレートから近いものを選んでコピーし、
  中身を差し替える
- 各スライドに `title`・`body`・`narration`・`duration` を書く。
  `duration` はおおよその秒数でよいが、省かない
- `ytslide` のコマンドは、この作業場所で実行する。`check`・`measure`・`update`・
  `video` には `--slides <名前>` を付ける

## 進め方

1. 新しく作るときは、先に構成案だけを出す（各スライドの題名・使う
   テンプレート・ナレーションの要旨）。承認されるまでファイルを書かない
2. 書いたら `ytslide check --slides <名前>` を実行し、エラーが無くなるまで直す。
   Playwright か chromium が無いと言われたら、表示された入れ方を利用者に
   伝えて先へ進む
3. `ytslide measure --slides <名前> --all` で、`TTS_MAX_CHARS` で切れる
   文が無いか見る。あれば文を分ける
4. ブラウザを操作できるなら、`player.html?slides=<名前>#N` で N 枚目を開いて
   見た目を確かめる（はみ出し・崩れ）
5. 読み上げは利用者が聞いて確かめる。読みの直しは `slidesConfig.rules` に
   書く（長い語を先に書く）
6. 直しを頼まれたら、指定された番号のスライドだけを変える
7. 仕上げに `ytslide update --slides <名前>` で `duration` と一覧を更新する
"""


def _copy_data(rel, dst):
    """同梱データの `rel` を `dst` へコピーする（既にあれば飛ばす）。"""
    if not _skip_if_exists(dst):
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text((paths.DATA / rel).read_text(encoding='utf-8'),
                       encoding='utf-8')


@cli.command()
@click.option('--claude', is_flag=True, help='Claude Code 向けの CLAUDE.md も置く')
@click_common_opts(__version__)
def init(ctx, claude, debug):
    """カレントディレクトリを、スライド一式の置き場所として初期化する。"""
    loggerInit(debug)

    root = pathlib.Path.cwd()
    _copy_data('slides/template.js', root / 'slides' / 'template.js')
    _copy_data('player.html', root / 'player.html')
    _copy_data('docs/UsersGuide.md', root / 'docs' / 'UsersGuide.md')

    if claude:
        claude_md = root / 'CLAUDE.md'
        if not _skip_if_exists(claude_md):
            claude_md.write_text(CLAUDE_MD, encoding='utf-8')

    index_html = root / 'index.html'
    if not _skip_if_exists(index_html):
        text = (paths.DATA / 'index.html').read_text(encoding='utf-8')
        text = text.replace('yt_slide', root.name)
        index_html.write_text(text, encoding='utf-8')

    ctx.invoke(index, root=str(root), debug=debug)


@cli.command()
@click.argument('numbers', nargs=-1, type=int)
@click.option('--text', help='下書きの文字列を直接測る')
@click.option('--all', 'all_', is_flag=True, help='すべてのスライド')
@click.option('--write', is_flag=True, help='測った値をスライド一式の duration に書き戻す')
@click.option('--slides', 'slides_name', default=None,
              help=f'slides/<名前>.js の <名前>（既定は {paths.DEFAULT_SLIDES}）')
@click.option('-n', '--repeat', type=click.IntRange(min=1), default=1,
              help='1枚を測る回数。中央値を採る（既定 1）')
@click.option('--root', help='スライドの置き場所（既定はカレントディレクトリ）')
@click_common_opts(__version__)
def measure(ctx, numbers, text, all_, write, slides_name, repeat, root, debug):
    """ナレーションの読み上げ秒数を測る。"""
    loggerInit(debug)
    paths.set_root(root)
    slides_name = slides_name or paths.DEFAULT_SLIDES

    src = paths.SLIDES / f'{slides_name}.js'
    if (numbers or all_) and not src.exists():
        raise _no_slides_error(src)

    jobs = []
    if text:
        jobs.append((None, '下書き', text))
    if numbers or all_:
        found = measure_mod.narrations(src.read_text(encoding='utf-8'))
        ids = range(1, len(found) + 1) if all_ else numbers
        for i in ids:
            jobs.append((i, f'スライド {i}', found[i - 1]))
    if not jobs:
        raise click.UsageError('スライド番号か --text か --all を渡す')
    if write and not (numbers or all_):
        raise click.UsageError('--write はスライド番号か --all と一緒に渡す')

    updates = {}
    for number, label, job_text in jobs:
        spoken, raw, scaled = measure_mod.measure(job_text, slides_name, repeat)
        cut = (f' ★TTS_MAX_CHARS={measure_mod.TTS_MAX_CHARS} 字で切れる'
               if len(spoken) > measure_mod.TTS_MAX_CHARS else '')
        times = f'{repeat} 回の中央値 ' if repeat > 1 else ''
        click.echo(f'{label}: 原文 {len(job_text)} 字 / 読み {len(spoken)} 字{cut}'
                   f' / 実測 {times}{raw:.3f}s'
                   f' / BASE_SPEED_MULTIPLIER={measure_mod.BASE_SPEED_MULTIPLIER} 倍速'
                   f' {scaled:.2f}s -> duration: {round(scaled)}')
        if number is not None:
            updates[number] = round(scaled)

    if write:
        changed = measure_mod.write_durations(src, updates)
        for number, old, new in changed:
            click.echo(f'スライド {number}: duration {old} -> {new}')
        click.echo(f'{src.name}: {len(changed)} 枚を書き換えた'
                   if changed else f'{src.name}: 変更なし')


@cli.command()
@click.option('--root', help='スライドの置き場所（既定はカレントディレクトリ）')
@click_common_opts(__version__)
def index(ctx, root, debug):
    """slides/*.js の slidesConfig から index.html の一覧を作る。"""
    loggerInit(debug)
    paths.set_root(root)
    n = index_mod.build_index()
    click.echo(f'{paths.INDEX_HTML.name}: {n} 件のスライドを書いた')


@cli.command()
@click.option('--slides', 'slides_name', default=None,
              help=f'slides/<名前>.js の <名前>（既定は {paths.DEFAULT_SLIDES}）')
@click.option('-n', '--repeat', type=click.IntRange(min=1), default=1,
              help='1枚を測る回数。中央値を採る（既定 1）')
@click.option('--root', help='スライドの置き場所（既定はカレントディレクトリ）')
@click_common_opts(__version__)
def update(ctx, slides_name, repeat, root, debug):
    """measure --all --write のあと index を実行する。"""
    ctx.invoke(measure, numbers=(), text=None, all_=True, write=True,
               slides_name=slides_name, repeat=repeat, root=root, debug=debug)
    ctx.invoke(index, root=root, debug=debug)


@cli.command()
@click.option('--slides', 'slides_name', default=None,
              help=f'slides/<名前>.js の <名前>（既定は {paths.DEFAULT_SLIDES}）')
@click.option('--out', default='video', help='書き出し先ディレクトリ（既定 video）')
@click.option('--only', 'only', type=int, multiple=True, help='このスライド番号だけ書き出す（確認用）')
@click.option('--root', help='スライドの置き場所（既定はカレントディレクトリ）')
@click_common_opts(__version__)
def video(ctx, slides_name, out, only, root, debug):
    """スライド一式を MP4 と .srt に書き出す（playwright が要る）。"""
    loggerInit(debug)
    paths.set_root(root)
    slides_name = slides_name or paths.DEFAULT_SLIDES

    src = paths.SLIDES / f'{slides_name}.js'
    if not src.exists():
        raise _no_slides_error(src)

    video_mod.make_video(slides_name, pathlib.Path(out), list(only) or None)


@cli.command()
@click.option('--slides', 'slides_name', default=None,
              help=f'slides/<名前>.js の <名前>（既定は {paths.DEFAULT_SLIDES}）')
@click.option('--root', help='スライドの置き場所（既定はカレントディレクトリ）')
@click_common_opts(__version__)
def check(ctx, slides_name, root, debug):
    """構文エラー・必須キーの欠け・存在しない画像パスを検査する（playwright が要る）。"""
    loggerInit(debug)
    paths.set_root(root)
    slides_name = slides_name or paths.DEFAULT_SLIDES

    src = paths.SLIDES / f'{slides_name}.js'
    if not src.exists():
        raise _no_slides_error(src)

    result = check_mod.check(slides_name)
    js_name = f'slides/{slides_name}.js'

    if result['syntaxError']:
        e = result['syntaxError']
        click.echo(f"{e['filename']}:{e['lineno']}:{e['colno']} でエラー: {e['message']}")
    for item in result['missingKeys']:
        click.echo(f"スライド {item['number']}: {', '.join(item['keys'])} が無い")
    for item in result['missingImages']:
        click.echo(f"スライド {item['number']}: {item['src']} が見つからない ({item['status']})")

    if result['ok']:
        click.echo(f'{js_name}: 問題なし')
    else:
        ctx.exit(1)


@cli.command()
@click.option('-p', '--port', type=int, default=8000, show_default=True, help='ポート番号')
@click_common_opts(__version__)
def web(ctx, port, debug):
    """カレントディレクトリを配る（http.server）。"""
    loggerInit(debug)
    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler, directory=str(pathlib.Path.cwd()))
    with http.server.ThreadingHTTPServer(('', port), handler) as httpd:
        click.echo(f'http://localhost:{port}/ で配信中（Ctrl-C で止める）')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
