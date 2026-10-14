// Captures reference screenshots of the site served from the repo root.
// Usage: node shoot.mjs <outDirName>   (e.g. baseline, current)
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// SITE_ROOT lets you shoot another checkout (e.g. a worktree of main) with the same tool.
const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(fileURLToPath(import.meta.url), '../../..');
const OUT = path.resolve(fileURLToPath(import.meta.url), '..', 'shots', process.argv[2] || 'current');
// The countdown in "When & where" depends on the time, so every shot is taken at the same moment
// (44 days 23 hours 14 minutes before the start). SHOT_TIME=<ISO time> shoots another moment.
const SHOT_TIME = new Date(process.env.SHOT_TIME || '2026-10-14T18:46:00Z');
const WIDTHS = process.env.WIDTHS ? process.env.WIDTHS.split(',').map(Number) : [320, 375, 414, 768, 1024, 1440];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.ics': 'text/calendar; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);
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
  // Deterministic software rasterisation: avoids ±1 colour noise on the large hero image.
  args: ['--disable-gpu', '--disable-partial-raster', '--force-color-profile=srgb', '--disable-skia-runtime-opts', '--num-raster-threads=1'],
});
const meta = { console: [], heroCurrentSrc: {}, failedRequests: [], overflow: {} };
// Page blocks, cropped from the full-page shot as full-width bands so a change can be attributed to one block.
const BLOCKS = {
  header: '.site-header', hero: '.hero', intro: '.intro', details: '.section-details',
  dress: '.section-dress', programme: '.section-programme', gifts: '.section-gifts', footer: '.site-footer',
};
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

async function open(width, query = '') {
  // Shoot with reduced motion so animations cannot disturb the comparison;
  // the style tag below still switches off anything the media query misses.
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Software rasterisation of the 3 MB hero is slow on a busy machine.
  page.setDefaultTimeout(120000);
  // Date is frozen; timers still run, so the page loads as usual.
  await page.clock.setFixedTime(SHOT_TIME);
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) meta.console.push(`${width}${query} ${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => meta.console.push(`${width}${query} pageerror: ${e.message}`));
  page.on('requestfailed', r => meta.failedRequests.push(`${width}${query} ${r.url().slice(0, 120)}`));
  page.on('response', r => { if (r.status() >= 400) meta.failedRequests.push(`${width}${query} ${r.status()} ${r.url()}`); });
  await page.goto(BASE + query, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Walk the page so lazy images load and reveal sections become visible.
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    // Date is frozen, so wait by counting steps rather than by the clock.
    for (let i = 0; i < 100 && document.querySelector('.reveal-hidden'); i++) await new Promise(r => setTimeout(r, 50));
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  return page;
}

function pad(box, p, width) {
  const x = Math.max(0, Math.floor(box.x - p)), y = Math.max(0, Math.floor(box.y - p));
  return { x, y, width: Math.min(width - x, Math.ceil(box.width + 2 * p)), height: Math.ceil(box.height + 2 * p) };
}

for (const width of WIDTHS) {
  for (const lang of ['ru', 'en']) {
    const page = await open(width, lang === 'en' ? '?lang=en' : '');
    if (lang === 'ru') {
      meta.heroCurrentSrc[width] = await page.evaluate(() => {
        const img = document.querySelector('.hero-img, .photo-birthday-png');
        return { len: img.currentSrc.length, tail: img.currentSrc.slice(-40) };
      });
      const hero = await page.evaluate(async () => {
        const src = document.querySelector('.hero-img, .photo-birthday-png').currentSrc;
        const buf = await (await fetch(src)).arrayBuffer();
        const d = await crypto.subtle.digest('SHA-256', buf);
        return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
      });
      meta.heroCurrentSrc[width].sha256 = hero;
    }
    const full = await page.screenshot({ fullPage: true });
    await fs.writeFile(path.join(OUT, `${width}-${lang}-full.png`), full);
    const rects = await page.evaluate(blocks => Object.fromEntries(Object.entries(blocks).map(([name, sel]) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return [name, { top: Math.floor(r.top + scrollY), bottom: Math.ceil(r.bottom + scrollY) }];
    })), BLOCKS);
    const png = PNG.sync.read(full);
    for (const [name, { top, bottom }] of Object.entries(rects)) {
      const height = Math.min(bottom, png.height) - top;
      const crop = new PNG({ width: png.width, height });
      PNG.bitblt(png, crop, 0, top, png.width, height, 0, 0);
      await fs.writeFile(path.join(OUT, `${width}-${lang}-block-${name}.png`), PNG.sync.write(crop));
    }
    meta.overflow[`${width}-${lang}`] = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.close();
  }

  // Hover state of the first CTA button.
  {
    const page = await open(width);
    const btn = page.locator('a[href="#details"]');
    await btn.scrollIntoViewIfNeeded();
    await btn.hover();
    await page.waitForTimeout(50);
    await page.screenshot({ path: path.join(OUT, `${width}-hover-cta.png`), clip: pad(await btn.boundingBox(), 24, width) });
    await page.close();
  }

  // Keyboard focus on the first CTA button.
  {
    const page = await open(width);
    const btn = page.locator('a[href="#details"]');
    await page.keyboard.press('Tab');
    await btn.focus();
    // focus() may scroll the button to the viewport edge; centre it so the clip is not cut off.
    await btn.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(50);
    await page.screenshot({ path: path.join(OUT, `${width}-focus-cta.png`), clip: pad(await btn.boundingBox(), 24, width) });
    await page.close();
  }

  // Keyboard focus on the language switcher.
  {
    const page = await open(width);
    await page.keyboard.press('Tab');
    const box = await page.locator('[data-language]').first().evaluate(el => {
      const r = el.parentElement.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    meta.focused = await page.evaluate(() => document.activeElement.outerHTML.slice(0, 80));
    await page.screenshot({ path: path.join(OUT, `${width}-focus-lang.png`), clip: pad(box, 16, width) });
    await page.close();
  }
}

await browser.close();
server.close();
await fs.writeFile(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));
