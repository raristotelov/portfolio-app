# Tech stack

## Stack

- **Framework:** Next.js 16 (App Router) + React 19.
- **Language:** TypeScript, strict mode.
- **Styling:** SASS modules, colocated with components. Global tokens and base styles in `src/styles/`.
- **Fonts:** Sora and JetBrains Mono via `next/font/google`.
- **Icons:** `react-icons`; skill logos are local SVGs in `public/skills/`.
- **Analytics:** PostHog (`posthog-js`), production only, enabled when `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are set.
- **Testing:** Jest + React Testing Library, colocated with components.
- **Lint / format:** ESLint + Prettier per the defaults; `lint` fails on any warning.
- **Dark mode:** yes — follows the OS, overridable by a Navbar switch (#6).

## Structure

```
src/
├── app/          # layout, page, providers
├── components/
│   ├── features/ # page sections, Navbar, Footer
│   └── ui/       # shared primitives
├── constants/    # site structure (nav links)
├── data/         # section content (profile, projects, skills, socials)
├── styles/       # _variables, _reset, _globals → main.scss
└── types/        # shared types
```

- Every component is a folder with `Component.tsx`, `Component.module.scss` and `index.ts`.

## Exceptions to the defaults

- **No database / Supabase** — static site.
- **No Cypress** — no flows complex enough to need e2e.
- **Unit tests only for components with behaviour** — presentational components have none.
- **`data/` folder** — holds each section's content; not in the default layout.
- **No `_mixins.scss` yet** — added when the first mixin is needed.
