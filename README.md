<p align="center">
  <img src="app/public/assets/logo-sit.png" alt="School of Information Technology, Tan Tao University" width="140">
</p>

<h1 align="center">SIT Website</h1>
<p align="center">School of Information Technology &middot; Tan Tao University</p>

<p align="center">
  <a href="https://github.com/sit-ttu/sit-website/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/sit-ttu/sit-website/deploy.yml?style=for-the-badge&label=deploy" alt="Deploy status"></a>
  <a href="https://sit.ttu.edu.vn"><img src="https://img.shields.io/badge/website-sit.ttu.edu.vn-2ea44f?style=for-the-badge" alt="Website"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm">
</p>

**SIT Website** is the official web platform for the School of Information Technology at Tan Tao University — a Next.js public site, a Next.js admin dashboard, and a NestJS API, managed as one pnpm workspace. It covers programs, courses, majors, research, news, and student activities, fully bilingual (Vietnamese / English).

[Website](https://sit.ttu.edu.vn) &middot; [Email](mailto:sit@ttu.edu.vn)

## Stack

| Layer | Path | Stack |
|---|---|---|
| Public site | `app/` | Next.js 15, TypeScript, Tailwind CSS v4, Radix UI, next-intl |
| Dashboard | `dashboard/` | Next.js, TypeScript, admin UI for content management |
| Backend | `backend/` | NestJS, Drizzle ORM, PostgreSQL |

Package manager: pnpm workspaces.

## Requirements

- Node.js >= 18
- pnpm 10.13.1
- PostgreSQL >= 13

## Quick start

```bash
pnpm install

# root env vars shared by app + dashboard
cp .env.shared.example .env.shared

# backend env vars + database
cd backend && cp .env.example .env && pnpm db:push && cd ..

pnpm build
pnpm start
```

| Service | URL |
|---|---|
| Public app | http://localhost:3000 |
| Dashboard | http://localhost:4000 |
| Backend API | http://localhost:8080 |

For active development, run each workspace's own dev server instead (`cd app && pnpm dev`, `cd backend && pnpm start:dev`, `cd dashboard && pnpm dev`), or `pnpm dev` from the root to run all three in parallel.

## Useful commands

```bash
pnpm build:backend / build:app / build:dashboard   # build one workspace
pnpm start:backend / start:app / start:dashboard   # start one workspace

# backend (run from backend/)
pnpm db:generate      # generate a migration
pnpm db:push          # push schema changes
pnpm test / test:e2e / test:cov
pnpm lint

# uploaded-file garbage collection (run from backend/, after pnpm build)
pnpm uploads:gc -- --min-age-hours=24            # dry run
pnpm uploads:gc -- --min-age-hours=24 --apply    # delete listed files
```

Always review `uploads:gc` dry-run output before passing `--apply`. Configure `UPLOAD_TRUSTED_ORIGINS` with any previous backend origins whose `/uploads/...` URLs are still referenced in the database.

## Deployment

Pushes to the `prod` branch trigger `.github/workflows/deploy.yml`, which runs `deploy.sh` on a self-hosted runner: fetch, `pnpm install --frozen-lockfile`, `pnpm build`, then `pm2 startOrReload` via `ecosystem.config.js`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes and open a pull request

## License

MIT — see [LICENSE](LICENSE).

## Contact

- Website: [sit.ttu.edu.vn](https://sit.ttu.edu.vn)
- Email: [sit@ttu.edu.vn](mailto:sit@ttu.edu.vn)
- Tan Tao University, Long An, Vietnam
