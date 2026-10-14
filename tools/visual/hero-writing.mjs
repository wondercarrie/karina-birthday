// Checks the hand-written hero title. Exits with 1 on a failure.
// Usage: node hero-writing.mjs          checks
//        node hero-writing.mjs slow     loads the page on emulated Slow 4G and reports whether the title is
//                                       written or shown at once after the 1.5 s timeout (RUNS=5 per size)
//        node hero-writing.mjs video    records the animation to videos/ (375 and 1440px, RU and EN,
//                                       and a language switch while the title is being written)
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(fileURLToPath(import.meta.url), '../../..');
const VIDEOS = path.resolve(fileURLToPath(import.meta.url), '..', 'videos');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};
// Path prefixes whose responses are held back, to test the load timeout.
const slow = new Map();

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);
  const delay = [...slow].find(([prefix]) => urlPath.startsWith(prefix))?.[1];
  if (delay) await new Promise(r => setTimeout(r, delay));
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({
  // Same deterministic rasterisation as shoot.mjs, so screenshots compare to the pixel.
  args: ['--disable-gpu', '--disable-partial-raster', '--force-color-profile=srgb', '--disable-skia-runtime-opts', '--num-raster-threads=1'],
});
let failures = 0;
function check(ok, message) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (!ok) failures++;
}

async function open(width, { query = '', reducedMotion = 'no-preference', javaScriptEnabled = true, video = false, waitUntil = 'load' } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion, javaScriptEnabled,
    ...(video ? { recordVideo: { dir: VIDEOS, size: { width, height: 800 } } } : {}),
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.errors = [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) page.errors.push(m.text()); });
  page.on('pageerror', e => page.errors.push(e.message));
  await page.goto(BASE + query, { waitUntil });
  return page;
}

// State of the hero: classes, inline styles and running animations.
const state = page => page.evaluate(() => {
  const hero = document.querySelector('.hero');
  const text = hero.querySelector('.hero-text');
  const caption = hero.querySelector('.hero-caption');
  return {
    pending: hero.classList.contains('is-writing-pending'),
    masked: text.classList.contains('is-masked'),
    style: text.getAttribute('style') || '',
    animations: hero.getAnimations({ subtree: true }).length,
    textOpacity: getComputedStyle(text).opacity,
    captionOpacity: getComputedStyle(caption).opacity,
    title: hero.querySelector('.hero-title').textContent,
    caption: caption.textContent,
  };
});

const written = page => page.waitForFunction(() => {
  const hero = document.querySelector('.hero');
  return !hero.classList.contains('is-writing-pending') && !hero.getAnimations({ subtree: true }).length &&
    !hero.querySelector('.is-masked');
});
const started = page => page.waitForFunction(() => document.querySelector('.hero').getAnimations({ subtree: true }).length > 0);

async function heroShot(page) {
  await page.evaluate(() => Promise.all([document.fonts.ready, document.querySelector('.hero-img').decode()]));
  return PNG.sync.read(await page.locator('.hero').screenshot({ animations: 'disabled' }));
}

function diff(a, b) {
  if (a.width !== b.width || a.height !== b.height) return Infinity;
  return pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0 });
}

async function reference(width, lang) {
  const page = await open(width, { query: lang === 'en' ? '?lang=en' : '', reducedMotion: 'reduce' });
  const shot = await heroShot(page);
  await page.context().close();
  return shot;
}

// DevTools "Slow 4G" preset (1.6 Mbit/s down, 750 kbit/s up, 562.5 ms latency, incl. its 0.9 factor).
const SLOW_4G = { offline: false, latency: 562.5, downloadThroughput: 1.6e6 / 8 * 0.9, uploadThroughput: 750e3 / 8 * 0.9 };

