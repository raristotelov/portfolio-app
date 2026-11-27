# Home

**Status:** In Development
**Route:** `/`
**Figma:** Home — Light: Desktop `54:66`, Tablet `45:70`, Mobile `45:218`, Mobile Menu Open `45:363`. Dark: Desktop `63:76`, Tablet `66:178`, Mobile `66:419`, Mobile Menu Open `66:482`. Contact form states (Validation Errors / Sending / Success / Failure) — Light: Desktop `77:142` `77:180` `77:210` `77:242`, Tablet `78:438` `78:476` `78:506` `78:536`, Mobile `78:976` `78:1013` `78:1042` `78:1072`; Dark: Desktop `77:278` `77:295` `77:306` `77:318`, Tablet `78:570` `78:587` `78:598` `78:610`, Mobile `78:1105` `78:1121` `78:1131` `78:1142`

Single-page portfolio; navigation scrolls between section anchors.

## Components

- `Navbar` → `Hero` (`#home`) → `Skills` (`#skills`) → `Contact` (`#contact`) → `Footer`
- `Projects` (`#projects`) exists but is not rendered (#4).

## Fields and actions

- **Navbar:** anchor links to each section; "Hire Me" → `#contact`; mobile menu toggle, closes on link tap.
- **Hero:** "View Projects" → `#projects`; "Download CV" → `/cv.pdf`.
- **Contact form fields:** Name, Email, Message.
- **Contact form submit:** no-op until #7.
- **Footer:** "Back to top" → `#home`.

## Errors

- None yet — contact form errors defined in #7.

## Notes

- `#projects` is a dead anchor until #4.
- `/cv.pdf` does not exist in `public/` — the "Download CV" link is broken.
