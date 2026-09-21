# TODO-092. 消音の切り替えをヘッダーのスピーカーマークに移す

|      | main | 担当 |
|------|------|------|
| 見込み | Sonnet 5 / effort medium | verifier |
| 実施 | Opus 5 / effort high | verifier |

| 担当 | モデル | effort | output | cache_creation | 料金の割合 |
|------|--------|--------|--------|----------------|-----------|
| main | Opus 5 | high | 9,193 | 22,895 | 63% |
| verifier | Sonnet 5 | medium | 22,397 | 44,526 | 37% |
| 合計 |  |  | 31,590 | 67,421 | 概算 $2.3 |

- verifier は定義（`~/.claude/agents/verifier.md`）のモデル・effort のまま。
  TODO-091 の担当を立て直さず、そのまま続けて使った
- main のモデルは利用者の設定（Opus 5 / effort high）で、見込みの Sonnet 5 とは違う

## きっかけ

声のプルダウン（TODO-091）の左にあるスピーカーマークが飾りのままで、
消音は再生ボタンの列の `mute-btn` で切り替えていた。音に関する操作を
ヘッダーの 1 か所にまとめたい、という指摘から。

消音ボタンを 2 か所に置くと状態表示を両方で揃えることになるので、
操作パネル側は外して 1 か所にすると決めた。`M` キーはそのまま残す。

## やったこと

- 操作パネルの `#mute-btn` を削除し、ヘッダーの `#voice-select` の左へ移した
  （飾りだった `<i class="fa-volume-high">` と入れ替え）
- **ID（`mute-btn` / `mute-icon`）は変えていない。** クリックハンドラも
  `M` キーの `muteBtn.click()` もそのまま動く
- アイコンの色はボタン側（`text-lime-400`）に持たせた。ハンドラが
  消音の解除時に `muteIcon.className` を丸ごと書き換えるため、
  アイコンに持たせると色が消える
- `docs/User.md`（消音の場所）と `docs/Developer.md`（`#mute-btn` の位置と
  色をボタン側に持たせる理由）を合わせた

## 確かめたこと

ヘッドレス Chromium（Playwright）で `player.html` を開いて測った（verifier）。
計測スクリプトは `archives/agents/TODO-092/check-mute-header.js`。

- `#mute-btn` はページに 1 つだけで、`#voice-select` と同じ親の中の左隣
- クリックで `aria-pressed` が `false` ⇔ `true`、`#mute-icon` の class が
  `fa-volume-high` ⇔ `fa-volume-xmark text-rose-400` と入れ替わる
- `M`（大文字・小文字とも）でも同じように切り替わる
- 再生中に消音にしても自動送りが止まらない（`duration` 0.5 秒に差し替えて、
  待ちのタイマーで次へ進むことを確認。TODO-084 の再発は無い）
- 操作パネル側に残骸は無く、`#fullscreen-btn` も健在。コンソールエラー無し

## 分担の振り返り

- **verifier は 7 項目すべてを実測し、指摘は出なかった。** ID を据え置いた
  markup の移動なので、想定どおり壊れる余地が小さかった
- **見込みと食い違ったのは main のモデルだけ**（見込み Sonnet 5、実施 Opus 5）。
  担当を verifier だけにした判断（reviewer を入れない）も変える必要は
  無かった。分岐も条件式も変えていないため
- **担当を立て直さず、TODO-091 の verifier に続けて頼んだのが効いた。**
  Playwright の借用先も計測スクリプトの作り方も引き継げたので、
  組み直しの分が要らなかった。同じ規模の UI の移設は、次も同じ構成
  （main が実装 + 前の verifier に続けて確認）で足りる
- verifier の計測スクリプトにある `strayMuteRefs`（正規表現で残骸を数える
  指標）は JS の変数名まで拾う誤検出で、報告では `querySelectorAll` での
  確認に差し替えられた。**残骸の確認は DOM で数えるほうが確実**
