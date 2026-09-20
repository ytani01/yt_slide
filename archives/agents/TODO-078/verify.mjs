// TODO-078 verifier. 使い方: python3 -m http.server 8793 & PW_PATH=$(npm root -g)/playwright/index.mjs node verify.mjs
const { chromium } = (await import(process.env.PW_PATH)).default ?? await import(process.env.PW_PATH);
const BASE = 'http://localhost:8793/player.html';
const TTS = '**/translate.google.com/translate_tts*';
const SHOT = process.env.HOME + '/tmp/playwright-mcp/';
const wav = (() => { const n = 8000, b = Buffer.alloc(44 + n, 128);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28);
  b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40); return b; })();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (k, v) => console.log(k.padEnd(34), JSON.stringify(v));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const routeAbort = (p) => p.route(TTS, (r) => r.abort());
const route404 = (p) => p.route(TTS, (r) => r.fulfill({ status: 404, body: 'x' }));
const routeOk = (p) => p.route(TTS, (r) => r.fulfill({ contentType: 'audio/wav', body: wav }));
async function open(opts = {}, setup, init) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  const errs = [], warns = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning') warns.push(m.text().slice(0, 80)); });
  await page.addInitScript(() => {
    window.__plays = 0; window.__auds = []; window.__timers = new Set();
    const o = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays++; return (window.__playImpl || o).apply(this, arguments); };
    const A = window.Audio; window.Audio = function (...a) { const x = new A(...a); window.__auds.push(x); return x; };
    const st = window.setTimeout, ct = window.clearTimeout;
    window.setTimeout = (f, ms, ...r) => { const id = st(() => { window.__timers.delete(id); f(...r); }, ms); if (ms >= 500) window.__timers.add(id); return id; };
    window.clearTimeout = (id) => { window.__timers.delete(id); return ct(id); };
  });
  if (setup) await setup(page);
  await page.goto(BASE);
  if (init) await page.evaluate(init);
  return { page, errs, warns };
}
const S = (page) => page.evaluate(() => ({
  hidden: document.getElementById('audio-error-notice').classList.contains('hidden'),
  badge: document.getElementById('audio-status-badge').textContent,
  idx: currentIndex, engine: voiceEngineMode, ls: localStorage.getItem(SETTINGS_KEY_PREFIX + 'voiceEngineMode'),
  plays: window.__plays, auds: window.__auds.length, timers: window.__timers.size,
  nonPaused: window.__auds.filter((a) => !a.paused).length,
  sameEl: window.__auds.length <= 1,
}));
const short = 'slideData.forEach(s => s.duration = 1); pauseSeconds = 1;';

