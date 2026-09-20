// TODO-078: 音声の再生失敗の通知を実ブラウザで確かめる。使い方:
//   python3 -m http.server 8792 & PW_PATH=$(npm root -g)/playwright/index.mjs node implementer-check.mjs
// 実際の音声出力は確認できない（音が鳴ったかではなく DOM と変数の値を見る）。
const { chromium } = (await import(process.env.PW_PATH || 'playwright')).default ?? await import(process.env.PW_PATH || 'playwright');
const BASE = 'http://localhost:8792/player.html';
const TTS = '**/translate.google.com/translate_tts*';
// 1 秒の無音 WAV（8kHz 8bit mono）
const wav = (() => { const n = 8000, b = Buffer.alloc(44 + n, 128);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28);
  b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40); return b; })();
let fails = 0;
const ok = (c, m, v) => { if (!c) fails++; console.log((c ? 'OK   ' : 'FAIL ') + m + (v !== undefined ? '  ' + JSON.stringify(v) : '')); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (page) => page.evaluate(() => ({
  hidden: document.getElementById('audio-error-notice').classList.contains('hidden'),
  badge: document.getElementById('audio-status-badge').textContent,
  idx: currentIndex, engine: voiceEngineMode, playing: isPlaying, muted: isMuted,
  timer: slideTransitionTimeout !== null,
}));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function open(opts = {}, setup) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  if (setup) await setup(page);
  await page.goto(BASE);
  await page.evaluate(() => { window.__plays = 0; const o = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays++; return o.apply(this, arguments); }; });
  return { page, errs };
}

{ const { page } = await open({}); const d = await page.evaluate(() => getComputedStyle(document.getElementById('audio-error-notice')).display);
  ok(d === 'none', '0 既定で display:none', d); }
console.log('--- A. TTS 要求を abort ---');
{
  const { page, errs } = await open({}, (p) => p.route(TTS, (r) => r.abort()));
  await page.click('#play-btn'); await sleep(1200);
  let s = await st(page);
  ok(!s.hidden === true, 'A1 通知が出る', s); ok(s.badge === '音声エラー', 'A1 バッジが音声エラー', s.badge);
  ok(s.timer, 'A1 自動送りのタイマーが張られている');
  ok(await page.locator('#audio-error-notice').getAttribute('role') === 'status', 'A1 role=status');
  await page.evaluate(() => { window.__plays = 0; });
  await page.click('#audio-retry-btn'); await sleep(1200);
  s = await st(page);
  ok(!s.hidden && s.idx === 0, 'A2 再試行後も同じスライドで（失敗が再現して）通知が出る', s);
  ok(await page.evaluate(() => window.__plays) <= 2, 'A2 play 呼び出し回数（再試行 1 回分＋失敗）', await page.evaluate(() => window.__plays));
  await page.click('#audio-switch-engine-btn'); // Web Speech 開始前（遅延 50ms）に読む
  s = await st(page);
  ok(s.engine === 'speech' && s.hidden, 'A3 エンジン切替の直後に通知が消え speech になる', s);
  await sleep(1500); // headless には音声が無く speech も失敗し、online へ切り替わって通知が再び出る（方針 6）
  await page.click('#toggle-voice-engine-btn'); await sleep(1200);
  s = await st(page); ok(s.engine === 'online' && !s.hidden, 'A4 online に戻すと再び失敗して通知', s);
  await page.click('#next-btn'); await sleep(50);
  s = await st(page); ok(s.idx === 1 && s.hidden === false || s.idx === 1, 'A5 次へ進んだ直後', s);
  // 次スライドの失敗まで待たず、stopSpeech 直後は hidden のはず
  await page.evaluate(() => { stopSpeech(); });
  s = await st(page); ok(s.hidden, 'A5 stopSpeech で消える', s);
  ok(errs.length === 0, 'A pageerror なし', errs);
}

console.log('--- A2. 自動送りは通知中も続く ---');
{
  const { page } = await open({}, (p) => p.route(TTS, (r) => r.abort()));
  await page.evaluate(() => {});
  await page.click('#play-btn'); await sleep(800);
  await page.evaluate(() => { slideData[0].duration = 1; }); // 短くして待てるように
  await page.click('#audio-retry-btn'); await sleep(4500);
  const s = await st(page);
  ok(s.idx >= 1, 'A6 通知が出たまま次のスライドへ自動で進んだ（duration=1 秒）', s);
}

