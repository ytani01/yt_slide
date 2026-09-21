const { chromium } = require('/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  for (const label of ['run1','run2']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://127.0.0.1:8802/player.html?slides=readme', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof slideData !== 'undefined');
    await page.evaluate((idx) => { renderSlide(idx, true); }, 3);
    await page.waitForTimeout(100);
    await page.screenshot({ path: `/home/ytani/tmp/playwright-mcp/todo104-noise-${label}.png` });
    await page.close();
  }
  await browser.close();
})();