console.log('=== 1a route abort / 404');
for (const [name, r] of [['abort', routeAbort], ['404', route404]]) {
  const { page, errs, warns } = await open({}, r);
  await page.click('#play-btn'); await sleep(1500);
  log('1a ' + name, { ...(await S(page)), warns: warns.length, errs });
}
console.log('=== 1b play reject NotAllowedError');
{
  const { page, errs, warns } = await open({}, routeOk, () => { window.__playImpl = () => Promise.reject(new DOMException('x', 'NotAllowedError')); });
  await page.click('#play-btn'); await sleep(1000);
  log('1b', { ...(await S(page)), warns, errs });
}
console.log('=== 2 retry (abort persistent)');
{
  const { page } = await open({}, routeAbort);
  await page.click('#play-btn'); await sleep(1200);
  log('2 before', await S(page));
  // stopSpeech を通ることを見る: stopSpeech を包む
  await page.evaluate(() => { window.__stop = 0; const o = stopSpeech; stopSpeech = function () { window.__stop++; return o.apply(this, arguments); }; window.__plays0 = window.__plays; });
  const sync = await page.evaluate(() => { document.getElementById('audio-retry-btn').click(); return { hiddenSync: document.getElementById('audio-error-notice').classList.contains('hidden'), stop: window.__stop }; });
  log('2 right after click (sync)', sync);
  await sleep(1200);
  const s = await S(page); log('2 after fail again', { ...s, playsDelta: s.plays - await page.evaluate(() => window.__plays0) });
  // 成功する条件へ切替えて再試行 → 二重再生なし
  await page.unroute(TTS); await routeOk(page);
  for (let i = 0; i < 3; i++) { await page.click('#audio-retry-btn').catch(() => {}); await sleep(300); }
  await page.click('#audio-retry-btn').catch(() => {});
  await sleep(500);
  log('2 after ok retries', await S(page));
}
{ // retry を 3 回連続で押して有効な再生が 1 つか (成功)
  const { page } = await open({}, routeAbort);
  await page.click('#play-btn'); await sleep(1200);
  await page.unroute(TTS); await routeOk(page);
  const before = await S(page);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => document.getElementById('audio-retry-btn').click()); await sleep(100); }
  await sleep(400);
  const s = await S(page); log('2 3x retry ok', { before, after: s, newPlays: s.plays - before.plays, hidden: s.hidden });
}
console.log('=== 3 engine switch');
{
  const { page } = await open({}, routeAbort);
  await page.click('#play-btn'); await sleep(1200);
  const eng0 = await S(page);
  const r = await page.evaluate(() => { document.getElementById('audio-switch-engine-btn').click();
    return { engine: voiceEngineMode, ls: localStorage.getItem(SETTINGS_KEY_PREFIX + 'voiceEngineMode'), hidden: document.getElementById('audio-error-notice').classList.contains('hidden'),
      btnText: document.getElementById('toggle-voice-engine-btn').textContent.trim(), ind: document.getElementById('speech-status-indicator')?.textContent }; });
  log('3 before', { engine: eng0.engine, ls: eng0.ls }); log('3 after click (sync)', r);
  await sleep(1500); log('3 +1.5s', await S(page));
  const r2 = await page.evaluate(() => { document.getElementById('toggle-voice-engine-btn').click();
    return { engine: voiceEngineMode, ls: localStorage.getItem(SETTINGS_KEY_PREFIX + 'voiceEngineMode'), btnText: document.getElementById('toggle-voice-engine-btn').textContent.trim() }; });
  log('3 existing btn again', r2);
}
console.log('=== 4 timer next / manual');
for (const mode of ['timer', 'next', 'chapter']) {
  let first = true;
  const { page } = await open({}, routeAbort, short);
  await page.evaluate(() => { let n = 0; window.__playImpl = () => (n++ === 0 ? Promise.reject(new DOMException('x', 'NotAllowedError')) : new Promise(() => {})); });
  await page.click('#play-btn'); await sleep(400);
  const s0 = await S(page);
  if (mode === 'timer') {
    // duration 1 + pause 1 = 約 2 秒 (+onerror 経由の abort で先に error 済み)
    const t = Date.now(); let s;
    for (;;) { await sleep(100); s = await S(page); if (s.idx === 1 || Date.now() - t > 8000) break; }
    log('4 timer', { s0, waitedMs: Date.now() - t, s });
  } else {
    const r = await page.evaluate((m) => { if (m === 'next') nextBtn.click(); else playlistItems[3].click();
      return { hiddenSync: document.getElementById('audio-error-notice').classList.contains('hidden'), idx: currentIndex }; }, mode);
    await sleep(300); log('4 ' + mode, { s0, r, after: await S(page) });
  }
}
console.log('=== 5 no false notice');
{ // 正常
  const { page, warns } = await open({}, routeOk, short);
  await page.click('#play-btn'); await sleep(700); const a = await S(page);
  log('5 normal 0.7s', { hidden: a.hidden, badge: a.badge });
  await sleep(2500); const b = await S(page); log('5 normal +2.5s', { hidden: b.hidden, idx: b.idx, badge: b.badge, warns });
}
{ // play 成功 (stub)
  const { page } = await open({}, routeAbort, () => { window.__playImpl = () => Promise.resolve(); });
  await page.click('#play-btn'); await sleep(800); const a = await S(page);
  log('5 play resolve stub, abort TTS (onerror なので通知あり想定)', { hidden: a.hidden, badge: a.badge });
}
{ // 消音
  const { page } = await open({}, routeAbort);
  await page.click('#mute-btn'); await page.click('#play-btn'); await sleep(1200); log('5 mute(before play)', await S(page));
  await page.click('#mute-btn'); await sleep(1200); log('5 unmute (abort → 通知想定)', await S(page));
  await page.click('#mute-btn'); await sleep(300); log('5 mute again after fail', await S(page));
}
{ // 一時停止
  const { page } = await open({}, routeAbort);
  await page.click('#play-btn'); await sleep(1200); log('5 pre-pause', await S(page));
  await page.click('#play-btn'); await sleep(300); log('5 paused', await S(page));
  const { page: p2 } = await open({}, routeAbort); await sleep(800); log('5 never played', await S(p2));
}
{ // Web Speech
  const { page, warns } = await open({}, routeAbort, () => { saveSetting('voiceEngineMode', 'speech'); voiceEngineMode = 'speech'; });
  await page.click('#play-btn'); for (const t of [200, 600, 1500, 3000]) { await sleep(t === 200 ? 200 : 600); log('5 speech t~' + t, await S(page)); }
}
console.log('=== 6 stale reject');
const late = () => { let n = 0; window.__playImpl = () => (n++ <= 1 ? new Promise((_, j) => setTimeout(() => j(new DOMException('x', 'NotAllowedError')), 600)) : new Promise(() => {})); };
for (const act of ['next', 'pause', 'mute', 'none']) {
  const { page } = await open({}, routeOk, late);
  await page.click('#play-btn'); await sleep(100);
  const pre = await S(page);
  if (act === 'next') await page.click('#next-btn'); if (act === 'pause') await page.click('#play-btn'); if (act === 'mute') await page.click('#mute-btn');
  await sleep(50); const mid = await S(page);
  await sleep(900); const post = await S(page);
  log('6 ' + act, { pre: [pre.hidden, pre.timers], mid: [mid.hidden, mid.timers, mid.badge], post: [post.hidden, post.timers, post.badge, post.idx] });
}
console.log('=== 7 screenshots');
const cases = [['pc', { viewport: { width: 1280, height: 800 } }], ['phone-portrait', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['phone-landscape', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }]];
for (const [name, o] of cases) {
  for (const fs of [true, false]) {
    if (!fs && name !== 'phone-portrait') continue;
    const { page } = await open(o, routeAbort);
    await page.evaluate(() => { localStorage.setItem('showCaptions', 'true'); });
    if (fs) await page.click('#fullscreen-btn');
    await page.evaluate(() => document.getElementById('play-btn').click()); await sleep(1500);
    const m = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight;
      const q = (id) => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); const cx = r.x + r.width / 2, cy = r.y + r.height / 2; const t = document.elementFromPoint(cx, cy);
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), top: t === e || e.contains(t), inView: r.x >= 0 && r.y >= 0 && r.right <= vw && r.bottom <= vh }; };
      const n = document.getElementById('audio-error-notice'); const nr = n.getBoundingClientRect();
      const sc = document.getElementById('slide-canvas').getBoundingClientRect();
      return { vw, vh, hidden: n.classList.contains('hidden'), notice: q('audio-error-notice'), retry: q('audio-retry-btn'), sw: q('audio-switch-engine-btn'), play: q('play-btn'), next: q('next-btn'), canvas: [Math.round(sc.x), Math.round(sc.y), Math.round(sc.right), Math.round(sc.bottom)], overlapCanvas: nr.top < sc.bottom && nr.bottom > sc.top,
        scrollW: document.documentElement.scrollWidth, text: n.innerText.replace(/\n/g, '|') };
    });
    log('7 ' + name + (fs ? ' fs' : ' normal'), m);
    const f = `${SHOT}todo078-notice-${name}${fs ? '-fs' : '-normal'}.png`; await page.screenshot({ path: f }); console.log('   shot', f);
    if (fs) { // 実際に click できるか
      await page.click('#audio-retry-btn', { timeout: 2000 }).then(() => log('7 real click retry', 'ok')).catch((e) => log('7 real click retry', 'FAIL ' + e.message.slice(0, 80)));
      await page.click('#audio-switch-engine-btn', { timeout: 2000 }).then(() => log('7 real click switch', 'ok')).catch((e) => log('7 real click switch', 'FAIL ' + e.message.slice(0, 80)));
    }
  }
}
console.log('=== 8 safety timer: 失敗しても進む (abort, 既定 duration→短縮)');
{
  const { page } = await open({}, routeAbort, short);
  await page.click('#play-btn'); const t = Date.now(); let s;
  for (;;) { await sleep(100); s = await S(page); if (s.idx >= 2 || Date.now() - t > 12000) break; }
  log('8 abort', { waitedMs: Date.now() - t, idx: s.idx });
  const c = await open({}, null, short + " window.__playImpl = () => Promise.reject(new DOMException('x','NotAllowedError'));");
  await c.page.route(TTS, (r) => r.fulfill({ contentType: 'audio/wav', body: wav }));
  await c.page.click('#play-btn'); const t2 = Date.now(); let s2;
  const tl = []; for (;;) { await sleep(100); s2 = await S(c.page); if (!tl.length || tl.at(-1)[1] !== s2.idx) tl.push([Date.now() - t2, s2.idx, s2.hidden]); if (s2.idx >= 2 || Date.now() - t2 > 12000) break; }
  log('8 reject timeline [ms,idx,hidden]', tl);
  log('8 reject', { waitedMs: Date.now() - t2, idx: s2.idx });
}
await browser.close();
