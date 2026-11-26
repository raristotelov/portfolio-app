# Home

**Status:** In Development
**Route:** `/`
**Figma:** Home — Desktop `54:66`, Tablet `45:70`, Mobile `45:218`, Mobile Menu Open `45:363`

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
