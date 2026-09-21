const VIEWPORT_W = process.env.VW ? parseInt(process.env.VW) : 1280;
const VIEWPORT_H = process.env.VH ? parseInt(process.env.VH) : 800;
// TODO-104 task 1: compare computed font-size of every #slide-canvas descendant
// between before (8802) and after (8801) for each existing slide deck, all slides.
const { chromium } = require('/home/ytani/.local/share/mise/installs/node/26.9.0/lib/node_modules/playwright');

const DECKS = ['claude-memo', 'developer', 'readme', 'template', 'user'];

async function collect(browser, port, deck) {
    const page = await browser.newPage({ viewport: { width: VIEWPORT_W, height: VIEWPORT_H } });
    await page.goto(`http://127.0.0.1:${port}/player.html?slides=${deck}`, { waitUntil: 'networkidle' });
    // wait for slideData to be defined and rendered
    await page.waitForFunction(() => typeof slideData !== 'undefined' && slideData.length > 0);
    const count = await page.evaluate(() => slideData.length);
    const results = [];
    for (let i = 0; i < count; i++) {
        await page.evaluate((idx) => { renderSlide(idx, true); }, i);
        await page.waitForTimeout(50);
        const data = await page.evaluate(() => {
            const canvas = document.getElementById('slide-canvas');
            if (!canvas) return null;
            const all = canvas.querySelectorAll('*');
            const out = [];
            all.forEach((el, idx) => {
                const cs = getComputedStyle(el);
                out.push({
                    idx,
                    tag: el.tagName,
                    cls: el.className && typeof el.className === 'string' ? el.className.slice(0, 60) : '',
                    fontSize: cs.fontSize,
                });
            });
            return out;
        });
        results.push({ slideIndex: i, elements: data });
    }
    await page.close();
    return results;
}

(async () => {
    const browser = await chromium.launch();
    const diffs = [];
    for (const deck of DECKS) {
        const before = await collect(browser, 8802, deck);
        const after = await collect(browser, 8801, deck);
        for (let s = 0; s < before.length; s++) {
            const bEls = before[s].elements;
            const aEls = after[s].elements;
            if (bEls.length !== aEls.length) {
                diffs.push({ deck, slide: s, issue: `element count differs: before=${bEls.length} after=${aEls.length}` });
                continue;
            }
            for (let e = 0; e < bEls.length; e++) {
                if (bEls[e].fontSize !== aEls[e].fontSize) {
                    diffs.push({
                        deck, slide: s,
                        tag: bEls[e].tag, cls: bEls[e].cls,
                        before: bEls[e].fontSize, after: aEls[e].fontSize,
                    });
                }
            }
        }
        console.log(`checked deck=${deck}, slides=${before.length}`);
    }
    await browser.close();
    console.log('=== DIFFS ===');
    console.log(JSON.stringify(diffs, null, 2));
    console.log(`total diffs: ${diffs.length}`);
})();
