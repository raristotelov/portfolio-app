# Portfolio App — Overview

A single-page personal portfolio for Ivan Aristotelov (Full Stack Developer). Everything lives on `/` and navigation is anchor-based scrolling between sections — no client-side routing.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) + React 19.2.3
- **Language**: TypeScript (strict)
- **Styling**: SCSS Modules colocated with components; design tokens (colors, fonts) defined as CSS custom properties in `src/app/globals.scss`. No Tailwind.
- **Fonts**: `Sora` (display + body, weights 300/400/500/800) and `JetBrains Mono` (technical labels, tags) — both loaded via `next/font/google` in `src/app/layout.tsx`.
- **Icons**: `react-icons` for UI icons; devicon CDN SVGs for tech-stack logos in the Skills section.
- **Analytics**: `posthog-js` wired through `src/app/providers.tsx` (`PHProvider`). Only initializes in production builds and only when `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are both present. **Not yet deployed.**

## Project Structure

```
src/
  app/
    layout.tsx        # Root layout, font setup, PHProvider wrapper
    page.tsx          # Single page composing all sections
    providers.tsx     # PostHog client provider
    globals.scss      # Design tokens + reset
  components/
    Navbar/           # Sticky top nav with mobile hamburger
    Hero/             # Landing block (name, tagline, avatar, CTAs)
    Skills/           # Tech stack grid
    Projects/         # (not currently rendered)
    Contact/          # Contact info + message form
    Footer/           # Copyright, social links, back-to-top
    ui/               # Shared primitives (Button, SectionHeading, SocialLinks)
  data/
    projects.ts       # Project entries
    skills.ts         # Tech stack entries (12 skills, 3 rows of 4)
    socials.ts        # Social link entries
  lib/
    constants.ts      # siteMetadata, navLinks, sectionIds
  types/
    scss.d.ts         # Side-effect SCSS import declaration
```

Component convention: each component is its own folder containing `Component.tsx` + `Component.module.scss`. **No `index.ts` barrel files** — import directly from the component file.

## Current Sections

Composed in `src/app/page.tsx` in this order:

1. **Navbar** (`components/Navbar`)
   Sticky top bar with logo, desktop link list (`Home`, `Projects`, `Skills`, `Contact`), a "Hire Me" CTA, and a mobile hamburger menu. Links use anchor scrolling.

2. **Hero** (`components/Hero`)
   Two-column layout (`#home` anchor). Left: first/last name, tagline, role description, "View Projects" + "Download CV" buttons, and social links. Right: initials avatar with "Available for hire" badge.

3. **Skills** (`components/Skills`)
   `#skills` anchor. 4-column responsive grid (2-column under 640px) of `SkillCard` tiles. Data lives in `src/data/skills.ts` — currently 12 skills across 3 rows:
   - Row 1: JavaScript, TypeScript, React, Next.js
   - Row 2: Tailwind CSS, Node.js, PostgreSQL, Supabase
   - Row 3: MongoDB, Docker, Vercel, Git

4. **Contact** (`components/Contact`)
   `#contact` anchor. Two contact-method cards (Email, Location) plus a message form (Name, Email, Message). Form currently has `onSubmit={(e) => e.preventDefault()}` — **submission is not wired to a backend yet.**

5. **Footer** (`components/Footer`)
   Copyright line, social links, and "Back to top" anchor link.

## Implemented But Not Rendered

- **Projects** (`components/Projects`) — commented out in `page.tsx`. Component and data (`src/data/projects.ts`) exist; just needs to be enabled.

The Navbar still includes a "Projects" link pointing at `#projects`, which is a dead anchor until the section is re-enabled.

See [`next-steps.md`](./next-steps.md) for the roadmap.

## Dev Scripts

- `npm run dev` — Next dev server on port 3000
- `npm run build` — Production build
- `npm run start` — Run production build locally
- `npm run lint` — ESLint
