const { chromium } = require('/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const results = {};
  for (const [label, port] of [['before', 8802], ['after', 8801]]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await page.goto(`http://127.0.0.1:${port}/player.html?slides=sample`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof slideData !== 'undefined');
    await page.evaluate(() => { renderSlide(0, true); });
    await page.waitForTimeout(150);
    const data = await page.evaluate(() => {
      const canvas = document.getElementById('slide-canvas');
      const canvasFontSize = getComputedStyle(canvas).fontSize;
      const p = canvas.querySelector('p');
      const pFontSize = getComputedStyle(p).fontSize;
      const rect = p.getBoundingClientRect();
      const viewport = document.getElementById('player-viewport');
      const vpStyle = getComputedStyle(viewport);
      return {
        canvasFontSize,
        pFontSize,
        transform: vpStyle.transform,
        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
        text: p.textContent,
      };
    });
    results[label] = data;
    await page.screenshot({ path: `/home/ytani/tmp/playwright-mcp/todo104-sample-${label}.png` });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
