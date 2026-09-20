// 縦持ち再測定。PW_PATH=... node verify-v2.mjs (http.server 8793)
const { chromium } = (await import(process.env.PW_PATH)).default ?? await import(process.env.PW_PATH);
const SHOT = process.env.HOME + '/tmp/playwright-mcp/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const R = (id) => `(() => { const e = document.getElementById('${id}'); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), top: t === e || e.contains(t), inView: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, hiddenCls: e.classList.contains('hidden') }; })()`;
async function run(name, o, fs, cap) {
  const ctx = await b.newContext(o); const page = await ctx.newPage();
  await page.addInitScript((c) => localStorage.setItem('ytSlidePlayer.showCaptions', String(c)), cap);
  await page.route('**/translate.google.com/translate_tts*', (r) => r.abort());
  await page.goto('http://localhost:8793/player.html');
  if (fs) await page.click('#fullscreen-btn');
  await page.evaluate(() => document.getElementById('play-btn').click()); await sleep(1500);
  const m = await page.evaluate(`({ notice: ${R('audio-error-notice')}, retry: ${R('audio-retry-btn')}, sw: ${R('audio-switch-engine-btn')}, sub: ${R('subtitle-banner')},
    canvas: (() => { const r = document.getElementById('slide-canvas').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; })(),
    frame: (() => { const r = document.getElementById('viewport-frame').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; })(),
    scrollW: document.documentElement.scrollWidth, vh: innerHeight })`);
  m.overlapCanvas = !(m.notice.y + m.notice.h <= m.canvas[0] || m.notice.y >= m.canvas[1]);
  m.overlapSub = !m.sub.hiddenCls && !(m.notice.y + m.notice.h <= m.sub.y || m.notice.y >= m.sub.y + m.sub.h);
  console.log(name, JSON.stringify(m));
  return page;
}
const P = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
let pg = await run('portrait fs', P, true, false); await pg.screenshot({ path: SHOT + 'todo078-notice-phone-portrait-fs-v2.png' });
for (const id of ['audio-retry-btn', 'audio-switch-engine-btn']) await pg.click('#' + id, { timeout: 2000 }).then(() => console.log('click', id, 'ok')).catch((e) => console.log('click', id, 'FAIL', e.message.slice(0, 80)));
pg = await run('portrait fs+caption', P, true, true); await pg.screenshot({ path: SHOT + 'todo078-notice-phone-portrait-fs-caption-v2.png' });
for (const id of ['audio-retry-btn', 'audio-switch-engine-btn']) await pg.click('#' + id, { timeout: 2000 }).then(() => console.log('click', id, 'ok')).catch((e) => console.log('click', id, 'FAIL', e.message.slice(0, 80)));
pg = await run('portrait normal', P, false, false); await pg.screenshot({ path: SHOT + 'todo078-notice-phone-portrait-normal-v2.png' });
await run('pc fs', { viewport: { width: 1280, height: 800 } }, true, false);
await run('landscape fs', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, true, false);
await b.close();
