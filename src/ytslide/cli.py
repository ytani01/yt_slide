#
# (c) 2026 Yoichi Tanibayashi
#
import functools
import http.server
import pathlib

import click

from . import __version__, paths
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


@cli.command()
@click_common_opts(__version__)
def init(ctx, debug):
    """カレントディレクトリを、スライド一式の置き場所として初期化する。"""
    loggerInit(debug)

    root = pathlib.Path.cwd()
    slides_dir = root / 'slides'
    slides_dir.mkdir(exist_ok=True)

    template = slides_dir / 'template.js'
    if not _skip_if_exists(template):
        template.write_text(
            (paths.DATA / 'slides' / 'template.js').read_text(encoding='utf-8'),
            encoding='utf-8')

    player_html = root / 'player.html'
    if not _skip_if_exists(player_html):
        player_html.write_text(
            (paths.DATA / 'player.html').read_text(encoding='utf-8'),
            encoding='utf-8')

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
