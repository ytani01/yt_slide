"""スライドの置き場所と、同梱データの場所を決める。

`--root` の指定があればそこ、無ければカレントディレクトリを使う
（`uv tool install` で入れた `ytslide` にはリポジトリのチェックアウトが
無いため、後方互換のリポジトリへの分岐は持たない）。
"""
import pathlib

# 同梱データ（player.html・index.html・slides/template.js）の場所。
# パッケージ配布物には `ytslide/data/` に入っている。
# リポジトリのチェックアウトから直接動かしたとき（`uv run` / 開発中）は
# `ytslide/data/` が無いので、リポジトリ直下（src/ytslide から 2つ上）へ
# 落とす。
DATA = pathlib.Path(__file__).resolve().parent / "data"
if not DATA.is_dir():
    DATA = pathlib.Path(__file__).resolve().parents[2]

DEFAULT_SLIDES = "readme"

ROOT = SLIDES = PLAYER_HTML = INDEX_HTML = None


def find_root(root_arg):
    """`--root` の指定があればそこ、無ければカレントディレクトリを返す。"""
    if root_arg:
        return pathlib.Path(root_arg).resolve()
    return pathlib.Path.cwd()


def set_root(root_arg):
    """ROOT/SLIDES/PLAYER_HTML/INDEX_HTML を決めて module 変数に入れる。

    `player.html` は ROOT 側にコピーがあればそれを使い（実際の再生と
    ずれないよう）、無ければ同梱データのものへ落とす。
    """
    global ROOT, SLIDES, PLAYER_HTML, INDEX_HTML
    ROOT = find_root(root_arg)
    SLIDES = ROOT / "slides"
    own_player = ROOT / "player.html"
    PLAYER_HTML = own_player if own_player.exists() else DATA / "player.html"
    INDEX_HTML = ROOT / "index.html"


set_root(None)  # 既定（--root を渡さず呼ばれたときと同じ）
