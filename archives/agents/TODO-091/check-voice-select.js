// TODO-091 の実測用スクリプト。player.html の speechSynthesis を偽物に
// 差し替え、声の一覧・保存・復元・既定への戻りを確かめる。
// 使い方: node check-voice-select.js <case-name>
//   cases: basic / async-voices / restore / restore-async / missing /
//          switch-btn / no-localstorage / errors
const { chromium } = require('playwright');
const path = require('path');

const URL = 'file://' + path.resolve(__dirname, '../../../player.html');

const JA_VOICES = [
    { name: 'Microsoft Nanami (ja-JP)', lang: 'ja-JP' },
    { name: 'Google 日本語', lang: 'ja-JP' },
];
const EN_VOICE = { name: 'Google US English', lang: 'en-US' };

function fakeSpeechSynthesisScript(initialVoices, delayVoices) {
    return `
    (() => {
        let voices = ${JSON.stringify(initialVoices)};
        const delayed = ${JSON.stringify(delayVoices)};
        let changedHandler = null;
        window.__setVoicesLater = () => {
            voices = delayed;
            if (changedHandler) changedHandler();
        };
        // window.speechSynthesis は非 configurable/setter 無しの
        // アクセサになっていることがあり、単純な代入は非 strict でも
        // 黙って失敗することがあるため defineProperty で上書きする
        Object.defineProperty(window, 'speechSynthesis', {
            configurable: true,
            value: {
                getVoices: () => voices,
                speak: (u) => { setTimeout(() => u.onend && u.onend(), 0); },
                cancel: () => {},
                set onvoiceschanged(fn) { changedHandler = fn; },
                get onvoiceschanged() { return changedHandler; },
            },
        });
        window.SpeechSynthesisUtterance = function (text) {
            this.text = text;
        };
    })();
    `;
}

async function run(caseName) {
    const browser = await chromium.launch();
    const errors = [];
    const results = { case: caseName };

    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (e) => errors.push(String(e)));

    if (caseName === 'no-localstorage') {
        await page.addInitScript(() => {
            const throwFn = () => { throw new Error('blocked'); };
            Object.defineProperty(window, 'localStorage', {
                get() { throw new Error('blocked'); },
            });
        });
    }

    if (caseName === 'restore') {
        // 事前に localStorage へ声を覚えさせておく（別コンテキストではなく
        // addInitScript でページ読み込み前にセットする）
        await page.addInitScript((voiceName) => {
            localStorage.setItem('ytSlidePlayer.voiceEngineMode', 'speech');
            localStorage.setItem('ytSlidePlayer.voiceName', voiceName);
        }, JA_VOICES[0].name);
    }
    if (caseName === 'restore-async') {
        await page.addInitScript((voiceName) => {
            localStorage.setItem('ytSlidePlayer.voiceEngineMode', 'speech');
            localStorage.setItem('ytSlidePlayer.voiceName', voiceName);
        }, JA_VOICES[1].name);
    }
    if (caseName === 'missing') {
        await page.addInitScript(() => {
            localStorage.setItem('ytSlidePlayer.voiceEngineMode', 'speech');
            localStorage.setItem('ytSlidePlayer.voiceName', 'No Such Voice');
        });
    }

    // 声の初期状態・後から揃う声を決める
    let initial = [...JA_VOICES, EN_VOICE];
    let delayed = [...JA_VOICES, EN_VOICE];
    if (caseName === 'async-voices' || caseName === 'restore-async') {
        initial = [];
        delayed = [...JA_VOICES, EN_VOICE];
    }
    await page.addInitScript(fakeSpeechSynthesisScript(initial, delayed));

    await page.goto(URL);
    await page.waitForTimeout(200);

    if (caseName === 'async-voices' || caseName === 'restore-async') {
        results.optionsBeforeVoicesLoaded = await page.$$eval(
            '#voice-select option', (opts) => opts.map((o) => o.value));
        await page.evaluate(() => window.__setVoicesLater());
        await page.waitForTimeout(200);
    }

    results.options = await page.$$eval(
        '#voice-select option', (opts) => opts.map((o) => ({ value: o.value, text: o.textContent })));
    results.selectedValue = await page.$eval('#voice-select', (s) => s.value);
    results.selectedVoiceNameVar = await page.evaluate(() => window.selectedVoiceName);
    results.voiceEngineMode = await page.evaluate(() => window.voiceEngineMode);

    if (caseName === 'basic' || caseName === 'async-voices') {
        // 声を選んで change させ、保存されるか確認
        const targetValue = JA_VOICES[0].name;
        await page.selectOption('#voice-select', targetValue);
        await page.waitForTimeout(100);
        results.afterSelect = {
            selectedValue: await page.$eval('#voice-select', (s) => s.value),
            localStorageVoiceName: await page.evaluate(
                () => localStorage.getItem('ytSlidePlayer.voiceName')),
            localStorageEngineMode: await page.evaluate(
                () => localStorage.getItem('ytSlidePlayer.voiceEngineMode')),
        };

        // reload して復元されるか
        await page.reload();
        await page.waitForTimeout(200);
        results.afterReload = {
            selectedValue: await page.$eval('#voice-select', (s) => s.value),
            selectedVoiceNameVar: await page.evaluate(() => window.selectedVoiceName),
        };
    }

    if (caseName === 'switch-btn') {
        results.beforeClick = await page.$eval('#voice-select', (s) => s.value);
        // online -> auto のはず（既定は online）
        await page.$eval('#audio-switch-engine-btn', (b) => b.click());
        await page.waitForTimeout(50);
        results.afterClick1 = await page.$eval('#voice-select', (s) => s.value);
        await page.$eval('#audio-switch-engine-btn', (b) => b.click());
        await page.waitForTimeout(50);
        results.afterClick2 = await page.$eval('#voice-select', (s) => s.value);
    }

    results.consoleErrors = errors;

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
}

const caseName = process.argv[2] || 'basic';
run(caseName).catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
