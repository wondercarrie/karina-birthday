// Checks the countdown in "When & where" with a fake clock: texts and plural forms in both languages,
// the 19:00 and 23:00 boundaries, time zones, the update on the minute and on visibilitychange,
// the layout on phones and the page without JavaScript.
// Usage: node countdown.mjs          checks, exits with 1 on a failure
//        node countdown.mjs shots    also saves the section in every state to shots/countdown/
//        node countdown.mjs video    records a minute change at 375 and 1440px to videos/
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(HERE, '../..');
const MODE = process.argv[2] || 'check';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
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
const browser = await chromium.launch();

const START = Date.parse('2026-11-28T18:00:00Z');
const END = Date.parse('2026-11-28T22:00:00Z');
const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const before = ms => new Date(START - ms);

let failures = 0;
const errors = [];
function check(ok, label, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok || !detail ? '' : ` — ${detail}`}`);
}

async function open(time, { lang = 'ru', width = 375, install = false, timezoneId, reducedMotion = 'reduce', recordVideo } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId, reducedMotion, recordVideo });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  // install: real fake timers, started a little earlier and paused at `time` once the page is loaded.
  if (install) await page.clock.install({ time: new Date(time - 30000) });
  else await page.clock.setFixedTime(time);
  await page.goto(BASE + (lang === 'en' ? '?lang=en' : ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (install) await page.clock.pauseAt(time);
  return page;
}

const text = page => page.locator('.countdown').evaluate(el => el.textContent.replace(/ /g, ' '));

// --- Texts and plural forms ------------------------------------------------
const TEXTS = [
  [before(44 * DAY + 23 * HOUR + 14 * MIN), 'До вечера осталось 44 дня 23 часа 14 минут', '44 days 23 hours 14 minutes to go'],
  [before(DAY + HOUR + MIN), 'До вечера осталось 1 день 1 час 1 минута', '1 day 1 hour 1 minute to go'],
  [before(2 * DAY + 2 * HOUR + 2 * MIN), 'До вечера осталось 2 дня 2 часа 2 минуты', '2 days 2 hours 2 minutes to go'],
  [before(5 * DAY + 5 * HOUR + 5 * MIN), 'До вечера осталось 5 дней 5 часов 5 минут', '5 days 5 hours 5 minutes to go'],
  [before(11 * DAY + 11 * HOUR + 11 * MIN), 'До вечера осталось 11 дней 11 часов 11 минут', '11 days 11 hours 11 minutes to go'],
  [before(21 * DAY + 21 * HOUR + 21 * MIN), 'До вечера осталось 21 день 21 час 21 минута', '21 days 21 hours 21 minutes to go'],
  [before(22 * DAY + 22 * HOUR + 22 * MIN), 'До вечера осталось 22 дня 22 часа 22 минуты', '22 days 22 hours 22 minutes to go'],
  [before(DAY), 'До вечера осталось 1 день 0 часов 0 минут', '1 day 0 hours 0 minutes to go'],
  [before(3 * HOUR + 14 * MIN), 'До вечера осталось 3 часа 14 минут', '3 hours 14 minutes to go'],
  [before(3 * HOUR), 'До вечера осталось 3 часа 0 минут', '3 hours 0 minutes to go'],
  [before(HOUR + 59 * MIN + 30000), 'До вечера осталось 2 часа 0 минут', '2 hours 0 minutes to go'],
  [before(59 * MIN), 'До вечера осталось 59 минут', '59 minutes to go'],
  [before(MIN + 1), 'До вечера осталось 2 минуты', '2 minutes to go'],
  [before(MIN), 'До вечера осталось 1 минута', '1 minute to go'],
  [before(1), 'До вечера осталось 1 минута', '1 minute to go'],
  [new Date(START), 'Мы уже празднуем!', 'The party is on!'],
  [new Date(END - 1), 'Мы уже празднуем!', 'The party is on!'],
  [new Date(END), 'Спасибо, что были!', 'Thank you for coming!'],
  [new Date(END + 30 * DAY), 'Спасибо, что были!', 'Thank you for coming!'],
];

if (MODE === 'check') {
  for (const [time, ru, en] of TEXTS) {
    for (const [lang, expected] of [['ru', ru], ['en', en]]) {
      const page = await open(time, { lang });
      const actual = await text(page);
      check(actual === expected, `${time.toISOString()} ${lang}: ${expected}`, `got "${actual}"`);
      await page.close();
    }
  }

  // Number and unit are joined by a non-breaking space; the lead text binds "до" to "вечера".
  {
    const page = await open(before(44 * DAY + 23 * HOUR + 14 * MIN));
    const parts = await page.locator('.countdown-part').allTextContents();
    check(parts.length === 3 && parts.every(part => /^\d+ \S+$/.test(part)), 'non-breaking space between number and unit', JSON.stringify(parts));
    check((await page.locator('.countdown-text').textContent()) === 'До вечера осталось', 'non-breaking space after "До"');
    // Switching the language rebuilds the phrase.
    await page.click('[data-language="en"]');
    check((await text(page)) === '44 days 23 hours 14 minutes to go', 'language switch to EN');
    await page.click('[data-language="ru"]');
    check((await text(page)) === 'До вечера осталось 44 дня 23 часа 14 минут', 'language switch back to RU');
    await page.close();
  }

  // The same moment in any time zone gives the same countdown.
  for (const timezoneId of ['America/Los_Angeles', 'Asia/Tokyo', 'Pacific/Kiritimati', 'Asia/Kolkata']) {
    const page = await open(before(3 * HOUR + 14 * MIN), { timezoneId });
    const actual = await text(page);
    check(actual === 'До вечера осталось 3 часа 14 минут', `time zone ${timezoneId}`, `got "${actual}"`);
    await page.close();
  }

  // Updates exactly on the minute, animates only the changed number, and crosses 19:00 and 23:00.
  {
    const page = await open(before(14 * MIN + 500), { install: true, reducedMotion: 'no-preference' });
    check((await text(page)) === 'До вечера осталось 15 минут', 'live: 15 minutes at 18:45:59.5');
    await page.clock.runFor(499);
    check((await text(page)) === 'До вечера осталось 15 минут', 'live: still 15 minutes 1 ms before the minute');
    await page.clock.runFor(1);
    check((await text(page)) === 'До вечера осталось 14 минут', 'live: 14 minutes on the minute');
    check(await page.locator('.countdown-number.is-changed').count() === 1, 'live: the changed number animates');
    await page.clock.runFor(14 * MIN - 1);
    check((await text(page)) === 'До вечера осталось 1 минута', 'live: 1 minute at 18:59:59.999');
    await page.clock.runFor(1);
    check((await text(page)) === 'Мы уже празднуем!', 'live: party at 19:00');
    await page.clock.runFor(4 * HOUR - 1);
    check((await text(page)) === 'Мы уже празднуем!', 'live: party at 22:59:59.999');
    await page.clock.runFor(1);
    check((await text(page)) === 'Спасибо, что были!', 'live: thanks at 23:00');
    // After the party no timer is left.
    const timers = await page.evaluate(() => new Promise(resolve => {
      let count = 0;
      const original = window.setTimeout;
      window.setTimeout = (...args) => { count++; return original(...args); };
      document.dispatchEvent(new Event('visibilitychange'));
      resolve(count);
    }));
    check(timers === 0, 'live: no timer after the party', `${timers} timers`);
    await page.close();
  }

  // Hours turn over on the minute too (2 hours 0 minutes → 1 hour 59 minutes).
  {
    const page = await open(before(2 * HOUR), { install: true });
    check((await text(page)) === 'До вечера осталось 2 часа 0 минут', 'live: 2 hours 0 minutes');
    await page.clock.runFor(1);
    check((await text(page)) === 'До вечера осталось 2 часа 0 минут', 'live: still 2 hours 0 minutes 1 ms later');
    await page.clock.runFor(MIN - 1);
    check((await text(page)) === 'До вечера осталось 1 час 59 минут', 'live: 1 hour 59 minutes');
    await page.close();
  }

  // A frozen background tab: the clock jumps without firing timers, visibilitychange catches up.
  {
    const page = await open(before(DAY), { install: true });
    await page.clock.setSystemTime(before(2 * HOUR + 30 * MIN));
    check((await text(page)) === 'До вечера осталось 1 день 0 часов 0 минут', 'frozen tab: stale before visibilitychange');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    check((await text(page)) === 'До вечера осталось 2 часа 30 минут', 'frozen tab: updated on visibilitychange');
    await page.close();
  }

  // Accessibility: a timer (polite announcements off by default), not focusable, no own label.
  {
    const page = await open(before(DAY));
    const a11y = await page.locator('.countdown').evaluate(el => ({
      role: el.getAttribute('role'), live: el.getAttribute('aria-live'), label: el.getAttribute('aria-label'), hidden: el.hidden,
    }));
    check(a11y.role === 'timer' && a11y.live === null && a11y.label === null && !a11y.hidden, 'role="timer", no aria-live, shown', JSON.stringify(a11y));
    await page.close();
  }

  // Without JavaScript the countdown is hidden.
  {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(BASE);
    check(!(await page.locator('.countdown').isVisible()), 'hidden without JavaScript');
    await context.close();
  }
}

// --- Layout on phones: centred, the time never wraps or overflows ----------
const LAYOUT_TIMES = {
  before: [
    before(44 * DAY + 23 * HOUR + 14 * MIN),
    before(11 * DAY + 11 * HOUR + 11 * MIN),
    before(22 * DAY + 22 * HOUR + 22 * MIN),
    before(28 * DAY + 23 * HOUR + 58 * MIN),
  ],
  during: [new Date(START + HOUR)],
  after: [new Date(END + HOUR)],
};
const WIDTHS = [320, 375, 414, 768, 1024, 1440];

if (MODE === 'check' || MODE === 'shots') {
  const out = path.join(HERE, 'shots', 'countdown');
  if (MODE === 'shots') {
    await fs.rm(out, { recursive: true, force: true });
    await fs.mkdir(out, { recursive: true });
  }
  for (const width of WIDTHS) {
    for (const lang of ['ru', 'en']) {
      for (const [state, times] of Object.entries(LAYOUT_TIMES)) {
        for (const [i, time] of times.entries()) {
          const page = await open(time, { lang, width });
          // Lines of the phrase: the lead and tail texts and the time (or the message), grouped by
          // vertical overlap. Each line must be centred; the time must sit on a single line.
          const box = await page.evaluate(() => {
            const el = document.querySelector('.countdown');
            const section = document.querySelector('.section-details').getBoundingClientRect();
            const time = el.querySelector('.countdown-time');
            const numbers = [...el.querySelectorAll('.countdown-number')].map(n => n.getBoundingClientRect());
            const pieces = [...el.querySelectorAll('.countdown-text, .countdown-time')].map(n => n.getBoundingClientRect());
            const lines = [];
            for (const r of pieces) {
              const line = lines.find(l => r.top < l.bottom - 1 && r.bottom > l.top + 1);
              if (line) Object.assign(line, { left: Math.min(line.left, r.left), right: Math.max(line.right, r.right), top: Math.min(line.top, r.top), bottom: Math.max(line.bottom, r.bottom) });
              else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
            }
            const message = el.querySelector('.countdown-message');
            if (message) for (const r of message.getClientRects()) lines.push({ left: r.left, right: r.right });
            const t = time?.getBoundingClientRect();
            return {
              timeOneLine: !time || new Set(numbers.map(n => Math.round(n.top))).size === 1,
              timeFits: !time || (t.left >= section.left && t.right <= section.right),
              lineCentres: lines.map(l => (l.left + l.right) / 2),
              sectionCentre: (section.left + section.right) / 2,
              lineCount: lines.length,
              overflow: document.documentElement.scrollWidth - innerWidth,
            };
          });
          const label = `layout ${width} ${lang} ${state}${times.length > 1 ? ` #${i + 1}` : ''}`;
          check(box.timeOneLine && box.timeFits && box.overflow === 0, `${label}: time on one line, no overflow`, JSON.stringify(box));
          check(box.lineCentres.every(c => Math.abs(c - box.sectionCentre) <= 1), `${label}: ${box.lineCount} line(s), each centred`, JSON.stringify(box));
          if (MODE === 'shots' && i === 0) {
            await page.locator('.section-details').screenshot({ path: path.join(out, `${width}-${lang}-${state}.png`) });
          }
          await page.close();
        }
      }
    }
  }
}

// --- Video of a minute change -----------------------------------------------
if (MODE === 'video') {
  const dir = path.join(HERE, 'videos');
  await fs.mkdir(dir, { recursive: true });
  for (const width of [375, 1440]) {
    const height = width < 760 ? 812 : 900;
    // 3 days 10 hours 0 minutes → 3 days 9 hours 59 minutes (two numbers), then → 58 minutes (one).
    const page = await open(before(3 * DAY + 10 * HOUR + 2000), {
      width, install: true, reducedMotion: 'no-preference',
      recordVideo: { dir, size: { width, height } },
    });
    await page.locator('.countdown').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.clock.resume();
    await page.waitForTimeout(4000);
    await page.clock.fastForward(MIN - 4000 - 2000);
    await page.waitForTimeout(4000);
    const video = page.video();
    await page.context().close();
    await fs.rename(await video.path(), path.join(dir, `countdown-minute-${width}.webm`));
    console.log(`videos/countdown-minute-${width}.webm`);
  }
}

await browser.close();
server.close();
check(errors.length === 0, 'no console errors', errors.join('; '));
if (failures) {
  console.log(`\n${failures} failed`);
  process.exit(1);
}
