"""`ytslide init` と `ytslide web` サブコマンドの確かめ。

`init` は `click.testing.CliRunner` でカレントディレクトリを切り替えて実際に叩く。
`web` は子プロセスで起動し、`urllib` で取り出す。
"""
import pathlib
import tomllib

from click.testing import CliRunner

from ytslide import paths
from ytslide.cli import CLAUDE_MD, cli


def test_init_creates_files_and_index(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    result = runner.invoke(cli, ['init'])
    try:
        assert result.exit_code == 0, result.output

        assert (tmp_path / 'slides' / 'template.js').exists()
        assert (tmp_path / 'player.html').exists()
        # UsersGuide.md は --claude が無くても置き、CLAUDE.md は置かない。
        guide = (paths.DATA / 'docs' / 'UsersGuide.md').read_text(encoding='utf-8')
        assert (tmp_path / 'docs' / 'UsersGuide.md').read_text(encoding='utf-8') == guide
        assert not (tmp_path / 'CLAUDE.md').exists()
        assert not (tmp_path / 'README.md').exists()
        index_html = (tmp_path / 'index.html')
        assert index_html.exists()

        html = index_html.read_text(encoding='utf-8')
        # 一覧に template が 1件だけ入っている。
        assert html.count('slides=template') == 1, html
        # <title> と <h1> がカレントディレクトリ名になる。
        assert f'<title>{tmp_path.name} - スライド一覧</title>' in html, html
        assert f'mr-2"></i>{tmp_path.name}</h1>' in html, html
    finally:
        paths.set_root(None)


def test_init_claude_writes_claude_md(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    try:
        result = CliRunner().invoke(cli, ['init', '--claude'])
        assert result.exit_code == 0, result.output
        assert (tmp_path / 'CLAUDE.md').read_text(encoding='utf-8') == CLAUDE_MD
        assert (tmp_path / 'docs' / 'UsersGuide.md').exists()
    finally:
        paths.set_root(None)


def test_init_data_is_packaged():
    """`init` がコピーする同梱データが、wheel の force-include に載っている。"""
    root = pathlib.Path(__file__).resolve().parents[1]
    with open(root / 'pyproject.toml', 'rb') as f:
        include = tomllib.load(f)['tool']['hatch']['build']['targets']['wheel']['force-include']
    for rel in ('player.html', 'index.html', 'slides/template.js', 'docs/UsersGuide.md'):
        assert include.get(rel) == f'ytslide/data/{rel}', rel


def test_measure_no_slides_lists_candidates(tmp_path, monkeypatch):
    """`slides/<名前>.js` が無いとき、候補を挙げて案内する。

    候補は `readme` が先頭、残りは辞書順（`index_mod.slide_names()` と
    同じ並び）になる。
    """
    monkeypatch.chdir(tmp_path)
    slides_dir = tmp_path / 'slides'
    slides_dir.mkdir()
    for name in ('zebra', 'readme', 'apple'):
        (slides_dir / f'{name}.js').write_text('', encoding='utf-8')

    runner = CliRunner()
    try:
        # 既定の `readme.js` は既にある。存在しない名前を明示して、
        # readme.js が候補に含まれた状態でエラーを踏ませる。
        result = runner.invoke(cli, ['measure', '--all', '--slides', 'missing'])
        assert result.exit_code != 0, result.output
        assert 'あるのは readme, apple, zebra。--slides で指定する' \
            in result.output, result.output
    finally:
        paths.set_root(None)


def test_init_second_run_does_not_overwrite(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    runner.invoke(cli, ['init'])

    guide_sentinel = '# SENTINEL UsersGuide.md\n'
    (tmp_path / 'docs' / 'UsersGuide.md').write_text(guide_sentinel, encoding='utf-8')
    claude_sentinel = '# SENTINEL CLAUDE.md\n'
    (tmp_path / 'CLAUDE.md').write_text(claude_sentinel, encoding='utf-8')

    # 既存の中身をセンチネル文字列に差し替える。index.html はマーカー構造
    # だけ残し、タイトルと見出しをセンチネルにする（2回目の init が内部で
    # 呼ぶ `index` が、マーカーの中だけ書き換えるのは正常な挙動のため）。
    template_sentinel = '// SENTINEL template.js\n'
    (tmp_path / 'slides' / 'template.js').write_text(template_sentinel, encoding='utf-8')
    player_sentinel = '<!-- SENTINEL player.html -->'
    (tmp_path / 'player.html').write_text(player_sentinel, encoding='utf-8')

    index_html = tmp_path / 'index.html'
    html = index_html.read_text(encoding='utf-8')
    html = html.replace(f'<title>{tmp_path.name} - スライド一覧</title>', '<title>SENTINEL</title>')
    html = html.replace(f'mr-2"></i>{tmp_path.name}</h1>', 'mr-2"></i>SENTINEL</h1>')
    index_html.write_text(html, encoding='utf-8')

    try:
        result = runner.invoke(cli, ['init', '--claude'])
        assert result.exit_code == 0, result.output
        assert 'すでにある: UsersGuide.md' in result.output, result.output
        assert 'すでにある: CLAUDE.md' in result.output, result.output
        assert (tmp_path / 'docs' / 'UsersGuide.md').read_text(encoding='utf-8') == guide_sentinel
        assert (tmp_path / 'CLAUDE.md').read_text(encoding='utf-8') == claude_sentinel
        assert 'すでにある: template.js' in result.output, result.output
        assert 'すでにある: player.html' in result.output, result.output
        assert 'すでにある: index.html' in result.output, result.output
        assert not (tmp_path / 'README.md').exists()

        # slides/template.js・player.html は 1 バイトも触っていない。
        assert (tmp_path / 'slides' / 'template.js').read_text(encoding='utf-8') == template_sentinel
        assert (tmp_path / 'player.html').read_text(encoding='utf-8') == player_sentinel

        # index.html はマーカーの中だけ作り直され、<title>/<h1> は触られない。
        written = index_html.read_text(encoding='utf-8')
        assert '<title>SENTINEL</title>' in written, written
        assert 'mr-2"></i>SENTINEL</h1>' in written, written
    finally:
        paths.set_root(None)


def test_web_serves_bundled_player_with_log(tmp_path):
    # 作業場所に player.html が無くても同梱のものを配り、ログは出す（TODO-129）。
    import socket
    import subprocess
    import sys
    import time
    import urllib.error
    import urllib.request

    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('// mine', encoding='utf-8')
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
    proc = subprocess.Popen(
        [sys.executable, '-m', 'ytslide', 'web', '-p', str(port), '--root', str(tmp_path)],
        stderr=subprocess.PIPE)
    body = None
    try:
        for _ in range(50):
            try:
                with urllib.request.urlopen(
                        f'http://127.0.0.1:{port}/player.html?slides=sample') as r:
                    body = r.read()
                break
            except urllib.error.HTTPError:
                raise
            except urllib.error.URLError:  # まだ起動していない
                time.sleep(0.1)
        assert body == (paths.DATA / 'player.html').read_bytes()
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/slides/sample.js') as r:
            assert r.read() == b'// mine'
    finally:
        proc.terminate()
        _, err = proc.communicate(timeout=5)
        print(err.decode())
    assert b'"GET /player.html?slides=sample HTTP/1.1" 200' in err
