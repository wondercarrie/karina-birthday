# Visual regression checks

Not part of the site. Run them before and after changing markup or styles.

```sh
cd tools/visual
npm install && npx playwright install chromium

node shoot.mjs baseline   # before the change
node shoot.mjs current    # after the change
node compare.mjs          # pixel diff of baseline vs current; diffs go to shots/diff-current/
```

- `shoot.mjs <name>` serves the repo root over a local HTTP server and saves, at 320/375/414/768/1024/1440px:
  full-page screenshots (RU and EN), each page block as a full-width band cropped from the full page
  (`<width>-<lang>-block-<name>.png`: header, hero, intro, details, dress, programme, gifts, footer),
  the CTA hover and keyboard-focus states and the keyboard focus on the language switcher.
  `meta.json` records console errors, failed requests and horizontal overflow per width.
  `WIDTHS=320,900 node shoot.mjs x` overrides the widths;
  `SITE_ROOT=/path/to/checkout` shoots another checkout (e.g. a `git worktree` of `main`).
  The clock is frozen at 2026-10-14T18:46:00Z, so the countdown always shows the same numbers;
  `SHOT_TIME=<ISO time>` shoots another moment.
- `countdown.mjs` checks the countdown with Playwright's fake clock (texts, plural forms, the 19:00 and
  23:00 boundaries, time zones, updates on the minute and on `visibilitychange`, layout at every width,
  no JavaScript) and exits with 1 on a failure. `countdown.mjs shots` saves the section in every state
  to `shots/countdown/`; `countdown.mjs video` records a minute change at 375 and 1440px to `videos/`.
- `compare.mjs <a> <b>` pixel-compares two shot sets. Images of different heights are padded and still
  compared. Diff images and `summary.json` go to `shots/diff-<b>/`. Exits with 1 on any difference.
- `report.mjs <a> <b> [title]` builds `compare.html` (git-ignored) from the last compare: per width and
  state, before / after / diff, plus a table of changed pixels per block. Open it in a browser from
  this folder.
- `computed.mjs <name>` dumps `getComputedStyle` of every element (same widths, `WIDTHS` and
  `SITE_ROOT` work too); `node computed.mjs --diff a b` lists every changed property.

Blocks make a diff attributable: a change in one block shifts everything below it on the full page,
but the other blocks' bands stay identical.

`shots/`, `compare.html` and `node_modules/` are git-ignored.
