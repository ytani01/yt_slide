"""`ytslide check` の配線と、結果の出し方を確かめる。

Playwright には触れない（check.check() を差し替える）。
"""
from click.testing import CliRunner

from ytslide import check
from ytslide.cli import cli


def test_check_command_root_wiring(tmp_path):
    # video のテストと同じ形（TODO-095 reviewer 指摘 2 の後継）。
    (tmp_path / 'slides').mkdir()
    runner = CliRunner()
    result = runner.invoke(cli, ['check', '--slides', 'nope', '--root', str(tmp_path)])
    assert result.exit_code == 2, result.output
    assert str(tmp_path) in result.output, result.output


def _ok_result():
    return {'ok': True, 'syntaxError': None, 'missingKeys': [], 'missingImages': []}


def test_check_command_reports_ok(tmp_path, monkeypatch):
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')
    monkeypatch.setattr(check, 'check', lambda slides_name: _ok_result())

    runner = CliRunner()
    result = runner.invoke(cli, ['check', '--slides', 'sample', '--root', str(tmp_path)])
    assert result.exit_code == 0, result.output
    assert 'slides/sample.js: 問題なし' in result.output


def test_check_command_reports_syntax_error(tmp_path, monkeypatch):
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')
    monkeypatch.setattr(check, 'check', lambda slides_name: {
        'ok': False,
        'syntaxError': {'filename': 'slides/sample.js', 'lineno': 12, 'colno': 9,
                         'message': "Unexpected identifier 'narration'"},
        'missingKeys': [], 'missingImages': [],
    })

    runner = CliRunner()
    result = runner.invoke(cli, ['check', '--slides', 'sample', '--root', str(tmp_path)])
    assert result.exit_code == 1, result.output
    assert 'slides/sample.js:12:9' in result.output
    assert "Unexpected identifier 'narration'" in result.output


def test_check_command_reports_missing_keys_and_images(tmp_path, monkeypatch):
    (tmp_path / 'slides').mkdir()
    (tmp_path / 'slides' / 'sample.js').write_text('', encoding='utf-8')
    monkeypatch.setattr(check, 'check', lambda slides_name: {
        'ok': False,
        'syntaxError': None,
        'missingKeys': [{'number': 3, 'keys': ['title']}],
        'missingImages': [{'number': 5, 'src': 'images/foo.jpg', 'status': 404}],
    })

    runner = CliRunner()
    result = runner.invoke(cli, ['check', '--slides', 'sample', '--root', str(tmp_path)])
    assert result.exit_code == 1, result.output
    assert 'スライド 3: title が無い' in result.output
    assert 'スライド 5: images/foo.jpg が見つからない (404)' in result.output
