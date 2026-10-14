// Dumps computed styles of every element (and ::before/::after) at 375/768/1440 to shots/<name>/computed.json.
// Usage: node computed.mjs <name>; diff two dumps with: node computed.mjs --diff <a> <b>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[2] === '--diff') {
  const [a, b] = await Promise.all(process.argv.slice(3, 5).map(async n => JSON.parse(await fs.readFile(path.join(HERE, 'shots', n, 'computed.json'), 'utf8'))));
  let n = 0;
  for (const key of Object.keys(a)) {
    for (const prop of new Set([...Object.keys(a[key] || {}), ...Object.keys(b[key] || {})])) {
      if (a[key]?.[prop] !== b[key]?.[prop]) { if (n++ < 40) console.log(`${key} ${prop}: ${a[key]?.[prop]} -> ${b[key]?.[prop]}`); }
    }
  }
  console.log(n ? `COMPUTED: ${n} differences` : 'COMPUTED: IDENTICAL');
  process.exit(n ? 1 : 0);
}

const ROOT = path.resolve(HERE, '../..');
const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try { res.end(await fs.readFile(path.join(ROOT, p.endsWith('/') ? p + 'index.html' : p))); } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const out = {};
for (const width of [375, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  Object.assign(out, await page.evaluate(width => {
    const res = {};
    // Index by DOM position (tag path), not by class names, so renames don't matter.
    const all = [...document.body.querySelectorAll('*')].filter(el => el.tagName !== 'SCRIPT');
    all.forEach((el, i) => {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && cs.content === 'none') continue;
        const o = {};
        for (const prop of cs) if (!prop.startsWith('--')) o[prop] = cs.getPropertyValue(prop).replaceAll(location.origin, '');
        res[`${width} #${i} ${el.tagName.toLowerCase()}${pseudo || ''}`] = o;
      }
    });
    return res;
  }, width));
  await page.close();
}
await browser.close();
server.close();
const dir = path.join(HERE, 'shots', process.argv[2] || 'current');
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(path.join(dir, 'computed.json'), JSON.stringify(out));
console.log('elements x widths:', Object.keys(out).length);
