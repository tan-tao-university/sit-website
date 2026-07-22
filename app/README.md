<h1 align="center">SIT Public Site</h1>
<p align="center">Public website for the School of Information Technology, Tan Tao University</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/next--intl-000000?style=for-the-badge" alt="next-intl">
</p>

The public-facing site: programs, courses, curricula, faculty, research, news, events, achievements, alumni, and career opportunities, in Vietnamese and English via [next-intl](https://next-intl.dev/). Content is fetched from the [backend](../backend) API.

See the root [README](../README.md) for the full workspace (public site, dashboard, backend together).

## Requirements

- Node.js >= 18
- pnpm 10.13.1
- The backend API running (see [`../backend`](../backend))

## Setup

```bash
pnpm install
cp .env.example .env
```

`.env` only holds an optional `GOOGLE_SITE_VERIFICATION` token. Variables shared with the dashboard — `INTERNAL_API_URL` and `API_ACCESS_KEY` — live in `../.env.shared` at the workspace root (see the root README) and are loaded automatically by `next.config.ts`.

```bash
pnpm dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm dev      # dev server with Turbopack
pnpm build    # production build
pnpm start    # start the production build
```

## Internationalization

Locales are `vi` (default) and `en`, routed by `middleware.ts` (`/`, `/en/...`); Vietnamese stays the default regardless of browser language, English is only reached through an explicit `/en` path. Translation strings live in `src/messages/vi.json` and `src/messages/en.json`.

## Images

Remote images are allowed from the R2 bucket and from the local backend's `/uploads` path (see `next.config.ts`). Add any production backend host there before deploying against it.

## SEO

`sitemap.ts`, `robots.ts`, and `manifest.ts` under `src/app/` generate the sitemap, robots rules, and web manifest; `social-card/route.tsx` renders Open Graph share images.

## License

MIT — see the root [LICENSE](../LICENSE).
