# TODO-081 verifier 報告

方法: python3 http.server + Playwright(chromium)、`player.html?slides=user`、1280x720 と 390x844。スクリプトは scratchpad の v.js（コードは変更していない）。

変更ファイル: `slides/user.js` のみ（git status / diff とも指示範囲。9 枚目の 2 カードの div→a、6 行ずつ）。

1. href/target/rel: 両サイズで一致。
   - a[0] href=https://github.com/ytani01/yt_slide/blob/main/slides/claude-memo.js target=_blank rel=noopener
   - a[1] href=https://github.com/ytani01/yt_slide/blob/main/docs/User.md target=_blank rel=noopener
2. クリック: a[0] クリック前後とも slide-num=09、play-btn aria-label=再生、icon=fa-play（変化なし）。新しいタブが開き URL は各リンク先（a[0], a[1] とも確認）。
   比較対象として同じスライドの h2 をクリックすると aria-label=一時停止 / fa-pause になり、click ハンドラ自体は生きていることを確認。
   注記: 今回の diff は各 <a> に onclick="event.stopPropagation()" も付けている（指示の記述に無い）。これが効いているかを onclick 無しで比較する試験はしていない。
3. 見た目: 両サイズとも 2 カードは不透明・欠け無し。text-decoration-line=none、文字色 rgb(241,245,249)（青リンク色ではない）、opacity=1。スクリーンショット目視でも崩れ無し。390 幅は文字が小さいがカードは 2 列で収まる（変更前との比較はしていない）。
   - ~/tmp/playwright-mcp/TODO-081-slide9-1280x720.png
   - ~/tmp/playwright-mcp/TODO-081-slide9-390x844.png
4. 全 15 枚を next で順に描画: 両サイズともコンソールエラー・pageerror 0 件。各枚の innerText 長 48,56,64,118,137,74,125,99,69,81,100,67,196,164,159（変更前との突き合わせはしていない）。

確かめていない/判断できない: リンク先が実在するか（外部通信不要との指示）、キーボード操作(Tab/Enter)、タッチのタップ経路（マウスクリックのみ）、変更前の版との画像比較。
