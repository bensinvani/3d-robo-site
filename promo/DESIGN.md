# DESIGN — robo reel (brand cheat sheet)

Source of truth: we built the site (robo-site/src/app/globals.css) — values exact, not inferred.

## Colors
- `--ink: #16181d` — type-beat backgrounds, end card
- `--fog: #a9b3bf` → `--fog-light: #c9d1da` — footage backdrop gradient
- `--mist: #f4f5f7` — headline type on dark/footage
- `--glow: #ff8fa0` — THE accent: punctuation, highlights, CTA pill, glow shadows (`0 0 60px rgba(255,143,160,.45)`)
- `--peach: #f5c9b8` — secondary accent, sparingly
- `--knit: #8c939e` — muted small text

## Type
- Display: **Quicksand 700**, lowercase always, tracking -0.03em, line-height 0.95
- Body/captions: **Inter** 400/600
- Headline pattern: lowercase phrase ending in a period — "meet robo." "say hi."
- Period/keyword gets `--glow` color for punch

## Motion personality
Soft, floaty, premium. Ease-out everything (power3/expo). Masked line reveals for
headlines, char-pop only for the final "say hi." No harsh cuts between same-footage
beats; hard cuts OK into type beats.

## Do
- Lowercase headlines + glow period · big negative space · film grain overlay
- Footage full-bleed with subject centered (frames are 16:9 → scale to cover 9:16,
  subject is centered in all sequences so cover-crop is safe)

## Don't
- No new colors, no uppercase headlines, no busy backgrounds behind type beats
- Never stretch frames; always cover-fit
