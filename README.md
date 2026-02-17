# QuoteFlow

Agency-first multi-tenant SaaS quoting platform built with Next.js, Prisma, and NextAuth.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Prisma 7** (PostgreSQL with `@prisma/adapter-pg`)
- **NextAuth v5** (Credentials provider, JWT sessions)

## Project Structure

```
src/
  app/
    api/auth/[...nextauth]/   # NextAuth route handler
    login/                     # Login page
    agency/                    # Agency dashboard (protected)
    workspace/[workspaceId]/   # Workspace dashboard (protected)
    layout.tsx                 # Root layout with nav + session provider
    page.tsx                   # Landing page
  components/
    nav.tsx                    # Navigation bar
    session-provider.tsx       # NextAuth session provider wrapper
  lib/
    auth.ts                   # NextAuth config with Credentials provider
    auth.config.ts            # Edge-compatible auth config (for middleware)
    auth.types.ts             # NextAuth type augmentations
    prisma.ts                 # Prisma client singleton
  generated/prisma/           # Generated Prisma client (gitignored)
  middleware.ts               # Auth middleware for protected routes
prisma/
  schema.prisma               # Database schema
  seed.ts                     # Seed script
```

## Prisma Models

- **User** — id, email, name, role, passwordHash, createdAt
- **Agency** — id, name, createdAt
- **Workspace** — id, agencyId, name, slug, createdAt
- **WorkspaceUser** — id, workspaceId, userId, role
- **QuoteFlow** — id, workspaceId, name, status, createdAt
- **QuoteFlowVersion** — id, quoteFlowId, versionNumber, configJson, createdAt

## Roles

`agency_owner` | `agency_staff` | `client_admin` | `client_staff` | `read_only`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and update `DATABASE_URL` to point to your Postgres instance:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quoteflow?schema=public"
AUTH_SECRET="generate-a-random-secret-here"
```

Generate a proper secret:

```bash
npx auth secret
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations for production
npm run db:migrate
```

### 4. Seed the database

```bash
npm run db:seed
```

This creates:
- **Agency**: Acme Insurance Agency
- **User**: owner@acme.com / password123 (agency_owner)
- **Workspace**: Acme Main Workspace (slug: acme-main)
- **QuoteFlow**: Home Insurance Quote (draft)
- **QuoteFlowVersion**: v1 with sample config

### 5. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 and sign in with `owner@acme.com` / `password123`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to DB (no migration) |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and re-seed |

## Protected Routes

The middleware (`src/middleware.ts`) redirects unauthenticated users to `/login` when accessing:
- `/agency/*`
- `/workspace/*`