if (process.argv[2] === 'slow') {
  // Does the title still get written on a slow mobile connection, or does the 1.5 s timeout win?
  // Each run is a fresh context, so nothing is cached. The local server does not gzip, unlike
  // GitHub Pages, so HTML, CSS and JS arrive a little later here than in reality.
  const RUNS = Number(process.env.RUNS || 5);
  for (const [width, dpr] of [[375, 3], [375, 2], [1440, 1]]) {
    const results = [];
    for (let run = 0; run < RUNS; run++) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: dpr, isMobile: width < 760, hasTouch: width < 760 });
      const page = await context.newPage();
      page.setDefaultTimeout(60000);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
      // script.js runs at the end of <body>, so the race of the photo and the font against the
      // timeout has started by DOMContentLoaded. Written: animations appear once the hero is no
      // longer pending. Timeout: pending is removed without any animation.
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const outcome = await (await page.waitForFunction(() => {
        const hero = document.querySelector('.hero');
        if (!hero || hero.classList.contains('is-writing-pending')) return false;
        return hero.getAnimations({ subtree: true }).length ? 'written' : 'timeout';
      }, null, { polling: 'raf' })).jsonValue();
      const at = await page.evaluate(() => Math.round(performance.now()));
      await page.waitForLoadState('load');
      const timing = await page.evaluate(() => {
        const photo = document.querySelector('.hero-img');
        const entry = performance.getEntriesByName(photo.currentSrc)[0];
        const script = performance.getEntriesByType('resource').find(e => e.name.endsWith('script.js'));
        const dcl = performance.getEntriesByType('navigation')[0].domContentLoadedEventStart;
        return { photo: photo.currentSrc.split('/').pop(), photoEnd: Math.round(entry?.responseEnd ?? -1), scriptEnd: Math.round(script?.responseEnd ?? -1), dcl: Math.round(dcl) };
      });
      results.push({ outcome, at, ...timing });
      await context.close();
    }
    const written = results.filter(r => r.outcome === 'written').length;
    console.log(`${width}px @${dpr}x  written ${written}/${RUNS}  (${results[0].photo})`);
    for (const r of results) console.log(`  ${r.outcome.padEnd(7)} at ${r.at} ms · script.js ${r.scriptEnd} ms · DOMContentLoaded ${r.dcl} ms · photo ${r.photoEnd} ms`);
  }
} else if (process.argv[2] === 'video') {
  await fs.mkdir(VIDEOS, { recursive: true });
  const record = async (name, width, query, during) => {
    const page = await open(width, { query, video: true });
    await started(page);
    if (during) await during(page);
    await written(page);
    await page.waitForTimeout(500);
    const video = page.video();
    await page.context().close();
    await fs.rename(await video.path(), path.join(VIDEOS, `${name}.webm`));
    console.log(`videos/${name}.webm`);
  };
  for (const width of [375, 1440]) {
    for (const lang of ['ru', 'en']) await record(`hero-writing-${lang}-${width}`, width, lang === 'en' ? '?lang=en' : '');
    await record(`hero-writing-switch-${width}`, width, '', async page => {
      await page.waitForTimeout(1200);
      await page.click('[data-language="en"]');
      await page.waitForTimeout(1500);
      await page.click('[data-language="ru"]');
    });
  }
} else {
  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    for (const lang of ['ru', 'en']) {
      const query = lang === 'en' ? '?lang=en' : '';
      const ref = await reference(width, lang);

      // Reduced motion: shown at once, nothing animates.
      {
        const page = await open(width, { query, reducedMotion: 'reduce' });
        await page.waitForLoadState('load');
        const s = await state(page);
        check(!s.pending && !s.animations && s.textOpacity === '1' && s.captionOpacity === '1',
          `${width} ${lang} reduced motion: title and caption shown at once`);
        await page.context().close();
      }

      // Full animation: hidden until ready, then the end state is the static hero to the pixel.
      {
        const page = await open(width, { query });
        const early = await state(page);
        check(early.pending && early.textOpacity === '0' && early.captionOpacity === '0',
          `${width} ${lang} hidden while the font and the photo load`);
        await started(page);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        check(overflow === 0, `${width} ${lang} no horizontal overflow while writing (${overflow} px)`);
        await written(page);
        const s = await state(page);
        check(!s.masked && !s.style, `${width} ${lang} mask and classes removed at the end`);
        const d = diff(await heroShot(page), ref);
        check(d === 0, `${width} ${lang} end state equals the static hero (${d} px)`);
        check(!page.errors.length, `${width} ${lang} console clean ${page.errors.join(' | ')}`);
        await page.context().close();
      }
    }

    // Language switch while writing and after: the animation keeps going, runs once, ends as static.
    {
      const page = await open(width);
      await started(page);
      await page.waitForTimeout(900);
      const before = await page.evaluate(() => document.querySelector('.hero').getAnimations({ subtree: true }).map(a => a.currentTime));
      await page.click('[data-language="en"]');
      const after = await page.evaluate(() => document.querySelector('.hero').getAnimations({ subtree: true }).map(a => a.currentTime));
      check(before.length === 3 && after.length === 3 && after.every((t, i) => t >= before[i]),
        `${width} switch while writing: same animations continue (${before.map(Math.round)} → ${after.map(Math.round)})`);
      await page.waitForTimeout(700);
      await page.click('[data-language="ru"]');
      await page.waitForTimeout(300);
      await page.click('[data-language="en"]');
      await written(page);
      const s = await state(page);
      check(s.title === 'Nostalgia' && s.caption.startsWith('by the way'), `${width} switch while writing: EN text in place`);
      check(diff(await heroShot(page), await reference(width, 'en')) === 0, `${width} switch while writing: end state equals static EN hero`);
      await page.click('[data-language="ru"]');
      const again = await state(page);
      check(!again.animations && !again.pending && !again.masked, `${width} switch after writing: nothing replays`);
      check(diff(await heroShot(page), await reference(width, 'ru')) === 0, `${width} switch after writing: equals static RU hero`);
      check(!page.errors.length, `${width} switch: console clean ${page.errors.join(' | ')}`);
      await page.context().close();
    }
  }

  // Load timeout: if the photo or the font is late, everything is shown at once after 1.5 s.
  // Every hero size and format (the page picks one by width and browser support).
  for (const late of ['/assets/img/hero-', '/assets/fonts/PinyonScript-Regular.woff2']) {
    slow.set(late, 3000);
    const page = await open(375, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const waiting = await state(page);
    await page.waitForTimeout(800);
    const s = await state(page);
    check(waiting.pending && !s.pending && !s.animations && s.textOpacity === '1' && s.captionOpacity === '1',
      `late ${path.basename(late)}: shown without animation after the timeout`);
    await page.waitForTimeout(2500);
    const later = await state(page);
    check(!later.animations && !later.masked, `late ${path.basename(late)}: no animation when it arrives`);
    await page.context().close();
    slow.delete(late);
  }

  // Without JavaScript the title and the caption are visible.
  {
    const page = await open(375, { javaScriptEnabled: false });
    await page.waitForLoadState('load');
    const s = await state(page);
    check(s.textOpacity === '1' && s.captionOpacity === '1' && !s.pending, 'no JavaScript: title and caption visible');
    await page.context().close();
  }
}

await browser.close();
server.close();
if (failures) {
  console.log(`${failures} failure(s)`);
  process.exit(1);
}
