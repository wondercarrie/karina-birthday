# karina-birthday

A one-page birthday invitation ("Nostalgia") for Karina's party on 28 November 2026 in Belgrade.
It is a static site with no build step, published with GitHub Pages:
<https://wondercarrie.github.io/karina-birthday/>

The page is in Russian by default and can be switched to English with the RU / EN toggle
(or `?lang=en` in the URL).

## Project structure

```
index.html              Markup. Elements with data-copy get their text from script.js.
styles.css              All styles: fonts, design tokens, reset, components, sections, media queries.
script.js               RU/EN copy, the event data (EVENT), the language switcher, the "Add to calendar"
                        menu, the countdown, the reveal-on-scroll animation, the developing polaroids and their tilt on scroll.
share-preview.jpg       Link preview image (og:image / twitter:image).
assets/
  img/                  Photos, the paw icon and the favicon.
  fonts/                Bundled fonts (TTF, Roboto Condensed as WOFF2) and their SIL Open Font Licences (OFL-*.txt).
  calendar/             The event as .ics files (RU and EN), built from EVENT in script.js.
tools/visual/           Visual regression tooling (not part of the site, see below).
tools/calendar/         Builds and checks the .ics files (not part of the site, see below).
BACKLOG.md              Known issues and improvement ideas.
```

`styles.css` is ordered top to bottom as fonts → design tokens (`:root`) → reset and base → page layout →
shared components → page sections in page order → reveal animation → tablet (761–1050px),
mobile (≤760px) and reduced-motion media queries.

Breakpoints: desktop above 1050px (content is 1200px wide at most), tablet 761–1050px, mobile up to 760px.

## Running locally

All paths are relative, so you can open `index.html` directly in a browser (Chromium-based browsers
load the fonts from `file://` without problems).

To get the same behaviour as on GitHub Pages, use any static server from the repository root:

```sh
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000/>.

## Developing polaroids

The three polaroids in the programme section start "undeveloped" (dark, blurred, cold tint) and
develop over 3.5 s. On desktop a click, Enter or Space develops a photo. On touch screens a plain
tap never develops: shaking the phone develops the most visible polaroid step by step (on iOS the
first tap only asks for the motion sensor permission), and a 1 s long press works everywhere.
The hint under each photo follows the mode (`data-develop-mode` on `<html>`). With
`prefers-reduced-motion: reduce` or without JavaScript the photos are simply shown developed.
The filter values, timings and the shake threshold are in `DEVELOP` and `SHAKE` in `script.js`.

The polaroids also behave like snapshots lying on a table. On touch screens each one tilts by up to
±4° and shifts by a few pixels while it crosses the viewport (`TILT` in `script.js`; only polaroids
near the viewport are measured, once per animation frame). On desktop (`hover: hover` and
`pointer: fine`) a hovered or focused polaroid straightens up, lifts and casts a deeper shadow
(`--polaroid-hover-*` and `--shadow-polaroid-lifted` in `styles.css`). The base angle lives in
`--polaroid-rotate`, the tilt in `transform`, the shift and lift in `translate`, and the tap nudge
animates `rotate`, so the effects add up instead of overriding each other. With reduced motion the
photos stay in their base position.

## Add to calendar

Next to "Open the map" an outlined "Add to calendar" button opens a small menu with two links:
"Apple, Outlook and others" downloads a static `.ics` file, "Google Calendar" opens Google Calendar
with the event filled in. Both links follow the page language. The menu closes on Esc (the focus
returns to the button), on a click outside and when the focus leaves it. Without JavaScript the
button is hidden.

Everything about the event (UTC start and end, location, title, description, link, reminder) lives
in `EVENT` in `script.js`. The Google link is built from it at runtime; the `.ics` files in
`assets/calendar/` are static, because iPhones open a calendar file from a server more reliably than
one generated in the page. After changing `EVENT`, rebuild and check them:

```sh
cd tools/calendar
npm install
node ics.mjs build   # writes assets/calendar/karina-birthday-{ru,en}.ics
node ics.mjs check   # parses them with ical.js and checks them against EVENT and RFC 5545
```

Google Calendar links cannot carry a reminder, so the one-day reminder is only in the `.ics` files.
Servers must send the files as `text/calendar` (GitHub Pages and `python3 -m http.server` do).

## Countdown

Between the date and venue and the buttons, "When & where" counts down to the start:
"До вечера осталось 44 дня 23 часа 14 минут" / "44 days 23 hours 14 minutes to go". Leading units that
are zero are left out, the others stay ("3 часа 0 минут"), and the minutes are rounded up, so the last
value before the start is "1 минута". From 19:00 to 23:00 Belgrade time it reads "Мы уже празднуем!" /
"The party is on!", afterwards "Спасибо, что были!" / "Thank you for coming!".

The times come from `EVENT` (UTC), so the countdown is right in any time zone. It updates exactly on
the minute (one `setTimeout` to the next minute, not an interval) and again on `visibilitychange`,
because phones freeze timers in background tabs. The phrases and unit words are in `COPY`
(`countdown-*`); the plural forms are picked with `Intl.PluralRules`. The numbers are tabular, a changed
number fades in (not with reduced motion), and the element is a `role="timer"`, which screen readers do
not announce on every change. On phones the lead text takes its own line above the numbers; the numbers
never wrap. Without JavaScript the countdown is hidden.

`tools/visual/countdown.mjs` checks it with Playwright's fake clock (see below).

## Editing text

Text for both languages lives in the `COPY` object at the top of `script.js`, keyed by the
element's `data-copy` attribute. The text in `index.html` is the Russian copy shown before the
script runs, so keep it in sync with `COPY.ru`.

## Visual regression tests

`tools/visual/` takes full-page screenshots with Playwright and compares them pixel by pixel with
pixelmatch. Use it before and after any change to markup or styles. It has its own `package.json`;
`node_modules/` and `shots/` are git-ignored.

```sh
cd tools/visual
npm install
npx playwright install chromium

