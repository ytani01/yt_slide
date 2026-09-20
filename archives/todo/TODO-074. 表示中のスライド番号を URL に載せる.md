# TODO-074. 表示中のスライド番号を URL に載せる

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | reviewer + verifier |
| 実施 | Sonnet 5 / effort high | reviewer + verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Sonnet 5 | high | 6,488 | 80,573 | 49% |
| reviewer | Sonnet 5 | high | 11,163 | 45,748 | 33% |
| verifier | Sonnet 5 | medium | 5,043 | 26,655 | 18% |
| 合計 |  |  | 22,694 | 152,976 | 概算 $0.9 |

- reviewer と verifier は定義（`~/.claude/agents/*.md`）のモデル・effort のまま。
  上書きはしていない
- main は見込みが effort medium だったが、実際は high で進めた

分担の詳細は [archives/agents/TODO-074/](../agents/TODO-074/README.md)。

## きっかけ

いまは必ず 1 枚目から始まる。「この枚を見て」とリンクで渡せず、再読み込みでも
先頭に戻る。チャプター一覧やシークバーで頭出ししても、その位置を人に渡す
手段が無かった。

## やったこと

書き換えるのは表示が変わるたび（利用者と決めた）。自動送りでも URL が追従する。
履歴は汚さない。形式は `player.html?slides=user#7`（1 始まり）。

`player.html`:

- `renderSlide()` の末尾で `history.replaceState(null, '', '#N')` を呼ぶ。
  自動送り・手動送り・シークバー・チャプター一覧はすべてここを通るので、
  書き換える場所は 1 箇所で済んだ
- `startIndexFromHash()` を足し、`startApp()` の最初の `renderSlide` に使う。
  `#` 直後が数字だけで範囲内ならその枚から。ハッシュ無し・数値でない・
  0 以下・枚数超過は 1 枚目に寄せる
- reviewer の指摘で、`replaceState` を `try`/`catch` で囲んだ。Safari は
  30 秒に 100 回を超えると例外を投げる。囲まないと、起動時は
  `setupEventListeners()` に届かず操作できなくなり、自動送りも止まる

`docs/User.md`（「公開」の「「この枚を見て」と渡す」）と
`docs/Developer.md`（「表示中のスライド番号を URL に載せる」）に書いた。

## 確かめたこと

verifier が Playwright（Chromium 1280x720、`?slides=user` の 15 枚）で実測した。
全項目が一致した。

- ハッシュ無し → 1 枚目で URL は `#1` になる。`#7` → 7 枚目から始まり、
  番号・チャプター一覧の選択・シークバーも 7 枚目に合う
- `#0` `#-1` `#abc` `#7abc` `#999` `#` → 1 枚目
- ボタン・チャプター一覧・シークバー・キーボードのたびにハッシュが変わり、
  `history.length` は増えず、`?slides=user` は残る
- 自動送り（2.0x・待ち 1 秒）で 3 枚目まで追従。再読み込みで同じ枚に戻る
- `replaceState` を例外を投げるものに差し替えても、操作も自動送りも止まらない

**未確認:** Safari 実機での 30 秒 100 回の制限、自動送りの 4 枚目以降。

## 残ること

- 起動後にハッシュを手で書き換えても追従しない（`hashchange` は聞かない）。
  必要になったら別の項目にする

## 分担の振り返り

- **reviewer:** 境界値と全経路は実測で問題なしとし、`replaceState` の例外だけを
  「検討」に挙げた。この 1 件が実際に反映された。file:// と sandbox iframe では
  投げないことも実測して切り分けており、過剰な修正を避けられた
- **verifier:** 食い違い 0。例外注入の項目（7）は reviewer の指摘を確かめる
  ためのもので、修正が効いていることを確認できた
- **見込みとの食い違い:** 担当は見込みどおり。main の effort だけ medium → high
- **次に同じ規模なら:** 書き換えが 1〜2 か所の項目は、今回と同じ main のみ実装 +
  reviewer + verifier でよい。reviewer が先、verifier が後の順を保つと、
  verifier の実測が修正後の差分に対するものになる
