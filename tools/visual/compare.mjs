// Pixel-compares shots/<a> against shots/<b>. Usage: node compare.mjs [baseline] [current]
// Images of different sizes are padded (top-left aligned) and still compared; the padding counts as a difference.
// Writes diff images and summary.json to shots/diff-<b>/.
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

function padTo(img, width, height) {
  if (img.width === width && img.height === height) return img;
  const out = new PNG({ width, height });
  out.data.fill(0); // transparent: never equal to an opaque screenshot pixel
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
}

const names = [...new Set([a, b].flatMap(d => fs.readdirSync(path.join(dir, d)).filter(f => f.endsWith('.png'))))].sort();
const summary = { a, b, files: {} };
let failed = false;
for (const name of names) {
  const fileA = path.join(dir, a, name), fileB = path.join(dir, b, name);
  if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
    console.log(`${name}: MISSING in ${fs.existsSync(fileA) ? b : a}`);
    summary.files[name] = { missing: true };
    failed = true;
    continue;
  }
  let imgA = PNG.sync.read(fs.readFileSync(fileA));
  let imgB = PNG.sync.read(fs.readFileSync(fileB));
  const sizeA = `${imgA.width}x${imgA.height}`, sizeB = `${imgB.width}x${imgB.height}`;
  const width = Math.max(imgA.width, imgB.width), height = Math.max(imgA.height, imgB.height);
  imgA = padTo(imgA, width, height);
  imgB = padTo(imgB, width, height);
  const diff = new PNG({ width, height });
  const strict = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0, includeAA: true });
  const noAA = pixelmatch(imgA.data, imgB.data, null, width, height, { threshold: 0, includeAA: false });
  if (strict) { fs.writeFileSync(path.join(diffDir, name), PNG.sync.write(diff)); failed = true; }
  summary.files[name] = { diff: strict, noAA, sizeA, sizeB };
  const size = sizeA === sizeB ? sizeA : `${sizeA} -> ${sizeB}`;
  console.log(`${name.padEnd(30)} ${size.padEnd(22)} diff=${strict}  (excluding AA: ${noAA})`);
}
fs.writeFileSync(path.join(diffDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(failed ? 'RESULT: DIFFERENT' : 'RESULT: IDENTICAL');
process.exit(failed ? 1 : 0);
