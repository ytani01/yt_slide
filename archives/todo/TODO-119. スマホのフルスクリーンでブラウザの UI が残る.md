# TODO-119. スマホのフルスクリーンでブラウザの UI が残る

|      | main | 担当 |
|------|------|------|
| 見込み | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |
| 実施 | Opus 5.5 / effort medium | main（実装）+ reviewer（Opus 5.5 / high）+ verifier（Sonnet 5.5 / medium） |

| 担当 | モデル | effort | input | output | cache_creation | cache_read | 割合 |
|------|--------|--------|-------|--------|----------------|------------|------|
| main | Opus 5.5 | medium | 34 | 10,484 | 22,024 | 1,108,731 | 75% |
| reviewer | Opus 5.5 | high | 16 | 5,148 | 45,905 | 217,704 | 18% |
| verifier | Sonnet 5.5 | medium | 10 | 33 | 27,523 | 89,213 | 8% |
| 合計 |  |  | 60 | 15,665 | 95,452 | 1,415,648 | 計 1,526,825 |

- reviewer・verifier とも定義（`~/.claude/agents/`）のモデルと effort のまま

## きっかけ

スマホでフルスクリーンにしても、URL バーなどブラウザの UI が残る。
フルスクリーンは CSS だけの擬似フルスクリーン（`setFullscreen`）で、
Fullscreen API を呼んでいなかった。

## やったこと

- `setFullscreen` で、擬似フルスクリーンと一緒に `document.documentElement` へ
  `requestFullscreen()` / `exitFullscreen()` を呼ぶ。API が無ければ擬似だけ。
  対象をページ全体にしたのは、要素を対象にすると UA の `:fullscreen` が
  幅と高さを 100% に固定し、レターボックスが崩れるため
- `fullscreenchange` で両者を揃える。ブラウザ側で抜けたら擬似も解除し、
  要求が通る前に擬似を切ったら（素早い 2 度押し）本物を抜ける
- F キーの長押し（`e.repeat`）では切り替えない
- iPhone（要素の Fullscreen API が無い）向けに、`apple-mobile-web-app-capable` と
  `apple-mobile-web-app-status-bar-style` の meta を足した。ホーム画面から開けば
  UI が出ない。manifest でなく meta にしたのは、追加したときの URL
  （`?slides=`）がそのまま起動先になるから（利用者が決めた）
- README の「できること」と `docs/Developer.md` の「擬似フルスクリーン」に説明を足した
- PC でもボタンと F キーで本物のフルスクリーンになる

## 確かめたこと

verifier が Playwright の headless chromium で、844x390（モバイル・タッチ）と
1280x800 で実測した（`archives/agents/TODO-119/verify.py`）。
ボタン・F キーの入り切り、`exitFullscreen()` で抜けたときの擬似の解除、2 度押し、
repeat の keydown、API が無いときの擬似だけの動作（コンソールエラー 0 件）、
レターボックスが画面に収まること、meta があることが、すべて期待どおりだった。

## 残ること

- 実機（Android・iPad・iPhone のホーム画面）では確かめていない。
  iPhone のホーム画面から開いて一覧へ移ったときに戻れるか、読み上げが
  動くかも未確認（reviewer の報告）

## 分担の振り返り

- reviewer は、要求中に擬似を切ると本物のフルスクリーンだけが残る食い違いと、
  決めた範囲の外の meta（`mobile-web-app-capable`）、iPad の版の書き漏れを
  見つけた。3 つとも直した
- verifier は食い違いを見つけなかった。フルスクリーン中はボタンが枠の裏に
  隠れる点と暗幕が透ける点を挙げたが、どちらも前からの挙動
- 見込みどおりの編成で、食い違いは無かった
- 次に同じ規模（1 ファイルの分岐追加 + meta）なら同じ編成でよい。
  verifier への依頼は、今回のように「headless でも API が通る」ことを先に
  測って渡すと、確認の手段を探す分が省ける