node shoot.mjs baseline   # before your change
node shoot.mjs current    # after your change
node compare.mjs          # baseline vs current; diff images go to shots/diff-current/
```

`shoot.mjs` starts its own local server, waits for fonts and images, scrolls through the page and
turns off animations. At 320, 375, 414, 768, 1024 and 1440px it captures RU and EN full pages, each page
block (header, hero, intro, sections, footer) cropped from the full page, the hover and keyboard focus
of the first button and the keyboard focus on the language switcher. Console errors, failed requests
and horizontal overflow are printed and saved to `shots/<name>/meta.json`.

Useful options:

- `WIDTHS=320,900,1200 node shoot.mjs extra` uses other viewport widths.
- `SITE_ROOT=/path/to/checkout node shoot.mjs main` shoots another checkout, e.g. a
  `git worktree` of `main`, so two versions can be compared.
- `node compare.mjs <a> <b>` compares any two shot sets, also when the page height changed.
- `node report.mjs <a> <b>` then builds `tools/visual/compare.html` with before / after / diff for
  every width and state and a table of changed pixels per block, for review by eye.
- `shoot.mjs` freezes the clock at 14 October 2026, 18:46 UTC, so the countdown always shows the same
  numbers; `SHOT_TIME=<ISO time>` shoots another moment.
- `node countdown.mjs` checks the countdown with a fake clock: texts and plural forms in both languages,
  the 19:00 and 23:00 boundaries, time zones, the update on the minute and on `visibilitychange`,
  centring and wrapping at all widths, the page without JavaScript. `node countdown.mjs shots` also
  saves the section in every state to `shots/countdown/`, `node countdown.mjs video` records a minute
  change at 375 and 1440px to `videos/`.
- `node computed.mjs <name>` dumps the computed styles of every element, and
  `node computed.mjs --diff <a> <b>` compares two dumps. This catches changes that are not
  visible in the default state.

`compare.mjs` exits with code 1 when any screenshot differs. Expect 0 px of difference for
refactoring-only changes.

## Licences

The fonts in `assets/fonts/` (Pinyon Script, Caveat, Inter, Luxurious Script, Roboto Condensed) are
distributed under the SIL Open Font License 1.1; the licence texts are next to the font files.

`RobotoCondensed-Regular.woff2` is built from the variable `RobotoCondensed[wght].ttf` of
[google/fonts](https://github.com/google/fonts/tree/main/ofl/robotocondensed) with fontTools: instanced at
`wght=400` (the only weight the site uses) and subset to Latin (U+0020–017F) and Cyrillic (U+0400–045F,
U+0490–0491, incl. Serbian ј њ љ ђ ћ џ) plus common punctuation. To add characters, re-run
`fontTools.varLib.instancer` and `pyftsubset … --flavor=woff2` with a wider `--unicodes` range.
