"""`ytslide init` サブコマンドの確かめ。

`click.testing.CliRunner` でカレントディレクトリを切り替えて実際に叩く。
"""
from click.testing import CliRunner

from ytslide import paths
from ytslide.cli import cli


def test_init_creates_files_and_index(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    result = runner.invoke(cli, ['init'])
    try:
        assert result.exit_code == 0, result.output

        assert (tmp_path / 'slides' / 'template.js').exists()
        assert (tmp_path / 'player.html').exists()
        assert (tmp_path / 'README.md').exists()
        index_html = (tmp_path / 'index.html')
        assert index_html.exists()

        html = index_html.read_text(encoding='utf-8')
        # 一覧に template が 1 件だけ入っている。
        assert html.count('slides=template') == 1, html
        # <title> と <h1> がカレントディレクトリ名になる。
        assert f'<title>{tmp_path.name} - スライド一覧</title>' in html, html
        assert f'mr-2"></i>{tmp_path.name}</h1>' in html, html
    finally:
        paths.set_root(None)


def test_init_second_run_does_not_overwrite(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    runner.invoke(cli, ['init'])

    # 既存の中身をセンチネル文字列に差し替える。index.html はマーカー構造
    # だけ残し、タイトルと見出しをセンチネルにする（2 回目の init が内部で
    # 呼ぶ `index` が、マーカーの中だけ書き換えるのは正常な挙動のため）。
    template_sentinel = '// SENTINEL template.js\n'
    (tmp_path / 'slides' / 'template.js').write_text(template_sentinel, encoding='utf-8')
    player_sentinel = '<!-- SENTINEL player.html -->'
    (tmp_path / 'player.html').write_text(player_sentinel, encoding='utf-8')
    readme_sentinel = 'SENTINEL README\n'
    (tmp_path / 'README.md').write_text(readme_sentinel, encoding='utf-8')

    index_html = tmp_path / 'index.html'
    html = index_html.read_text(encoding='utf-8')
    html = html.replace(f'<title>{tmp_path.name} - スライド一覧</title>', '<title>SENTINEL</title>')
    html = html.replace(f'mr-2"></i>{tmp_path.name}</h1>', 'mr-2"></i>SENTINEL</h1>')
    index_html.write_text(html, encoding='utf-8')

    try:
        result = runner.invoke(cli, ['init'])
        assert result.exit_code == 0, result.output
        assert 'すでにある: template.js' in result.output, result.output
        assert 'すでにある: player.html' in result.output, result.output
        assert 'すでにある: README.md' in result.output, result.output
        assert 'すでにある: index.html' in result.output, result.output

        # slides/template.js・player.html・README.md は 1 バイトも触っていない。
        assert (tmp_path / 'slides' / 'template.js').read_text(encoding='utf-8') == template_sentinel
        assert (tmp_path / 'player.html').read_text(encoding='utf-8') == player_sentinel
        assert (tmp_path / 'README.md').read_text(encoding='utf-8') == readme_sentinel

        # index.html はマーカーの中だけ作り直され、<title>/<h1> は触られない。
        written = index_html.read_text(encoding='utf-8')
        assert '<title>SENTINEL</title>' in written, written
        assert 'mr-2"></i>SENTINEL</h1>' in written, written
    finally:
        paths.set_root(None)
