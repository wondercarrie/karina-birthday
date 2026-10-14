// Builds tools/visual/compare.html from shots/<a>, shots/<b> and shots/diff-<b>/ (run compare.mjs first).
// Usage: node report.mjs [baseline] [current] [title]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [a = 'baseline', b = 'current', title = `${a} → ${b}`] = process.argv.slice(2);
const summary = JSON.parse(fs.readFileSync(path.join(here, 'shots', `diff-${b}`, 'summary.json'), 'utf8'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// name: <width>-<rest>.png
const groups = {};
for (const [name, info] of Object.entries(summary.files)) {
  const [width, ...rest] = name.replace('.png', '').split('-');
  (groups[width] ||= []).push({ name, kind: rest.join('-'), ...info });
}
const widths = Object.keys(groups).map(Number).sort((x, y) => x - y);
const order = k => (k.endsWith('full') ? 0 : k.includes('block') ? 1 : 2);

// Block summary table: rows = blocks, columns = width × lang.
const blockNames = [...new Set(Object.keys(summary.files).filter(n => n.includes('-block-')).map(n => n.split('-block-')[1].replace('.png', '')))];
const cols = widths.flatMap(w => ['ru', 'en'].map(l => [w, l]));
const cell = f => !f ? '<td>–</td>' : f.missing ? '<td class="bad">missing</td>'
  : `<td class="${f.diff ? 'bad' : 'ok'}">${f.diff ? f.diff.toLocaleString('en') : '0'}${f.sizeA !== f.sizeB ? `<br><small>${f.sizeA.split('x')[1]}→${f.sizeB.split('x')[1]}px</small>` : ''}</td>`;
const table = `<table><tr><th>Block</th>${cols.map(([w, l]) => `<th>${w}<br>${l}</th>`).join('')}</tr>
${blockNames.map(bn => `<tr><th>${bn}</th>${cols.map(([w, l]) => cell(summary.files[`${w}-${l}-block-${bn}.png`])).join('')}</tr>`).join('\n')}
${['hover-cta', 'focus-cta', 'focus-lang'].map(s => `<tr><th>${s}</th>${cols.map(([w, l]) => l === 'ru' ? cell(summary.files[`${w}-${s}.png`]) : '<td></td>').join('')}</tr>`).join('\n')}
</table>`;

const img = (dir, name) => `<img loading="lazy" src="shots/${dir}/${name}" alt="">`;
const sections = widths.map(w => `<section id="w${w}"><h2>${w}px</h2>
${groups[w].sort((x, y) => order(x.kind) - order(y.kind) || x.kind.localeCompare(y.kind)).map(f => `
<details${f.diff && !f.kind.includes('block') ? ' open' : ''}><summary><b>${esc(f.kind)}</b> <span class="${f.diff || f.missing ? 'bad' : 'ok'}">${f.missing ? 'missing' : f.diff ? `${f.diff.toLocaleString('en')} px` : '0 px'}</span>${f.sizeA && f.sizeA !== f.sizeB ? ` <small>${f.sizeA} → ${f.sizeB}</small>` : ''}</summary>
<div class="row"><figure><figcaption>Before (${esc(a)})</figcaption>${img(a, f.name)}</figure><figure><figcaption>After (${esc(b)})</figcaption>${img(b, f.name)}</figure><figure><figcaption>Diff</figcaption>${f.diff ? img(`diff-${b}`, f.name) : '<p class="ok">identical</p>'}</figure></div>
</details>`).join('')}</section>`).join('\n');

fs.writeFileSync(path.join(here, 'compare.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Visual compare: ${esc(title)}</title>
<style>
body{font:14px/1.5 system-ui,sans-serif;margin:0 16px 48px;color:#222;background:#fafafa}
nav{position:sticky;top:0;background:#fafafa;padding:8px 0;border-bottom:1px solid #ddd;z-index:1}
nav a{margin-right:12px}
table{border-collapse:collapse;margin:16px 0;font-size:12px}
th,td{border:1px solid #ddd;padding:4px 6px;text-align:center}
.ok{color:#2a7a2a}.bad{color:#c02230;font-weight:600}
td.bad{background:#fde8ea}
summary{cursor:pointer;padding:4px 0}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:start}
figure{margin:0}figcaption{font-weight:600;margin-bottom:4px}
.row img{width:100%;border:1px solid #ccc;background:#fff}
</style></head><body>
<h1>Visual compare: ${esc(title)}</h1>
<p>Before: <code>shots/${esc(a)}</code>, after: <code>shots/${esc(b)}</code>. Diff: pixelmatch, threshold 0, red = changed pixels. Blocks are full-width bands cropped from the full page.</p>
<nav>${widths.map(w => `<a href="#w${w}">${w}px</a>`).join('')}</nav>
<h2>Changed pixels per block</h2>${table}
${sections}
</body></html>`);
console.log('Wrote', path.join(here, 'compare.html'));
