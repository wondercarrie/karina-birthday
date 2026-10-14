// Builds the responsive photos of the site from the originals.
//
//   node build.mjs <originals-dir>
//
// The originals are not kept in the repository. They are in its history, e.g.
//   git archive 03b543a assets/img | tar -x -C /tmp/originals
//   node build.mjs /tmp/originals/assets/img
//
// Every photo is written as AVIF, WebP and JPEG (the fallback) at 1×, 2× and 3× of its largest
// display width, capped at the width of the original. After changing a width here, update the
// srcset and sizes in index.html.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = new URL('../../assets/img/', import.meta.url);

// Largest CSS width the photo is shown at (the boxes use object-fit: cover and are wider than
// the photos, so the width decides), measured at 320–1920px.
const PHOTOS = [
  { name: 'hero', source: 'hero.png', widths: [480, 720, 942] },   // 294–1104px, already upscaled on desktop
  { name: 'baby', source: 'baby.jpg', widths: [240, 480, 720] },   // 228px
  { name: 'dinner', source: 'dinner.jpg', widths: [180, 360, 540] }, // 168px
  { name: 'toast', source: 'toast.jpg', widths: [220, 440, 660] },  // 216px (168px on mobile)
  { name: 'bow', source: 'bow.jpg', widths: [300, 600, 720] },     // 284px
  { name: 'hat', source: 'hat.jpg', widths: [270, 540, 720] },     // 260px
];

// Chosen by eye and by PSNR. The hero is a lossless PNG and gets about 45 dB against the original;
// the other photos are JPEGs saved at about quality 72, so a higher quality would only keep their
// artefacts and grain at a higher cost.
const QUALITY = {
  '.png': { avif: 70, webp: 90, jpg: 88 },
  '.jpg': { avif: 60, webp: 82, jpg: 82 },
};
const FORMATS = {
  avif: (image, quality) => image.avif({ quality, effort: 6, chromaSubsampling: '4:4:4' }),
  webp: (image, quality) => image.webp({ quality, effort: 6, smartSubsample: true }),
  jpg: (image, quality) => image.jpeg({ quality, mozjpeg: true }),
};

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Usage: node build.mjs <originals-dir>');
  process.exit(1);
}

for (const { name, source, widths } of PHOTOS) {
  const input = sharp(path.join(sourceDir, source)).rotate();
  const { width: sourceWidth } = await input.metadata();
  for (const width of widths) {
    if (width > sourceWidth) throw new Error(`${source} is only ${sourceWidth}px wide, cannot make ${width}w`);
    const resized = input.clone().resize({ width, kernel: 'lanczos3' });
    for (const [extension, encode] of Object.entries(FORMATS)) {
      const file = new URL(`${name}-${width}.${extension}`, OUT);
      await encode(resized.clone(), QUALITY[path.extname(source)][extension]).toFile(file.pathname);
      const { size } = await fs.stat(file);
      console.log(`${name}-${width}.${extension}`.padEnd(20), `${(size / 1024).toFixed(1)} KB`.padStart(10));
    }
  }
}
