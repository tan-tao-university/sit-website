# Contributing

Thanks for taking the time to contribute. This is a pnpm workspace with three projects — `app` (public site), `dashboard` (admin), `backend` (API) — see the root [README](README.md) for how they fit together and how to run them locally.

## Before you start

- For a bug or a small fix, open an issue or just send a pull request.
- For a larger change (new module, schema change, new dependency), open an issue first using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml) so the approach can be discussed before you invest time in it.
- Found a security issue? Do not open a public issue — see [SECURITY.md](SECURITY.md).

## Setup

```bash
nvm use            # picks up the Node version from .nvmrc, if you use nvm
pnpm install
cp .env.shared.example .env.shared
cd backend && cp .env.example .env && pnpm db:push && cd ..
pnpm dev
```

## Making a change

1. Create a branch off `main`: `git checkout -b feature/short-description` (or `fix/...`).
2. Make your change in the relevant workspace (`app/`, `dashboard/`, or `backend/`).
3. Run the checks for whatever you touched:
   ```bash
   # backend
   cd backend && pnpm lint && pnpm test && pnpm build

   # app / dashboard
   cd app && pnpm lint && pnpm build
   ```
4. Commit with a clear, imperative message (`fix: correct pagination on /news`, not `updated stuff`).
5. Push and open a pull request against `main`. Describe what changed and why; link the issue it closes if there is one.

## Pull request expectations

- Keep PRs focused on one change — smaller PRs review faster.
- Update relevant docs (`README.md`, `backend/docs/`) if behavior or setup steps change.
- New backend endpoints need request validation (`class-validator`) and, where practical, a test in `backend/test/`.
- Don't commit `.env`, `.env.shared`, or anything under `backend/uploads/`.

## Code style

- TypeScript throughout; keep `strict` mode passing.
- ESLint + Prettier are the source of truth for formatting — run `pnpm lint` / `pnpm format` rather than hand-formatting.
- Follow the patterns already used in the module/component you're editing over introducing a new pattern.

## Reporting bugs / requesting features

Use the issue templates: [Bug report](.github/ISSUE_TEMPLATE/bug_report.yml) · [Feature request](.github/ISSUE_TEMPLATE/feature_request.yml).
