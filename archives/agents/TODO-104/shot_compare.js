const { chromium } = require('/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright');
const cases = [
  { deck: 'template', slide: 1, name: 'template-s1' },
  { deck: 'template', slide: 4, name: 'template-s4' },
  { deck: 'readme', slide: 3, name: 'readme-s3' },
];
(async () => {
  const browser = await chromium.launch();
  for (const c of cases) {
    for (const [label, port] of [['before', 8802], ['after', 8801]]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(`http://127.0.0.1:${port}/player.html?slides=${c.deck}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => typeof slideData !== 'undefined');
      await page.evaluate((idx) => { renderSlide(idx, true); }, c.slide);
      await page.waitForTimeout(100);
      await page.screenshot({ path: `/home/ytani/tmp/playwright-mcp/todo104-${c.name}-${label}.png` });
      await page.close();
    }
  }
  await browser.close();
  console.log('done');
})();
