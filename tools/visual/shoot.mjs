// Captures reference screenshots of the site served from the repo root.
// Usage: node shoot.mjs <outDirName>   (e.g. baseline, current)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// SITE_ROOT lets you shoot another checkout (e.g. a worktree of main) with the same tool.
const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(fileURLToPath(import.meta.url), '../../..');
const OUT = path.resolve(fileURLToPath(import.meta.url), '..', 'shots', process.argv[2] || 'current');
const WIDTHS = process.env.WIDTHS ? process.env.WIDTHS.split(',').map(Number) : [375, 768, 1440];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
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
const meta = { console: [], heroCurrentSrc: {}, failedRequests: [] };
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

async function open(width, query = '') {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
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
    const start = Date.now();
    while (document.querySelector('.reveal-hidden') && Date.now() - start < 5000) await new Promise(r => setTimeout(r, 50));
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
    await page.screenshot({ path: path.join(OUT, `${width}-${lang}-full.png`), fullPage: true });
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
