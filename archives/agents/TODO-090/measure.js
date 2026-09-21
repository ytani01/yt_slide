// TODO-090 実測スクリプト。player.html?slides=_test-duration (or
// _test-duration-omit) に対して duration を下振れ・上振れ・省略させたときの
// 挙動を Playwright で測る。
//
// 使い方:
//   1. リポジトリのルートで `python3 -m http.server 8791` を立てる
//   2. `slides/_test-duration.js`・`slides/_test-duration-omit.js` を置く
//      （archives/agents/TODO-090/verifier-report.md の説明を参照）
//   3. node archives/agents/TODO-090/measure.js <scenario>
//      scenario: audio-under | audio-over | muted | muted-rate | omit
//
// 出力: slide-num の変化、進行バー(%)、残り時間表示を Date.now() とともに
// stdout へ JSON で出す。

const { chromium } = require('playwright');

const scenario = process.argv[2];
if (!scenario) {
    console.error('usage: node measure.js <audio-under|audio-over|muted|muted-rate|omit>');
    process.exit(1);
}
const slidesName = scenario === 'omit' ? '_test-duration-omit' : '_test-duration';
const BASE = `http://localhost:8791/player.html?slides=${slidesName}`;

async function main() {
    const browser = await chromium.launch({
        args: [
            '--autoplay-policy=no-user-gesture-required',
            '--use-fake-ui-for-media-stream',
        ],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const log = [];
    const t0 = Date.now();

    page.on('console', msg => {
        // ブラウザ側の console.warn なども拾っておく（TTS エラー等の手がかり）
        log.push({ t: Date.now() - t0, type: 'console', text: msg.text() });
    });

    await page.goto(BASE);
    await page.waitForSelector('#slide-num');

    // slide-num / progress-bar / current-time-display の変化を MutationObserver で拾う
    await page.evaluate(() => {
        window.__log = [];
        const push = (kind) => {
            window.__log.push({
                t: performance.now(),
                kind,
                slideNum: document.getElementById('slide-num').textContent,
                progressPct: document.getElementById('progress-bar').style.width,
                currentTime: document.getElementById('current-time-display').textContent,
                totalTime: document.getElementById('total-time-display').textContent,
                audioStatus: document.getElementById('audio-status-badge').textContent,
            });
        };
        push('init');
        const mo = new MutationObserver(() => push('slide-num-change'));
        mo.observe(document.getElementById('slide-num'), { childList: true, characterData: true, subtree: true });
        // 1 秒おきにも記録（進行バー・残り時間のドリフトを見るため）
        window.__interval = setInterval(() => push('tick'), 1000);
    });

    if (scenario === 'audio-under') {
        // slide 0: duration=2, 実際のナレーションは長め
        await page.evaluate(() => window.renderSlide(0));
        await page.click('#play-btn');
        await page.waitForTimeout(20000);
    } else if (scenario === 'audio-over') {
        // slide 1: duration=40, 実際のナレーションは短い
        await page.evaluate(() => window.renderSlide(1));
        await page.click('#play-btn');
        await page.waitForTimeout(15000);
    } else if (scenario === 'muted') {
        await page.evaluate(() => window.renderSlide(0));
        await page.click('#play-btn');
        await page.click('#mute-btn');
        await page.waitForTimeout(8000);
    } else if (scenario === 'muted-rate') {
        const options = await page.$$eval('#speed-select option', os => os.map(o => o.value));
        const fastest = options[options.length - 1];
        log.push({ note: 'speed-options', options, chosen: fastest });
        await page.evaluate(() => window.renderSlide(0));
        await page.selectOption('#speed-select', fastest);
        await page.click('#play-btn');
        await page.click('#mute-btn');
        await page.waitForTimeout(6000);
    } else if (scenario === 'omit') {
        await page.evaluate(() => window.renderSlide(0));
        await page.click('#play-btn');
        await page.waitForTimeout(10000);
    } else {
        throw new Error(`unknown scenario: ${scenario}`);
    }

    const browserLog = await page.evaluate(() => {
        clearInterval(window.__interval);
        return window.__log;
    });

    console.log(JSON.stringify({ scenario, log, browserLog }, null, 2));
    await browser.close();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
