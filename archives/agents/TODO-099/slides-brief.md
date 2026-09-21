# スライドの実装

利用者が TODO-099 本体の実施を承認した。担当は slides/user.js のみ。
CLAUDE.md と docs/User.md を読み、TODO-099 の手順に揃える。
他の担当も作業中。README.md と User.md は別担当が改稿中なので変更を戻さない。
player.html・CLI・TODO.md は変更しない。

手順1〜4は3枚（準備 / 書いて確かめる / 一覧・仕上げ・共有）へまとめる。
標準は uv tool install → mkdir ~/my-slides && cd ~/my-slides → ytslide init
→ template.js を sample.js にコピー → 自分の内容を1枚作成
→ player.html?slides=sample → 保存と再読み込みの反復。
一覧は ytslide index、時間を合わせたい場合だけ update --slides sample。
既存 duration の説明と後続のナレーションも整合を取る。必須と任意を分ける。
他の既存の説明やアイコン一覧は保つ。読みやすさを優先し、詳細は User.md に委ねる。
ナレーションは 180 字制限を意識し、明確に短くする。実際の測定は main が行う。
既存のデザイン・cqw を使い、不要な構造変更を避ける。

最低限の確認: node による構文と slideData 読み込み、変更した枚の番号・題名・
ナレーション文字数の列挙、git diff --check。ブラウザ確認は後の verifier。
完了後 archives/agents/TODO-099/slides-report.md に変更点・検証結果・変更枚を
残し、5 行以内で完了状況・報告先・残る判断だけ返す。コミットは main が行う。
