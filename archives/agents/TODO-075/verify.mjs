// TODO-075 verifier 用スクリプト。player.html を実際にブラウザで開いて
// localStorage による設定の保存・復元を確かめる。コードは変更しない。
import { chromium } from 'playwright';

const BASE = 'http://localhost:8791/player.html';

function log(title) {
  console.log('\n=== ' + title + ' ===');
}

async function readState(page) {
  return page.evaluate(() => ({
    speedSelectValue: document.getElementById('speed-select').value,
    pauseSelectValue: document.getElementById('pause-select').value,
    captionPressed: document.getElementById('toggle-caption-btn').getAttribute('aria-pressed'),
    subtitleBannerHidden: document.getElementById('subtitle-banner').classList.contains('hidden'),
    speechStatusText: document.getElementById('speech-status-indicator').textContent,
    // internal vars (exposed via window for verification only, not modified in source)
    playbackRate: typeof playbackRate !== 'undefined' ? playbackRate : undefined,
    pauseSeconds: typeof pauseSeconds !== 'undefined' ? pauseSeconds : undefined,
    showCaptions: typeof showCaptions !== 'undefined' ? showCaptions : undefined,
    voiceEngineMode: typeof voiceEngineMode !== 'undefined' ? voiceEngineMode : undefined,
    totalTimeDisplay: document.getElementById('total-time-display').textContent,
  }));
}

async function dumpLocalStorage(page) {
  return page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  });
}

const browser = await chromium.launch();
const results = {};

// --- 1. 保存と復元 ---
{
  log('1. 保存と復元');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push('console.error: ' + msg.text()); });

  await page.goto(BASE);
  await page.waitForSelector('#speed-select');

  await page.selectOption('#speed-select', '1.5');
  await page.selectOption('#pause-select', '3');
  await page.click('#toggle-caption-btn');
  await page.click('#toggle-voice-engine-btn'); // online -> speech

  const beforeReload = await readState(page);
  const lsBefore = await dumpLocalStorage(page);
  console.log('before reload state:', JSON.stringify(beforeReload));
  console.log('localStorage before reload:', JSON.stringify(lsBefore));

  await page.reload();
  await page.waitForSelector('#speed-select');

  const afterReload = await readState(page);
  const lsAfter = await dumpLocalStorage(page);
  console.log('after reload state:', JSON.stringify(afterReload));
  console.log('localStorage after reload:', JSON.stringify(lsAfter));
  console.log('console errors:', JSON.stringify(consoleErrors));

  results.saveRestore = { beforeReload, afterReload, lsBefore, lsAfter, consoleErrors };
  await context.close();
}

// --- 2. 不正な保存値 ---
{
  log('2. 不正な保存値');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForSelector('#speed-select');
  await page.evaluate(() => {
    localStorage.setItem('ytSlidePlayer.speed', '3');
    localStorage.setItem('ytSlidePlayer.pauseSeconds', '99');
    localStorage.setItem('ytSlidePlayer.voiceEngineMode', 'bogus');
    localStorage.setItem('ytSlidePlayer.showCaptions', 'yes');
  });
  await page.reload();
  await page.waitForSelector('#speed-select');
  const invalidState = await readState(page);
  console.log('invalid values -> state:', JSON.stringify(invalidState));
  results.invalidValues = invalidState;

  // 空文字ケース
  await page.evaluate(() => {
    localStorage.setItem('ytSlidePlayer.speed', '');
    localStorage.setItem('ytSlidePlayer.pauseSeconds', '');
    localStorage.setItem('ytSlidePlayer.voiceEngineMode', '');
    localStorage.setItem('ytSlidePlayer.showCaptions', '');
  });
  await page.reload();
  await page.waitForSelector('#speed-select');
  const emptyState = await readState(page);
  console.log('empty string values -> state:', JSON.stringify(emptyState));
  results.emptyValues = emptyState;

  await context.close();
}

// --- 3. localStorage が使えない環境 ---
{
  log('3. localStorage が使えない環境');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new Error('localStorage disabled for test'); },
    });
  });
  await page.goto(BASE);
  let loadedOk = true;
  try {
    await page.waitForSelector('#speed-select', { timeout: 5000 });
  } catch (e) {
    loadedOk = false;
  }
  const state = loadedOk ? await readState(page) : null;
  console.log('loaded ok:', loadedOk);
  console.log('state (localStorage disabled):', JSON.stringify(state));
  console.log('pageErrors:', JSON.stringify(pageErrors));
  console.log('consoleErrors:', JSON.stringify(consoleErrors));
  results.localStorageDisabled = { loadedOk, state, pageErrors, consoleErrors };
  await context.close();
}

// --- 4. 待ち秒数が尺に反映されるか ---
{
  log('4. 待ち秒数が尺に反映されるか (pause=2 baseline)');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForSelector('#speed-select');
  // ensure default pause=2 (clear any leftover storage)
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#speed-select');
  const totalAtPause2 = await page.textContent('#total-time-display');
  const slideCount = await page.evaluate(() => (typeof slideData !== 'undefined' ? slideData.length : undefined));
  console.log('pause=2 total-time-display:', totalAtPause2, 'slideCount:', slideCount);

  await page.evaluate(() => localStorage.setItem('ytSlidePlayer.pauseSeconds', '3'));
  await page.reload();
  await page.waitForSelector('#speed-select');
  const totalAtPause3 = await page.textContent('#total-time-display');
  console.log('pause=3 total-time-display:', totalAtPause3);

  results.pauseTimeline = { totalAtPause2, totalAtPause3, slideCount };
  await context.close();
}

// --- 5. 既存の挙動 ---
{
  log('5. 既存の挙動（復元後の操作）');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForSelector('#speed-select');
  await page.evaluate(() => localStorage.clear());
  await page.selectOption('#speed-select', '1.5');
  await page.selectOption('#pause-select', '3');
  await page.click('#toggle-caption-btn');
  await page.reload();
  await page.waitForSelector('#speed-select');

  const idxBefore = await page.evaluate(() => currentIndex);
  await page.click('#next-btn');
  const idxAfterNext = await page.evaluate(() => currentIndex);
  await page.click('#prev-btn');
  const idxAfterPrev = await page.evaluate(() => currentIndex);

  // seekbar click (middle)
  const box = await page.locator('#seekbar-container').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const idxAfterSeek = await page.evaluate(() => currentIndex);

  // playlist item click (index 2 if exists)
  const playlistCount = await page.locator('#playlist-items > *').count();
  let idxAfterPlaylistClick = null;
  if (playlistCount > 2) {
    await page.locator('#playlist-items > *').nth(2).click();
    idxAfterPlaylistClick = await page.evaluate(() => currentIndex);
  }

  // play then change speed/pause mid-play
  await page.click('#play-btn');
  await page.waitForTimeout(300);
  const isPlayingAfterClick = await page.evaluate(() => isPlaying);
  const totalBeforeChange = await page.textContent('#total-time-display');
  await page.selectOption('#pause-select', '2');
  await page.waitForTimeout(100);
  const totalAfterChange = await page.textContent('#total-time-display');
  await page.click('#play-btn'); // pause again

  results.existingBehavior = {
    idxBefore, idxAfterNext, idxAfterPrev, idxAfterSeek,
    playlistCount, idxAfterPlaylistClick,
    isPlayingAfterClick, totalBeforeChange, totalAfterChange,
  };
  console.log(JSON.stringify(results.existingBehavior, null, 2));

  await context.close();
}

await browser.close();

console.log('\n\n=== SUMMARY (JSON) ===');
console.log(JSON.stringify(results, null, 2));
