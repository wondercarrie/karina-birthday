// Pixel-compares shots/<a> against shots/<b>. Usage: node compare.mjs [baseline] [current]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(fileURLToPath(import.meta.url), '..', 'shots');
const [a = 'baseline', b = 'current'] = process.argv.slice(2);
const diffDir = path.join(dir, `diff-${b}`);
fs.rmSync(diffDir, { recursive: true, force: true });
fs.mkdirSync(diffDir, { recursive: true });
let failed = false;
for (const name of fs.readdirSync(path.join(dir, a)).filter(f => f.endsWith('.png')).sort()) {
  const imgA = PNG.sync.read(fs.readFileSync(path.join(dir, a, name)));
  const fileB = path.join(dir, b, name);
  if (!fs.existsSync(fileB)) { console.log(`${name}: MISSING`); failed = true; continue; }
  const imgB = PNG.sync.read(fs.readFileSync(fileB));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    console.log(`${name}: SIZE ${imgA.width}x${imgA.height} -> ${imgB.width}x${imgB.height}`); failed = true; continue;
  }
  const diff = new PNG({ width: imgA.width, height: imgA.height });
  const strict = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0, includeAA: true });
  const noAA = pixelmatch(imgA.data, imgB.data, null, imgA.width, imgA.height, { threshold: 0, includeAA: false });
  if (strict) { fs.writeFileSync(path.join(diffDir, name), PNG.sync.write(diff)); failed = true; }
  console.log(`${name.padEnd(22)} ${imgA.width}x${imgA.height}  diff=${strict}  (excluding AA: ${noAA})`);
}
console.log(failed ? 'RESULT: DIFFERENT' : 'RESULT: IDENTICAL');
process.exit(failed ? 1 : 0);