console.log('--- B. play() を reject ---');
{
  const { page } = await open({}, (p) => p.route(TTS, (r) => r.fulfill({ contentType: 'audio/wav', body: wav })));
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('x', 'NotAllowedError')); });
  await page.click('#play-btn'); await sleep(800);
  let s = await st(page); ok(!s.hidden && s.badge === '音声エラー' && s.timer, 'B1 NotAllowedError で通知＋タイマー', s);
  await page.click('#next-btn'); await sleep(50);
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('x', 'AbortError')); });
  await page.click('#next-btn'); await sleep(500);
  s = await st(page); ok(s.hidden, 'B2 AbortError では通知しない', s);
  // 古い reject: reject を遅らせ、その間に stopSpeech
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => new Promise((_, rj) => setTimeout(() => rj(new DOMException('x', 'NotAllowedError')), 400)); });
  await page.click('#next-btn'); await sleep(50);
  await page.click('#pause-btn, #play-btn'); // 一時停止
  await sleep(700);
  s = await st(page); ok(s.hidden && !s.playing && s.badge === '一時停止中', 'B3 古い reject で通知もバッジ上書きも起きない', s);
}

console.log('--- C. 正常再生・消音・一時停止 ---');
{
  const { page } = await open({}, (p) => p.route(TTS, (r) => r.fulfill({ contentType: 'audio/wav', body: wav })));
  await page.click('#play-btn'); await sleep(1000);
  let s = await st(page); ok(s.hidden && s.badge !== '音声エラー', 'C1 正常再生で通知なし', s);
  await page.click('#mute-btn'); await sleep(300);
  s = await st(page); ok(s.hidden && s.badge === '消音中', 'C2 消音で通知なし', s);
  await page.click('#mute-btn'); await sleep(800);
  await page.click('#play-btn'); await sleep(300);
  s = await st(page); ok(s.hidden && s.badge === '一時停止中', 'C3 一時停止で通知なし', s);
}
console.log('--- C2. 失敗後に復旧すると消える ---');
{
  let fail = true;
  const { page } = await open({}, (p) => p.route(TTS, (r) => fail ? r.abort() : r.fulfill({ contentType: 'audio/wav', body: wav })));
  await page.click('#play-btn'); await sleep(1000);
  let s = await st(page); ok(!s.hidden, 'C4 失敗で通知', s);
  fail = false; await page.click('#audio-retry-btn'); await sleep(1000);
  s = await st(page); ok(s.hidden && s.badge !== '音声エラー', 'C5 再試行が成功して通知が消える', s);
}

console.log('--- D. 狭い画面・擬似フルスクリーン ---');
for (const [name, vp, fs] of [['390x844', { width: 390, height: 844 }, false], ['390x844 fullscreen', { width: 390, height: 844 }, true],
  ['844x390 fullscreen', { width: 844, height: 390 }, true], ['1280x800 fullscreen', { width: 1280, height: 800 }, true]]) {
  const { page } = await open({ viewport: vp, hasTouch: vp.width < 1000, isMobile: vp.width < 1000 }, (p) => p.route(TTS, (r) => r.abort()));
  await page.click('#play-btn');
  await sleep(300);
  if (fs) { await page.click('#fullscreen-btn'); await sleep(500); }
  await sleep(800);
  const banner = await page.evaluate(() => { const b = document.getElementById('subtitle-banner').getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height), hidden: document.getElementById('subtitle-banner').classList.contains('hidden') }; });
  console.log('  (参考) 字幕バナー(既定で非表示)', name, banner);
  const r = await page.evaluate(() => {
    const out = {}; for (const id of ['audio-error-notice', 'audio-retry-btn', 'audio-switch-engine-btn']) {
      const e = document.getElementById(id), b = e.getBoundingClientRect();
      const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      out[id] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), top: t === e || e.contains(t) };
    } out.vw = innerWidth; out.vh = innerHeight; return out; });
  const inView = (b) => b.x >= 0 && b.y >= 0 && b.x + b.w <= r.vw && b.y + b.h <= r.vh;
  ok(['audio-retry-btn', 'audio-switch-engine-btn'].every((k) => r[k].top && inView(r[k])), 'D ' + name + ' ボタンが画面内で最前面', r);
}
await browser.close();
console.log(fails ? `\n${fails} 件失敗` : '\n全て OK'); process.exit(fails ? 1 : 0);
