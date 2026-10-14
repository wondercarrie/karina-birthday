# Backlog

Known issues and ideas. Items 1–5 and 14 of the first version (button outline, mobile programme gap,
photo caption overflow, hidden hero caption and toast polaroid, Arial Narrow, fractional Figma sizes)
were fixed on `fix/spacing-and-mobile`. Class names refer to the current `styles.css`.

## Layout

1. **Tablet programme title breaks in two.** At 761–1050px (and just above, up to about 1100px) the
   baby polaroid and the title share one row, so "Что будем делать?" wraps as "Что будем / делать?".
   It reads fine, but the title column could get a larger `min-width` or the row could stack earlier.

2. **Small programme times on mobile.** "19:30", "21:30", "Quiz — Who is?" and "Karaoke time" are set
   in Luxurious Script at 36px / 24px on mobile. The script is optically small, so these headings are
   hard to read on a phone; consider one step up (48px / 30px).

3. **Hero caption contrast on mobile.** On mobile the caption sits over the light curtain in the top
   right corner and stays readable only thanks to a `text-shadow`. If the hero photo or its crop
   changes, re-check the position and contrast.

4. **Below 280px the page overflows.** The baby polaroid is a fixed 244px and the section has a 9%
   inset, so at 240px it is wider than the screen. Widths under 280px are not supported today.

5. **English line ends.** English copy only binds numbers and "a" with non-breaking spaces; lines can
   still end with "and", "or", "the", "to". This is normal for English, but could be tightened if the
   Russian standard should apply to both languages.

## Fonts and page weight

6. **The hero image is a 3 MB PNG.** `assets/img/hero.png` is 942×2048 RGBA PNG (3,002 KB) for a
   photo. As JPEG or WebP, with `srcset` for mobile and desktop sizes, it would be about
   200–300 KB.

7. **Script fonts are TTF and not subset.** Roboto Condensed is now a 38 KB subset WOFF2, but Pinyon
   Script, Caveat, Inter and Luxurious Script are still full TTFs (1.1 MB together). Converting them the
   same way (WOFF2, Latin + Cyrillic subset, see README) would cut this 3–5×. Luxurious Script alone is
   388 KB and is used for four short strings.

8. **Only Roboto Condensed is preloaded.** Pinyon Script (hero title) and Inter (header) are also above
   the fold and can briefly render in the fallback font. Preload them once they are WOFF2.

9. **Fallbacks of the other font stacks.** `--font-narrow` falls back to `Arial, sans-serif`, the other
   stacks (`--font-sans`, `--font-script`, `--font-hand`, `--font-luxurious`) still fall back to
   `Helvetica` only. Add a generic family (`sans-serif`, `cursive`) to each.

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
