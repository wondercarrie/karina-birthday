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
script.js               RU/EN copy, the language switcher and the reveal-on-scroll animation.
share-preview.jpg       Link preview image (og:image / twitter:image).
assets/
  img/                  Photos, the paw icon and the favicon.
  fonts/                Bundled fonts (TTF) and their SIL Open Font Licences (OFL-*.txt).
tools/visual/           Visual regression tooling (not part of the site, see below).
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
turns off animations. It then captures RU and EN full pages, the hover state of the first button
and the keyboard focus on the language switcher at 375, 768 and 1440px. Console errors and failed
requests are printed and saved to `shots/<name>/meta.json`.

Useful options:

- `WIDTHS=320,900,1200 node shoot.mjs extra` uses other viewport widths.
- `SITE_ROOT=/path/to/checkout node shoot.mjs main` shoots another checkout, e.g. a
  `git worktree` of `main`, so two versions can be compared.
- `node computed.mjs <name>` dumps the computed styles of every element at 375/768/1440, and
  `node computed.mjs --diff <a> <b>` compares two dumps. This catches changes that are not
  visible in the default state.

`compare.mjs` exits with code 1 when any screenshot differs. Expect 0 px of difference for
refactoring-only changes.

## Licences

The fonts in `assets/fonts/` (Pinyon Script, Caveat, Inter, Luxurious Script) are distributed under
the SIL Open Font License 1.1; the licence texts are next to the font files. Arial Narrow is not
bundled and is used only if it is installed on the visitor's system.
