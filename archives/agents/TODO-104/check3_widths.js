const { chromium } = require('/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright');
const widths = [];
for (let w = 760; w <= 1300; w += 10) widths.push(w);
// ensure key breakpoints included
for (const w of [767, 768, 1023, 1024, 1280]) if (!widths.includes(w)) widths.push(w);
widths.sort((a,b)=>a-b);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 800, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  await page.goto('http://127.0.0.1:8801/player.html?slides=sample', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof slideData !== 'undefined');
  const rows = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(30);
    const fs = await page.evaluate(() => getComputedStyle(document.getElementById('slide-canvas')).fontSize);
    const px = parseFloat(fs);
    rows.push({ width: w, fontSize: fs, px });
  }
  await browser.close();
  const under16 = rows.filter(r => r.px < 16);
  console.log(JSON.stringify(rows, null, 2));
  console.log('under16:', JSON.stringify(under16));
})();
