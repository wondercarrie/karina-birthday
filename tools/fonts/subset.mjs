// Subsets the bundled fonts to the characters the page actually renders with them.
//
//   node subset.mjs build <originals-dir>   writes assets/fonts/<name>.woff2 from the TTFs
//   node subset.mjs check                   fails if the page uses a character a subset lacks
//
// The characters are collected in Chromium from the rendered page in every language, per computed
// font family (text-transform applied), including the hidden develop hints. Run `check` after
// editing any text set in these fonts, and `build` if it fails.
//
// The original TTFs are not kept in the repository. They are in its history, e.g.
//   git archive 03b543a assets/fonts | tar -x -C /tmp/originals
//   node subset.mjs build /tmp/originals/assets/fonts
//
// Needs Python 3 with fontTools and brotli (pip install fonttools brotli); PYTHON=<path> picks
// another interpreter, e.g. one from a virtualenv.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const FONTS = path.join(ROOT, 'assets/fonts');
const PYTHON = process.env.PYTHON || 'python3';
const LANGUAGES = ['ru', 'en'];

// Font family as in styles.css → file name without extension.
// Roboto Condensed is subset by a fixed range instead (see README), because it sets all the body copy.
const SUBSETS = {
  'Pinyon Script-Regular': 'PinyonScript-Regular',
  'Caveat-Regular': 'Caveat-Regular',
  'Inter-Medium': 'Inter-Medium',
  'Luxurious Script-Regular': 'LuxuriousScript-Regular',
};
// Always kept: the space and the no-break space, so a new &nbsp; never falls back to another font.
const ALWAYS = '  ';
// Characters the original font does not have; the browser draws them with a fallback font.
const FALLBACK = { 'Inter-Medium': '✦' };

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
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

async function collectCharacters() {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const used = Object.fromEntries(Object.keys(SUBSETS).map(family => [family, new Set(ALWAYS)]));
  for (const language of LANGUAGES) {
    const page = await browser.newPage();
    await page.goto(`${base}?lang=${language}`);
    const texts = await page.evaluate(() => {
      const found = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node; (node = walker.nextNode());) {
        const style = getComputedStyle(node.parentElement);
        const family = style.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
        let text = node.data;
        if (style.textTransform === 'uppercase') text = text.toUpperCase();
        if (style.textTransform === 'lowercase') text = text.toLowerCase();
        found.push([family, text]);
      }
      return found;
    });
    for (const [family, text] of texts) {
      if (!used[family]) continue;
      for (const char of text.replace(/[\n\r\t]/g, '')) {
        if (!FALLBACK[family]?.includes(char)) used[family].add(char);
      }
    }
    await page.close();
  }
  await browser.close();
  server.close();
  return used;
}

const codepoints = chars => [...chars].map(c => c.codePointAt(0)).sort((a, b) => a - b);
const hex = cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

const [command, originals] = process.argv.slice(2);
if (command === 'build' && originals) {
  const used = await collectCharacters();
  for (const [family, name] of Object.entries(SUBSETS)) {
    const unicodes = codepoints(used[family]).map(hex).join(',');
    const output = path.join(FONTS, `${name}.woff2`);
    // fontTools keeps the features browsers apply by default (kern, liga, calt, locl…) and the
    // hinting, so the glyphs render exactly as with the TTF. styles.css enables no other feature;
    // if it ever does (font-variant, font-feature-settings), add it with --layout-features+=<tag>.
    execFileSync(PYTHON, ['-m', 'fontTools.subset', path.join(originals, `${name}.ttf`),
      `--unicodes=${unicodes}`, '--flavor=woff2', `--output-file=${output}`]);
    const { size } = await fs.stat(output);
    console.log(`${name}.woff2`.padEnd(30), `${(size / 1024).toFixed(1)} KB`.padStart(9), ` ${[...used[family]].sort().join('')}`);
  }
} else if (command === 'check') {
  const used = await collectCharacters();
  let missing = 0;
  for (const [family, name] of Object.entries(SUBSETS)) {
    const cmap = JSON.parse(execFileSync(PYTHON, ['-c',
      'import sys, json; from fontTools.ttLib import TTFont; print(json.dumps(list(TTFont(sys.argv[1]).getBestCmap())))',
      path.join(FONTS, `${name}.woff2`)]));
    const lacking = codepoints(used[family]).filter(cp => !cmap.includes(cp));
    missing += lacking.length;
    console.log(`${name}.woff2`.padEnd(30), lacking.length ? `MISSING ${lacking.map(cp => `${String.fromCodePoint(cp)} ${hex(cp)}`).join(', ')}` : 'ok');
  }
  process.exit(missing ? 1 : 0);
} else {
  console.error('Usage: node subset.mjs build <originals-dir> | node subset.mjs check');
  process.exit(1);
}
