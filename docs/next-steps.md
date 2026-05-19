# Next Steps

Roadmap for outstanding work on the portfolio.

## 1. Enable the Projects section

**Status:** Component implemented, currently commented out.

The `Projects` component (`src/components/Projects/Projects.tsx`) and its data file (`src/data/projects.ts`) are in place, but the section is disabled in `src/app/page.tsx` (line 18: `{/* <Projects /> */}`). The Navbar still links to `#projects`, so this is a dead anchor today.

**To enable:**
- Uncomment `<Projects />` in `src/app/page.tsx`.
- Review and update `src/data/projects.ts` with the actual project entries (title, description, tags, links, images).
- Confirm the project cards render correctly across desktop and mobile breakpoints.

## 2. Mobile design fixes

**Status:** Layout works at desktop sizes; mobile needs a pass.

The site renders on small viewports but hasn't had a focused mobile review. Spacing, typography scale, and section padding need to be audited and tightened on actual devices (not just devtools emulation).

**Areas to check:**
- Hero — name typography, avatar sizing, and button stack on narrow screens.
- Navbar — mobile hamburger menu open/close behavior, link tap targets.
- Skills grid — confirm the 2-column fallback under 640px looks balanced.
- Contact form — input sizing, label/placeholder readability, submit button width.
- Section padding rhythm — `.section` uses `padding: 80px 64px` desktop / `48px 32px` mobile in most places; verify that's actually consistent across all sections.

## 3. Dark mode

**Status:** Not started. Light theme only.

Design tokens already live as CSS custom properties in `src/app/globals.scss`, which is the right foundation — switching themes is just a matter of swapping the token values.

**Decisions needed:**
- **Trigger:** explicit toggle in the Navbar, or follow `prefers-color-scheme` automatically? (Or both — auto by default with a manual override.)
- **Persistence:** `localStorage` to remember the user's choice across visits.
- **FOUC handling:** apply the theme class on `<html>` before paint to avoid a flash of the wrong theme — typically a small inline script in `layout.tsx`.

**Implementation outline:**
- Define a `[data-theme="dark"]` (or `.dark` class) block in `globals.scss` overriding the token values.
- Audit every component's hardcoded colors and replace with token references where any slipped through.
- Add a toggle component (probably in `Navbar` or `ui/`) with sun/moon icons from `react-icons`.

## 4. Wire up the Contact form

**Status:** Form UI exists, submission is a no-op.

The Contact form in `src/components/Contact/Contact.tsx` currently calls `e.preventDefault()` on submit (line 49) and does nothing else. Name/email/message inputs aren't even controlled — the values are never read.

**To make it work, decisions needed:**
- **Delivery channel:** email (Resend, SendGrid, Mailgun), a third-party form service (Formspree, Web3Forms), or a custom API route writing to a DB?
- **Where the handler lives:** Next.js Route Handler (`src/app/api/contact/route.ts`) is the natural fit if we own the backend.
- **Spam protection:** honeypot field, hCaptcha/Turnstile, or rate limiting?

**Implementation outline once decided:**
- Convert the form to controlled inputs with `useState` (or `useFormState` if we want progressive enhancement).
- Add client-side validation (required fields, valid email).
- POST to the chosen endpoint on submit; show success / error UI states.
- Reset the form on success.

## 5. (Future) Add a Stats section

**Status:** Not implemented (previous prototype was removed).

A "by the numbers" section — e.g., years of experience, projects shipped, clients served, technologies mastered. Would sit between Hero and Skills (or between Projects and Contact) and use animated counters that tick up when scrolled into view.

**Open questions when we revisit:**
- Which stats are honest and meaningful (avoid vanity metrics).
- Whether to animate counters on scroll (needs `IntersectionObserver`).
- Visual treatment — full-bleed dark band, inline cards, or matching the Skills grid style.
