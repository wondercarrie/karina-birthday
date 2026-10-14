# Visual regression checks

Not part of the site. Run them before and after changing markup or styles.

```sh
cd tools/visual
npm install && npx playwright install chromium

node shoot.mjs baseline   # before the change
node shoot.mjs current    # after the change
node compare.mjs          # pixel diff of baseline vs current; diffs go to shots/diff-current/
```

- `shoot.mjs <name>` serves the repo root over a local HTTP server and saves full-page screenshots
  (RU and EN), the CTA hover state and the keyboard focus on the language switcher.
  `WIDTHS=320,900 node shoot.mjs x` overrides the default 375/768/1440 widths;
  `SITE_ROOT=/path/to/checkout` shoots another checkout (e.g. a `git worktree` of `main`).
- `computed.mjs <name>` dumps `getComputedStyle` of every element at 375/768/1440;
  `node computed.mjs --diff a b` compares two dumps.

`shots/` and `node_modules/` are git-ignored.
