# Backlog

Known issues and ideas. Items 1–5 and 14 of the first version (button outline, mobile programme gap,
photo caption overflow, hidden hero caption and toast polaroid, Arial Narrow, fractional Figma sizes)
were fixed on `fix/spacing-and-mobile`. Items 6–8 (the 3 MB hero PNG, TTF fonts, preloading the
first-screen fonts) were fixed on `perf/images-and-fonts`: the page went from 4.6 MB to about 0.5 MB on
a phone, see the README sections Photos and Fonts. Class names refer to the current `styles.css`.

## Layout

1. **Tablet programme title breaks in two.** At 761–1050px (and just above, up to about 1100px) the
   baby polaroid and the title share one row, so "Что будем делать?" wraps as "Что будем / делать?".
   It reads fine, but the title column could get a larger `min-width` or the row could stack earlier.

2. **Small programme times on mobile.** "19:30", "21:30", "Quiz — Who is?" and "Karaoke time" are set
   in Luxurious Script at 36px / 24px on mobile. The script is optically small, so these headings are
   hard to read on a phone; consider one step up (48px / 30px).

3. **Hero caption contrast on mobile.** On mobile the caption sits over the light lace curtain to the
   right of the bow and stays readable only thanks to a `text-shadow`. Its position (`top`, `left: 67%`)
   is tied to where the bow is in this photo and this crop; if either changes, re-check the position
   and contrast.

4. **Below 280px the page overflows.** The baby polaroid is a fixed 244px and the section has a 9%
   inset, so at 240px it is wider than the screen. Widths under 280px are not supported today.

5. **English line ends.** English copy only binds numbers and "a" with non-breaking spaces; lines can
   still end with "and", "or", "the", "to". This is normal for English, but could be tightened if the
   Russian standard should apply to both languages.

## Fonts and page weight

9. **Fallbacks of the other font stacks.** `--font-narrow` falls back to `Arial, sans-serif`, the other
   stacks (`--font-sans`, `--font-script`, `--font-hand`, `--font-luxurious`) still fall back to
   `Helvetica` only. Add a generic family (`sans-serif`, `cursive`) to each.

16. **Inter subset renders slightly differently at small sizes.** In Chromium on macOS the subset
    `Inter-Medium.woff2` is anti-aliased about 1px differently on glyph edges at 12–14px than the full
    font (same outlines and positions; pyftsubset and hb-subset alike, any subset). Invisible by eye
    and accepted; the full font as WOFF2 would be 111 KB instead of 3.7 KB.

17. **Bow and hat photos are scaled by a different filter.** They moved from CSS backgrounds to
    `<img>`, which Chromium downsamples with another filter, so the film grain differs pixel by pixel
    (up to 80–140 of 255 per channel on single pixels, p99 under 40) even with the same file.

18. **Script loads later on slow connections.** The hero and three font preloads share the bandwidth
    with `script.js`, which arrives about 0.4 s later on emulated Slow 4G than before (2.4 s instead of
    2.0 s). The title is still written, so nothing to do now; `defer` on the script or a smaller
    first-screen font set would bring it forward.

## Accessibility

10. **Decorative stars are announced.** The "✦" in the two flourishes is read by screen readers.
    It should be `aria-hidden="true"`, or the flourish should be drawn with CSS.

11. **Same alt text on every photo.** The hero, baby and dinner photos all have
    "Детская фотография Карины" / "A childhood photograph of Karina" (set by `script.js`). Each
    photo should have its own description, or decorative ones should use `alt=""`.

12. **Landmarks.** `<header>` and `<footer>` sit inside `<main>`, so they are not exposed as the
    page banner and content-info landmarks. Moving them out of `<main>` needs care, because
    `.invitation` (the `<main>`) is the 1200px flex column they are laid out in.

13. **Low contrast of the "pet friendly" badge.** `.pet-friendly-badge` has `opacity: 0.55`, so
    the red 18px text on cream is likely below WCAG AA contrast. Check it and use a lighter colour
    instead of opacity if needed.

## Code tidiness

14. **Unneeded `data-copy` on text that never changes.** Strings that are the same in both
    languages ("✦", "01"–"04", "Nostalgia", "KARINA'S BIRTHDAY", "Dress up", "Cheers!",
    "Auditoria Belgrade", the address) still have `data-copy` keys, so the script rewrites them on
    every language switch. This does no harm but adds noise to `COPY`.

15. **Project documentation.** The root README covers structure, local run, visual tests and fonts.
    It could also describe how to deploy (GitHub Pages settings) and how to add a new section or
    language.
