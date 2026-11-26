# Portfolio App

A single-page personal portfolio site built with Next.js.

## Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict)
- SASS modules
- PostHog analytics
- Jest + React Testing Library
- ESLint + Prettier

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in the PostHog values in `.env.local` to enable analytics; it only runs in production builds.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Does                                   |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start the dev server                   |
| `npm run build`        | Production build                       |
| `npm run start`        | Serve the production build             |
| `npm run lint`         | ESLint — fails on any error or warning |
| `npm run format`       | Format every file with Prettier        |
| `npm run format:check` | Check formatting without writing       |
| `npm test`             | Run the unit tests                     |

## Project structure

```
src/
├── app/          # layout, page, providers
├── components/
│   ├── features/ # page sections, Navbar, Footer
│   └── ui/       # shared primitives
├── constants/    # site structure
├── data/         # section content
├── styles/       # global tokens and base styles
└── types/        # shared types
```

More in [`docs/`](./docs/README.md).
