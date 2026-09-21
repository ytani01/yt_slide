// TODO-092 の実測用スクリプト。ヘッダーへ移した #mute-btn の DOM 位置、
// クリック・M キーでの切り替え、消音中も自動送りが止まらないこと（TODO-084
// の再発確認）、操作パネル側の残骸の有無、コンソールエラーの有無を測る。
// 使い方: node check-mute-header.js <case-name>
//   cases: dom-order / click-toggle / key-toggle / auto-advance-while-muted /
//          panel-cleanup / errors-basic
const { chromium } = require('playwright');
const path = require('path');

const URL = 'file://' + path.resolve(__dirname, '../../../player.html');

async function run(caseName) {
    const browser = await chromium.launch();
    const errors = [];
    const page = await browser.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    // getVoices が undefined を返して例外にならないよう、最低限の
    // speechSynthesis を用意しておく（online モードが既定なので必須ではないが、
    // 念のため揃える）
    await page.addInitScript(() => {
        Object.defineProperty(window, 'speechSynthesis', {
            configurable: true,
            value: {
                getVoices: () => [],
                speak: () => {},
                cancel: () => {},
                resume: () => {},
                onvoiceschanged: null,
            },
        });
    });

    // オンライン TTS のネットワーク要求はブロックして即エラーにし、実際の
    // 音声取得を待たない（消音の切り替え検証には不要）
    await page.route('https://translate.google.com/**', (route) => route.abort());

    const results = { case: caseName };
    await page.goto(URL);
    await page.waitForTimeout(150);

    if (caseName === 'dom-order') {
        results.muteBtnCount = await page.locator('#mute-btn').count();
        results.sameParent = await page.evaluate(() => {
            const mute = document.getElementById('mute-btn');
            const select = document.getElementById('voice-select');
            return !!mute && !!select && mute.parentElement === select.parentElement;
        });
        results.muteBeforeSelect = await page.evaluate(() => {
            const mute = document.getElementById('mute-btn');
            const select = document.getElementById('voice-select');
            if (!mute || !select || mute.parentElement !== select.parentElement) return null;
            const children = Array.from(mute.parentElement.children);
            return children.indexOf(mute) < children.indexOf(select);
        });
    }

    if (caseName === 'click-toggle') {
        results.before = {
            ariaPressed: await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed')),
            iconClass: await page.$eval('#mute-icon', (i) => i.className),
        };
        await page.$eval('#mute-btn', (b) => b.click());
        results.afterClick1 = {
            ariaPressed: await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed')),
            iconClass: await page.$eval('#mute-icon', (i) => i.className),
        };
        await page.$eval('#mute-btn', (b) => b.click());
        results.afterClick2 = {
            ariaPressed: await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed')),
            iconClass: await page.$eval('#mute-icon', (i) => i.className),
        };
    }

    if (caseName === 'key-toggle') {
        // フォーカスをボタン等から外すため body をクリックしてから押す
        await page.click('body');
        results.before = await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed'));
        await page.keyboard.press('m');
        await page.waitForTimeout(50);
        results.afterM1 = await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed'));
        await page.keyboard.press('M');
        await page.waitForTimeout(50);
        results.afterM2 = await page.$eval('#mute-btn', (b) => b.getAttribute('aria-pressed'));
        results.iconAfterM1 = null; // 参考: 2 回押して戻しているので最終状態のみ見る
        results.finalIconClass = await page.$eval('#mute-icon', (i) => i.className);
    }

    if (caseName === 'auto-advance-while-muted') {
        // duration を縮めて自動送りの確認を速くする
        await page.evaluate(() => {
            if (typeof slideData !== 'undefined') {
                slideData.forEach((s) => { s.duration = 0.5; });
            }
        });
        results.currentIndexBefore = await page.evaluate(() => currentIndex);
        // 再生開始 → 直後に消音（pauseStartedAt が null の「読み上げ中」扱いの間）
        await page.$eval('#play-btn', (b) => b.click());
        await page.waitForTimeout(30);
        results.isPlayingAfterPlayClick = await page.evaluate(() => isPlaying);
        await page.$eval('#mute-btn', (b) => b.click());
        results.isMutedAfterMuteClick = await page.evaluate(() => isMuted);
        results.currentIndexJustAfterMute = await page.evaluate(() => currentIndex);
        // duration(0.5s) + pauseSeconds(既定2s) より長めに待つ
        await page.waitForTimeout(3500);
        results.currentIndexAfterWait = await page.evaluate(() => currentIndex);
        results.isPlayingAfterWait = await page.evaluate(() => isPlaying);
    }

    if (caseName === 'panel-cleanup') {
        results.muteBtnCountTotal = await page.locator('#mute-btn').count();
        results.muteBtnCountInsidePanel = await page.locator(
            '.flex.items-center.gap-2 >> #mute-btn').count(); // 参考値（厳密な絞り込みではない）
        // 操作パネル（速度・待ち・フルスクリーンのあるブロック）の中に
        // 消音ボタンの残骸（同一 id 以外の mute 関連要素）が無いか
        results.strayMuteRefs = await page.evaluate(() => {
            const html = document.body.innerHTML;
            const matches = html.match(/mute[-_]?btn|mute[-_]?icon/gi) || [];
            return matches.length; // 移設先の1組だけなら 2（mute-btn, mute-icon）のはず
        });
        results.fullscreenBtnExists = await page.locator('#fullscreen-btn').count();
        await page.$eval('#fullscreen-btn', (b) => b.click());
        results.fullscreenAriaPressedAfterClick = await page.$eval(
            '#fullscreen-btn', (b) => b.getAttribute('aria-pressed'));
    }

    results.consoleErrors = errors;
    await browser.close();
    console.log(JSON.stringify(results, null, 2));
}

const caseName = process.argv[2] || 'dom-order';
run(caseName).catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
