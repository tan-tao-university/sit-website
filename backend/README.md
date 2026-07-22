<h1 align="center">SIT Backend</h1>
<p align="center">API for the SIT Website &middot; School of Information Technology, Tan Tao University</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest">
</p>

A NestJS API serving the public site and the admin dashboard: programs, courses, curricula, faculty, research, news, events, achievements, alumni, career opportunities, handbooks, and site-wide translations, backed by PostgreSQL via Drizzle ORM.

See the root [README](../README.md) for the full workspace (public site, dashboard, backend together).

## Requirements

- Node.js >= 18
- pnpm 10.13.1
- PostgreSQL >= 13

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_ACCESS_KEY_SHA256`, `JWT_ACCESS_SECRET` | generate both with `pnpm security:generate-secrets` |
| `JWT_ACCESS_TTL_SECONDS`, `REFRESH_TOKEN_TTL_DAYS` | auth token lifetimes |
| `UPLOAD_PUBLIC_URL`, `UPLOAD_TRUSTED_ORIGINS` | public base URL for `/uploads` files, plus any prior origins still referenced in stored URLs |
| `ORIGIN` | extra CORS origins, comma-separated (`localhost:3000`/`4000` are always allowed) |
| `PORT` | API port (default `8080`) |
| `GOOGLE_API_KEY` | Gemini key used by the translation module |

Push the schema and start the API:

```bash
pnpm db:push
pnpm start:dev
```

The API listens on `http://localhost:8080`, prefixed at `/api/v1`; Swagger UI is served alongside it. Uploaded files are served statically at `/uploads`.

## Commands

```bash
pnpm start:dev / start:debug / start:prod   # run the API
pnpm build                                  # compile to dist/
pnpm lint                                   # eslint --fix
pnpm format                                 # prettier

pnpm db:generate    # generate a Drizzle migration from schema changes
pnpm db:migrate     # apply migrations
pnpm db:push        # push schema changes directly (dev)

pnpm test / test:watch / test:cov / test:e2e   # Jest unit + e2e tests

pnpm users:create-admin   # create an admin user
pnpm users:clear          # wipe users (dev only)

pnpm security:generate-secrets   # generate API_ACCESS_KEY_SHA256 + JWT_ACCESS_SECRET
```

## Uploaded-file garbage collection

Files are cleaned up automatically when the record referencing them is updated or deleted, as long as no other row still points at them. For uploads abandoned before a form was ever saved, run the collector periodically:

```bash
pnpm build
pnpm uploads:gc -- --min-age-hours=24            # dry run
pnpm uploads:gc -- --min-age-hours=24 --apply    # delete listed files
```

Always inspect the dry-run output before adding `--apply`.

## Modules

`achievement`, `alumni`, `auth`, `career-opportunity`, `course`, `curriculum`, `event`, `faculty`, `handbook`, `news`, `popup-banner`, `program`, `research`, `search`, `section`, `translation`, `upload` — each a self-contained NestJS module under `src/`, plus `common/` for shared guards, pipes, and utilities.

## Documentation

- [API design](docs/API_DESIGN.md)
- [Database design](docs/DATABASE_DESIGN.md)

## License

MIT — see the root [LICENSE](../LICENSE).
