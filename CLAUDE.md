# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is FlowHub

A project management platform (teams → projects → tasks). Users sign up, get a personal team auto-created, and can manage projects and tasks. The first user to register becomes ADMIN automatically (race-condition protected via DB transaction + table lock).

## Running the project

Three processes run independently:

```bash
# 1. Database (from project root)
docker compose up -d          # PostgreSQL on port 5435

# 2. Backend (from /backend)
npm run start:dev             # NestJS on port 3001, hot reload

# 3. Frontend (from /frontend)
npm run dev                   # Next.js on port 3000
```

### Backend environment

`backend/.env` is required — it is NOT auto-loaded by NestJS configuration, but `import 'dotenv/config'` at the top of `main.ts` loads it at startup:

```env
DB_HOST=localhost
DB_PORT=5435
DB_USER=flowhub
DB_PASSWORD=flowhub
DB_NAME=flowhub_db
JWT_SECRET=dev-secret-change-in-production
FRONTEND_URL=http://localhost:3000
INITIAL_ADMIN_EMAIL=admin@example.com   # optional — auto-creates admin on first startup
INITIAL_ADMIN_PASSWORD=secret           # required if INITIAL_ADMIN_EMAIL is set
```

Port 5435 is intentional — there is a locally installed PostgreSQL 17 on 5432 that would intercept connections otherwise.

**Admin auto-seeding:** If `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` are both set, `BootstrapService` (`src/bootstrap.service.ts`) creates the admin account on every startup via `AuthService.signup()`. If the account already exists the call is a no-op (caught silently). The signup logic assigns `ADMIN` role whenever the email matches `INITIAL_ADMIN_EMAIL`.

## Commands

### Backend

```bash
npm run start:dev          # dev with hot reload
npm run build              # compile TypeScript to dist/
npm run lint               # ESLint (auto-fix)
npm run test:unit          # unit tests (Jest)
npm run test:integration   # integration tests (needs real Postgres at flowhub_test_db)
npm run test:e2e           # e2e tests
npm run test:cov           # coverage report
```

Run a single test file:
```bash
npx jest src/auth/auth.service.spec.ts
npx jest --testPathPattern=auth
```

### Frontend

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # ESLint check
```

## Architecture

### Backend (NestJS 11, TypeScript, TypeORM + PostgreSQL 15)

Each domain is a self-contained NestJS module under `backend/src/`:

```
auth/        login, signup, JWT strategy, guards
users/       user CRUD, profile
teams/       team CRUD, membership
projects/    project CRUD
tasks/       task CRUD with status machine
invitations/ token-based team invites
audit/       audit log writes
common/      global infrastructure (see below)
```

**Within each module**, the layering is: `controller → service → repository`. Repositories implement interfaces (`IUserRepository`, `ITeamRepository`, etc.) injected via `@Inject('IUserRepository')` tokens — not injected directly. This is the standard pattern across all modules.

**`CommonModule`** is `@Global()` and provides three services to the entire app without re-importing:
- `LoggerService` — Winston wrapper
- `MetricsService` — request metrics
- `AlertService` — pluggable alert channels (console registered by default)

**TypeORM** is configured with `synchronize: true` (dev only). Schema is auto-synced from entities; no migration runner needed in development. All entities use UUID PKs and soft-delete (`deletedAt` column). The `Task` entity has a `@VersionColumn` for optimistic locking.

**Authentication flow:**
1. Login → `AuthService.generateTokens()` → `accessToken` (15 min) + `refreshToken` (7 days) set as HTTP-only cookies
2. `JwtStrategy` extracts token from cookie first, falls back to `Authorization: Bearer` header
3. Guards: `JwtAuthGuard` (authentication) and `RolesGuard` (platform role: USER/ADMIN)
4. Separate team-level role (OWNER/MEMBER) stored in `team_members` table

**Signup special case:** First user ever registered gets `ADMIN` role. Uses a DB-level `LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE` inside a transaction to prevent race conditions.

### Frontend (Next.js 16 App Router, React 19, Tailwind CSS)

Pages live in `frontend/app/` using the App Router convention. All data fetching goes through two utility files:

- `frontend/lib/auth.ts` — `logout()`, `refreshAccessToken()`, `fetchWithAuth()` (auto-refreshes on 401)
- `frontend/lib/api.ts` — all domain API calls (projects, tasks, team, users), all use `fetchWithAuth`

All API calls include `credentials: 'include'` for cookie-based auth. The `NEXT_PUBLIC_API_URL` env var points to the backend (defaults to `http://localhost:3001`).

### Integration tests

Integration tests use a separate database `flowhub_test_db` (same host/credentials as dev). The test config is in `backend/test/jest-e2e.json` and runs with `maxWorkers: 1` (sequential) and a 30-second timeout. Test helpers and fixtures are in `backend/test/integration/`.

## Key constraints

- `synchronize: true` in TypeORM means entity changes apply immediately in dev — be careful with destructive column changes
- Tasks store `teamId` directly (denormalized from project) for query performance
- The `docker-compose.yml` at root runs **only** the database — backend and frontend run locally
