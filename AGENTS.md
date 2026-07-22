# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Repository Overview

A university website system with a Next.js frontend, NestJS backend, and React admin dashboard. Features include programs management, research publications, news, student activities, and multilingual support (Vietnamese/English).

## Project Structure

```
sit/
├── app/                    # Next.js frontend
│   └── src/
│       ├── app/[locale]/  # Internationalized pages
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and API clients
│       └── utils/         # Helper functions
├── backend/                # NestJS backend
│   └── src/
│       ├── modules/       # Feature modules
│       └── main.ts
├── dashboard/              # React admin dashboard
│   └── src/
│       ├── components/
│       └── lib/
└── .agent/                 # AI agent configuration
    ├── commands/           # Common operation templates
    ├── plans/              # Project plans and workflows
    ├── rules/              # Coding standards and conventions
    └── skills/             # Technology-specific instructions
```

## Development Workflow

### Getting Started

1. **Install dependencies** in each workspace:
   ```bash
   pnpm install
   ```

2. **Start development servers**:
   ```bash
   # Frontend
   cd app && pnpm dev

   # Backend
   cd backend && pnpm start:dev

   # Dashboard
   cd dashboard && pnpm dev
   ```

### Common Tasks

**Create a new component**:
- Use `.agent/commands/create-component.md` for template
- Follow shadcn-ui patterns in `app/src/components/ui/`
- Add error boundaries and loading states

**Add API endpoint**:
- Create module in `backend/src/modules/`
- Add controller with proper error handling
- Update API types in `app/src/lib/api.ts`

**Add database schema**:
- Use Drizzle ORM in `backend/src/database/`
- Run migrations: `pnpm db:push`
- Update TypeScript types

### Code Style

- **Frontend**: React/Next.js with TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: NestJS with TypeScript, Drizzle ORM, Swagger
- **Dashboard**: React with TypeScript, Radix UI components

### Testing

- Run frontend tests: `cd app && pnpm test`
- Run backend tests: `cd backend && pnpm test`
- Run E2E tests: `pnpm test:e2e`

### Linting & Type Checking

```bash
# All workspaces
pnpm lint
pnpm typecheck

# Individual workspaces
cd app && pnpm lint && pnpm typecheck
cd backend && pnpm lint
cd dashboard && pnpm lint && pnpm typecheck
```

## Agent Configuration

### Available Commands

Located in `.agent/commands/`:
- `create-component.md` - Create new UI components
- `debug.md` - Debugging workflow
- `fix-lint.md` - Fix linting errors
- `new-local.md` - Create new branches
- `pass-to-agent.md` - Delegate tasks between agents
- `quick-pr.md` - Create pull requests
- `review-code.md` - Code review checklist
- `review-security.md` - Security review
- `run-qa.md` - Quality assurance checks

### Available Rules

Located in `.agent/rules/`:
- `code-quality.md` - General code quality standards
- `deployment/` - Deployment workflows
- `design/` - Design system guidelines
- `development/` - Development best practices
- `git/` - Git workflow conventions
- `testing/` - Testing strategies
- `model-selection.md` - When to use different AI models
- `token-efficiency.md` - Context optimization

### Available Skills

Technology-specific skills in `.agent/skills/`:
- `backend/` - NestJS, Drizzle, Pydantic skills
- `frontend/` - Next.js, React, Tailwind skills
- `frontend-code-review/` - Frontend review guidelines
- `frontend-design/` - UI/UX design principles
- `react-best-practices/` - React optimization rules

## Key Conventions

### Naming

- **Files**: `kebab-case.tsx` (e.g., `loading-spinner.tsx`)
- **Components**: `PascalCase` (e.g., `LoadingSpinner`)
- **API endpoints**: `/api/v1/{resource}`
- **Database tables**: `snake_case`

### Internationalization

- Use `next-intl` for frontend translations
- Locale prefix in URLs: `/vi/...` or `/en/...`
- Translation keys: `section.subsection.item`

### Error Handling

- Frontend: Use `ErrorBoundary` and try-catch
- Backend: Use NestJS exception filters
- API: Return standardized error responses

### Performance

- Use `useMemo` and `useCallback` for expensive operations
- Implement loading states with skeleton UI
- Use `IntersectionObserver` for lazy loading
- Implement API caching with `api-utils.ts`

## Environment Variables

Required in `.env` files:

**Backend**:
```
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
```

**Frontend**:
```
NEXT_PUBLIC_API_URL=
```

## Troubleshooting

### Common Issues

**API connection errors**:
- Check `NEXT_PUBLIC_API_URL` in frontend
- Verify backend is running on correct port
- Check CORS settings in backend

**Build failures**:
- Run `pnpm clean && pnpm install`
- Check Node.js version (minimum 18)
- Verify all dependencies are compatible

**Type errors**:
- Run `pnpm typecheck` in affected workspace
- Check `api.ts` types match backend responses
- Ensure shared types are up to date

## Deployment

See `.agent/rules/deployment/` for deployment workflows and checklists.
