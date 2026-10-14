# Backlog

Issues and ideas found during the `refactor/cleanup` refactoring. The refactoring kept the page
pixel-identical, so none of these were changed. Class names refer to the current `styles.css`.

## Layout bugs

1. **Dark outline around the red buttons.** `.button` sets `border: 1px solid` without a colour.
   After `all: unset` the colour is inherited from the page, which is the default black, so every
   red button has a thin dark border. This is probably unintended; `border-color: var(--color-red)`
   or `border: 0` would fix it, but it changes the look and needs sign-off.

2. **Empty gap under "Что будем делать?" on mobile.** `.programme-title` has a fixed
   `height: 375px`, sized for the desktop layout where it sits next to the baby polaroid. On mobile
   the title is stacked under the photo but still 375px tall, so there is a large empty area below
   the heading. Use `height: auto` (or a min-height) on mobile.

3. **Photo captions can overflow on narrow screens.** On mobile `.photo-caption` ("Dress up",
   "Cheers!") is `width: calc(100% + 36px); left: -18px`, which is wider than the photo, and the
   text has a 4px stroke. On very narrow viewports it can reach the screen edge or cause
   horizontal overflow. Check at 320px and below.

4. **Elements hidden on smaller screens.** The hero caption "тут, мне, кстати, 2 года" is hidden
   at ≤760px (a CSS comment says the mobile reference has no caption). The third polaroid
   (`.polaroid--toast`) is hidden at ≤1050px. Both look deliberate but should be confirmed with
   the page owner.

## Fonts and page weight

5. **Arial Narrow is a system font.** It is not bundled (`local()` only). Most Android, Linux and
   some iOS devices do not have it, so body text falls back to Helvetica/Arial, which is wider and
   wraps differently. Consider a bundled web font with similar metrics (e.g. a condensed sans under
   an open licence).

6. **The hero image is a 3 MB PNG.** `assets/img/hero.png` is 942×2048 RGBA PNG (3,002 KB) for a
   photo. As JPEG or WebP, with `srcset` for mobile and desktop sizes, it would be about
   200–300 KB.

7. **Fonts are TTF and not subset.** The four bundled fonts total 1.1 MB. WOFF2 plus subsetting to
   the characters actually used would cut this 3–5×. Luxurious Script alone is 388 KB and is used
   for four short strings ("19:30", "21:30", "Quiz — Who is?", "Karaoke time").

8. **Font swap on first load.** Since the fonts became separate files they load after the HTML,
   and with `font-display: swap` text can briefly render in the fallback font first. Adding
   `<link rel="preload" as="font" type="font/ttf" crossorigin>` for the fonts used above the fold
   (Pinyon Script, Inter) would reduce this.

## Accessibility

9. **Decorative stars are announced.** The "✦" in the two flourishes is read by screen readers.
   It should be `aria-hidden="true"`, or the flourish should be drawn with CSS.

10. **Same alt text on every photo.** The hero, baby and dinner photos all have
    "Детская фотография Карины" / "A childhood photograph of Karina" (set by `script.js`). Each
    photo should have its own description, or decorative ones should use `alt=""`.

11. **Landmarks.** `<header>` and `<footer>` sit inside `<main>`, so they are not exposed as the
    page banner and content-info landmarks. Moving them out of `<main>` needs care, because
    `.invitation` (the `<main>`) is the 1200px flex column they are laid out in.

12. **Low contrast of the "pet friendly" badge.** `.pet-friendly-badge` has `opacity: 0.55`, so
    the red 18px text on cream is likely below WCAG AA contrast. Check it and use a lighter colour
    instead of opacity if needed.

## Code tidiness

13. **Unneeded `data-copy` on text that never changes.** Strings that are the same in both
    languages ("✦", "01"–"04", "Nostalgia", "KARINA'S BIRTHDAY", "Dress up", "Cheers!",
    "Auditoria Belgrade", the address) still have `data-copy` keys, so the script rewrites them on
    every language switch. This does no harm but adds noise to `COPY`.

14. **Fractional sizes from the Figma export.** Values like `244.19px`, `331.78px`, `183.79px`,
    `131.31px`, `214.17px`, `356.25px`, `28.9px`, `55.2px` and `bottom: 3px` in the hero were
    kept because they define the current look. Rounding them would shift the layout by subpixels
    and needs a visual review.

15. **Project documentation.** The root README now covers structure, local run and visual tests.
    It could also describe how to deploy (GitHub Pages settings) and how to add a new section or
    language.
