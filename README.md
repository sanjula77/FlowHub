# FlowHub

<div align="center">

**A full-stack project management platform built with NestJS, Next.js, and PostgreSQL.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

</div>

---

## Overview

FlowHub lets teams organize work around projects and tasks. Users sign up, get a personal team created automatically, and can manage projects, assign tasks, and invite collaborators. The first user to register becomes an admin.

**Roles:**
- **ADMIN** — full access: create projects, manage team members, view all data
- **USER** — scoped access: view and work on tasks within their team

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, TypeORM, Passport JWT |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Database | PostgreSQL 15 |
| Auth | JWT (cookies + Bearer header), bcrypt |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for the database)

### 1. Clone the repo

```bash
git clone https://github.com/sanjula77/FlowHub.git
cd FlowHub
```

### 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432`.

### 3. Configure the backend

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=flowhub
DB_PASSWORD=flowhub
DB_NAME=flowhub_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### 4. Start the backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on `http://localhost:3001` with hot reload.

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

---

## Project Structure

```
FlowHub/
├── backend/
│   ├── src/
│   │   ├── auth/          # JWT auth, guards, login/signup
│   │   ├── users/         # User CRUD and profiles
│   │   ├── teams/         # Team and membership management
│   │   ├── projects/      # Project CRUD
│   │   ├── tasks/         # Task CRUD with status machine
│   │   ├── invitations/   # Token-based team invites
│   │   ├── audit/         # Audit logging
│   │   └── common/        # Logger, metrics, alerts, error filters
│   └── test/              # Unit, integration, and e2e tests
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable React components
│   └── lib/               # API client and auth utilities
└── docker-compose.yml     # PostgreSQL only
```

---

## Testing

```bash
cd backend

npm run test              # Unit tests
npm run test:integration  # Integration tests (requires PostgreSQL)
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
```

---

## License

UNLICENSED — all rights reserved.
