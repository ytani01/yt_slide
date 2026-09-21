# TODO-093 reviewer-report

対象: `git diff -- index.html`（コミット前、`index.html` のみの差分）。
`tools/make-index.py`、`tools/test_make_index.py`、`README.md`、
`docs/User.md`・`docs/Developer.md`、`player.html` の既存パターンと突き合わせた。

## 要修正

なし。

## 検討

- **`index.html:19-38` CSS が TODO の列挙より広い。**
  TODO-093 の本文は「見出し・箇条書き・コード・リンク」の 4 種だけを
  最小限の CSS として挙げているが、差分は `table`/`th`/`td` に加え
  `blockquote`・`hr`・`img` の CSS も足している。
  - `table` は現行の `README.md`（`grep` で確認、76-99 行あたりに 2 つの表）
    で実際に使われており、必要と判断できる。
  - `blockquote`・`hr`・`img` は現行の `README.md` に **1 つも出てこない**
    （`grep -n '^>|^---|^!\['  README.md` の結果が空、実測）。
    将来 README が変わったときのための先回りで、指示の範囲を超えている。
    実害は無いが、「指示に無い変更」に当たるかどうかは管理者の判断に委ねる。

- **`fetch('README.md')` の失敗を握りつぶす `.catch(() => {})` に
  ログが無い。** `player.html` の既存の catch は `console.warn` で
  理由を残すものが多い（例: `player.html:1006`, `1086`, `1103`,
  `1157`）一方、完全に無言の `catch(e) {}` も複数ある
  （`player.html:883`, `956`, `1350`, `1547`）。どちらの流儀も既存に
  あるため規約違反とは言えないが、TODO 本文が「何も出さず」とだけ
  書いており `console` への記録を求めていない点も併せて、
  今回は意図どおりと判断できる（要修正ではなく記録として残す）。

- **`file://` で開いた場合の挙動は静的レビューでは確定できない
  （未確認）。** Chromium 系ブラウザは一般に `file://` からの
  `fetch()` を CORS で弾く既知の挙動があるが、実機での確認はしていない。
  弾かれた場合も `.catch(() => {})` に落ちて「README が無い」ときと
  同じ表示（隠したまま）になるため、**弾かれても TODO の要件
  （フェッチ失敗時に何も出さない）自体は満たす**。ただし「README を
  同じディレクトリに置いているのに `file://` だと出ない」という体験は
  仕様として意図されたものか確認されておらず、verifier 側で
  `file://` を実際に開いて確かめることを勧める。

## 好みの範囲

- CSS ルールの `code`/`pre`/`blockquote` の宣言が長さの都合で 2 行に
  折り返されている（`index.html:27-28`, `30-31`, `33-34`）。既存の
  `<style>` 内は 1 ルール 1 行の書き方（例: `index.html:17` の `body {...}`）
  だったので、書式がわずかに変わっている。可読性は問題ない範囲。

## 確認して問題が無かった点

- **分岐の抜け。** `res.ok` が false（404 など）→ `Promise.reject` →
  `.catch(() => {})` で無表示。fetch 自体が失敗（ネットワーク断）→
  直接 `.catch` で無表示。どちらも「フェッチが失敗すれば何も出さない」
  という TODO の要件どおりで、`#readme` は `hidden` クラスのままなので
  見た目も変わらない。
- **`tools/make-index.py` のマーカー範囲。** `BEGIN_MARKER`/`END_MARKER`
  はそのまま、追加した `<details>` ブロックは `<ul>` の外（前）、
  追加した `<script>` は `</main>` の後に置かれており、マーカー間の
  `<li>` 一覧とは重ならない。`replace_marker_block()` は正規表現で
  マーカー文字列そのものを探すだけなので、この差分では壊れない
  （実測: `python3 tools/test_make_index.py` は成功、ただし
  このテストは合成 HTML 文字列を使うテストで `index.html` 本体は
  読んでいないため参考程度）。
- **CDN・バージョン固定の書き方。** 既存の FontAwesome が
  `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`
  という「cdnjs + バージョン番号 + `.min.*`」の形。今回の
  `https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js`
  も同じ形で揃っている。（Tailwind の `https://cdn.tailwindcss.com` は
  バージョン固定ではないが、これは今回の変更ではなく既存のまま）
- **CSS セレクタのスコープ。** 追加した CSS はすべて `#readme-body`
  配下のセレクタ（`#readme-body h1` 等）で閉じており、`body`・`a`・
  `table` などの既存の裸のセレクタと衝突しない。既存の見た目への
  影響は無い。
- **コメントの文体。** `<!-- README.md があれば、その中身をここに出す。
  無ければ隠したまま -->` や `// 置いていなければ（fetch が失敗すれば）
  何も出さない。` は、`open` 属性と `hidden` クラスを同時に持たせる
  非自明な理由（＝なぜ）を説明しており、既存の日本語コメントの
  density（1〜2 行、簡潔）とも揃っている。
- **範囲。** `git diff --stat` は `index.html | 39 +++` のみで、
  `tools/make-index.py` 等の他ファイルは変更されていない。TODO の
  「`tools/make-index.py` は触らない」にも合致。

## 判断が要る点

- CSS に `blockquote`/`hr`/`img` を含めるかどうか（TODO の列挙外、
  現行 README では未使用）。
