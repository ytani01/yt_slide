# TODO-102 reviewer 報告

対象: `README.md` / `docs/User.md` / `docs/Developer.md` / `slides/readme.js`
の未コミット差分（`git diff`）。`CLAUDE.md`（プロジェクト側）、`TODO.md` の
「## TODO-102」節を読んだ上でレビューした。

比較には `git show HEAD:README.md` / `git show HEAD:slides/readme.js` で
削除前の内容を取り出して突き合わせた。`slides/readme.js` は
`uv run ytslide measure --slides readme --all` で実測し、コミット済みの
`duration`（13, 12, 15, 14, 14, 13）と一致することを確認した。

## 要修正

なし。

## 検討

1. **README:1〜7 / `index.html` に関する説明が README から完全に消えた。**
   旧 README（`git show HEAD:README.md` 6〜8 行目）は「その URL で
   ディレクトリを開くと、スライドの一覧（`index.html`）が出る。」と、
   `index.html` の存在と役割を冒頭で明示していた。新 README には
   `index.html` という語が一度も出てこない（`grep -n index.html README.md`
   でヒット無し）。情報自体は `docs/User.md` の「公開」節
   （「`index.html` も置いた場合は、そのディレクトリの公開 URL を渡せば
   一覧から選べる。」)に残っており、消えたわけではない。ただし README
   だけを読む利用者が `index.html` の存在にそもそも気付けるかは
   **実害は未確認**。TODO-102 のチェックリストにも「`index.html` の扱い」
   への言及は無く、意図した簡略化か見落としかの判断は管理者に委ねる。

2. **README:16 の「チャプター一覧の検索」ブレットが新規追加されている。**
   旧 README の「できること」（`git show HEAD:README.md` 13〜21 行目）には
   無い項目で、TODO-102 のチェックリストにも「できること」へ項目を足す
   指示は無い。機能自体は実在する（`player.html` 519・540 行、
   `docs/User.md` の「チャプター一覧の検索」節は TODO-077 で既に追加済み）
   ので事実誤認ではないが、**この項目の作業指示（README を絞る／docs へ
   移す）には無い加筆**。狙いどおりの「アピールとして要るものを足した」
   なのか、範囲外の追加なのかは判断が要る。

3. **README:18 の「MP4 への書き出し」ブレットへの集約は妥当だが、
   旧README の独立節がまるごと 1 行になっている。**
   旧「動画に書き出す」節（`git show HEAD:README.md` 174〜184 行目）に
   あったコマンド例 `ytslide video --slides sample` は README からは
   消えたが、`docs/User.md` の「動画に書き出す」節（今回の diff では
   未変更、398〜420 行目）に同じ例が既にあるため情報の欠落は無い。
   問題なしと判断。

## 好みの範囲

- `docs/User.md` に新設した「`ytslide` のサブコマンド」節（140〜173 行目）
  は、既存の「手順」節の各見出し（「一覧から開きたいとき」「時間表示を
  合わせたいとき」「HTTP や別端末で確認したいとき」）と、`ytslide index`・
  `update`・`web` の使い道の説明がゆるく重なる。ただしこの重なりは今回の
  移動で新しく生まれたものではなく、旧 README でも同じ表と「自分の
  スライドを作る」節の説明が同一ファイル内に同居していた構図をそのまま
  docs 側に持ち込んだだけ（旧 README 46〜58 行目の表 と 81〜139 行目の
  手順説明）。実害は無いと見ている。

## 確認して問題が無かった点（1行でまとめ）

- `docs/User.md` の `#必要なもの` 参照 3 か所は、すべて新設した
  `#測定と動画に要るパッケージ` アンカーに揃っている。ファイル内に
  「必要なもの」という語は残っていない（`grep` で確認）。
- `docs/Developer.md`「リポジトリの構成」表に足された 6 行
  （`index.html`・`docs/`・`pyproject.toml`・`TODO.md`・`archives/`・
  `CLAUDE.md`）は、旧 README「ファイル構成」表（153〜167 行目）の記述と
  内容が一致している。
- README・docs/User.md・docs/Developer.md 間のリンク（`#手順`、
  `#ytslide-のサブコマンド`、`#インストール` など）はすべて見出しの
  実体と一致し、リンク切れは無い。
- `slides/readme.js` から落とした 4 枚（slidesConfig と slideData／1 枚の
  要素／`render()` の書き方／`duration` の測り方）は、`slides/user.js` の
  「slideData の中身」「render() の書き方」「duration の測り方」の各枚で
  カバーされている（見出しの対応を確認）。
- 残した 6 枚のうち narration を変えた「自分のスライドを作る」枚は、
  実測の `duration`（14）と本文の 2 つのリンク（`player.html?slides=user`
  と `docs/User.md` の GitHub URL）が `slides/user.js`・
  `slides/template.js` にある既存のリンクパターン（`target="_blank"
  rel="noopener" onclick="event.stopPropagation()"`）と表記が揃っている。
- `TODO-102` チェックリストの各項目（README を絞る、4 節を docs へ集約、
  リンク張り替え、6 枚化、duration 再測定）は、上記の確認範囲では
  すべて満たされている。

## 見なかったもの

- スライドのデザイン（配色・余白・フォントサイズ）
- レイアウトの実測・スクリーンショット
- `archives/` 以下
