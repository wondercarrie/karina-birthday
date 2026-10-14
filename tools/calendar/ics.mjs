// Builds and checks the static .ics files of the "Add to calendar" menu (not part of the site).
// The event data is the EVENT object in script.js, so the site and the files cannot drift apart.
//
//   node ics.mjs build   writes assets/calendar/karina-birthday-{ru,en}.ics
//   node ics.mjs check   parses the files with ical.js and checks them against EVENT and RFC 5545
import ICAL from 'ical.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const OUT = path.join(ROOT, 'assets', 'calendar');
const LANGUAGES = ['ru', 'en'];
const UID = 'karina-birthday-2026-nostalgia@wondercarrie.github.io';
const MAX_OCTETS = 75; // RFC 5545 3.1, without the CRLF

async function readEvent() {
  const source = await fs.readFile(path.join(ROOT, 'script.js'), 'utf8');
  const match = source.match(/const EVENT = (\{[\s\S]*?\n {2}\});/);
  if (!match) throw new Error('EVENT not found in script.js');
  return new Function(`return ${match[1]};`)();
}

const icsTime = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
// RFC 5545 3.3.11: backslash, semicolon, comma and newline are escaped in TEXT values.
const escapeText = text => text.replace(/[\\;,]/g, ch => `\\${ch}`).replace(/\n/g, '\\n');

// RFC 5545 3.1: lines longer than 75 octets are folded with CRLF + space, never inside a UTF-8 character.
function fold(line) {
  const parts = [];
  let current = '';
  let limit = MAX_OCTETS;
  for (const ch of line) {
    if (Buffer.byteLength(current + ch) > limit) {
      parts.push(current);
      current = '';
      limit = MAX_OCTETS - 1; // the leading space counts
    }
    current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function buildICS(event, language, stamp) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//wondercarrie//karina-birthday//${language.toUpperCase()}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${UID}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsTime(event.start)}`,
    `DTEND:${icsTime(event.end)}`,
    `SUMMARY:${escapeText(event.title[language])}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(`${event.description[language]} ${event.url[language]}`)}`,
    `URL:${event.url[language]}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(event.title[language])}`,
    `TRIGGER:${event.reminder}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

async function build(event) {
  const stamp = icsTime(new Date().toISOString());
  await fs.mkdir(OUT, { recursive: true });
  for (const language of LANGUAGES) {
    const file = path.join(OUT, `karina-birthday-${language}.ics`);
    await fs.writeFile(file, buildICS(event, language, stamp));
    console.log(`wrote ${path.relative(ROOT, file)}`);
  }
}

async function check(event) {
  const errors = [];
  for (const language of LANGUAGES) {
    const name = `karina-birthday-${language}.ics`;
    const fail = message => errors.push(`${name}: ${message}`);
    const buffer = await fs.readFile(path.join(OUT, name));
    const text = buffer.toString('utf8');

    if (!text.endsWith('\r\n')) fail('does not end with CRLF');
    if (/[^\r]\n/.test(text)) fail('has a bare LF line break');
    text.split('\r\n').forEach((line, i) => {
      if (Buffer.byteLength(line) > MAX_OCTETS) fail(`line ${i + 1} is ${Buffer.byteLength(line)} octets`);
    });
    // Folding must not split a UTF-8 character: the unfolded text decodes cleanly.
    if (text.includes('�')) fail('has broken UTF-8');

    const vevent = new ICAL.Component(ICAL.parse(text)).getFirstSubcomponent('vevent');
    if (!vevent) { fail('no VEVENT'); continue; }
    const e = new ICAL.Event(vevent);
    const expect = (label, actual, wanted) => {
      if (actual !== wanted) fail(`${label} is ${JSON.stringify(actual)}, expected ${JSON.stringify(wanted)}`);
    };
    expect('UID', e.uid, UID);
    expect('DTSTART', e.startDate.toJSDate().toISOString(), new Date(event.start).toISOString());
    expect('DTEND', e.endDate.toJSDate().toISOString(), new Date(event.end).toISOString());
    expect('DTSTART is UTC', e.startDate.zone === ICAL.Timezone.utcTimezone, true);
    expect('SUMMARY', e.summary, event.title[language]);
    expect('LOCATION', e.location, event.location);
    expect('DESCRIPTION', e.description, `${event.description[language]} ${event.url[language]}`);
    expect('URL', vevent.getFirstPropertyValue('url'), event.url[language]);
    expect('DTSTAMP present', Boolean(vevent.getFirstPropertyValue('dtstamp')), true);
    const alarm = vevent.getFirstSubcomponent('valarm');
    expect('VALARM present', Boolean(alarm), true);
    if (alarm) {
      expect('VALARM ACTION', alarm.getFirstPropertyValue('action'), 'DISPLAY');
      expect('VALARM TRIGGER', alarm.getFirstPropertyValue('trigger').toString(), event.reminder);
    }
    console.log(`${name}: ${e.summary} | ${e.startDate.toJSDate().toISOString()} – ${e.endDate.toJSDate().toISOString()}` +
      ` | ${e.location} | alarm ${alarm?.getFirstPropertyValue('trigger')}`);
  }
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('ok');
}

const event = await readEvent();
const command = process.argv[2];
if (command === 'build') await build(event);
else if (command === 'check') await check(event);
else {
  console.error('Usage: node ics.mjs build|check');
  process.exit(2);
}
