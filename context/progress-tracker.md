# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 7 — Backend in progress
**Last completed:** Database setup + Auth.js config + Registration
**Next:** Wire register/login pages, build vehicle/alerts/analytics API routes

---

## Progress

### Phase 1 — Foundation

- [x] 01 Project Setup & Design Tokens
- [x] 02 Theme System — Light & Dark
- [x] 03 Layout Shell — Login Page (mock)
- [x] 04 Layout Shell — Dashboard Shell (Sidebar + Header)

### Phase 2 — Data Layer

- [x] 05 Vehicle Data + Health Score Logic

### Phase 3 — Dashboard Overview

- [x] 06 Dashboard Page — Stat Cards + Health Distribution + Alerts

### Phase 4 — Fleet Pages

- [x] 07 Fleet Table Page — Full UI
- [x] 08 Vehicle Detail Page — Full UI

### Phase 5 — Analytics & Alerts

- [x] 09 Analytics Page — Cross-Fleet Insights
- [x] 10 Alerts Page — Full UI

### Phase 6 — Polish & Responsive

- [x] 11 Loading, Empty, Error States Audit
- [x] 12 Responsive Pass
- [x] 13 Accessibility & Reduced Motion Pass
- [x] 14 Performance Pass

### Phase 7 — Backend (Database, Auth, CSV Upload)

- [x] 15 Database Setup — PostgreSQL + Prisma (migration 00001_init applied)
- [x] 16 Auth System — NextAuth.js v5 (replaces mock auth)
  - [x] lib/auth.ts — Auth.js v5 config (Credentials + PrismaAdapter + bcrypt)
  - [x] lib/prisma.ts — PrismaClient singleton with PrismaPg adapter
  - [x] app/api/auth/[...nextauth]/route.ts — NextAuth route handler
  - [x] app/api/auth/register/route.ts — Registration API
  - [x] Register page + form (/register)
  - [x] LoginForm — uses signIn("credentials", { redirect: false })
  - [x] AuthGuard — uses useSession from next-auth/react
  - [x] useAuth hook — wraps useSession/signOut from next-auth/react
  - [x] Providers — SessionProvider added
  - [x] Sidebar — uses real logout
  - [x] Layout — replaced mock AuthProvider with SessionProvider
- [ ] 17 API Routes — Vehicles + Alerts + Analytics
- [ ] 18 CSV Upload — Single File (dropzone → parse → DB)
- [ ] 19 CSV Upload — Batch + Upload History
- [ ] 20 Migration — Hooks from Static to API
- [ ] 21 Settings Page — Account Management

---

## Decisions Made During Build

### Frontend (MVP)
- **Stack:** Next.js 16 + shadcn/ui + Recharts + TanStack Query + Framer Motion
- **Data:** 10,000 vehicles from CSV transformed to static TypeScript, fetched through simulated async hooks
- **Health score:** Uses CSV's soh_percent as baseline, adjusted by temperature/fast-charge/discharge/driving-style penalties
- **Theme:** `.dark` class on `<html>` with CSS custom property remapping
- **Auth:** Mock login (any email/password, localStorage session) — to be replaced by Auth.js
- **Fonts:** Inter (UI) + JetBrains Mono (data) via next/font/google
- **Predictions:** Linear remaining-cycles estimate based on current degradation rate
- **Alerts:** Auto-generated from vehicles with health < 80, sorted by severity

### Backend
- **Database:** PostgreSQL (Neon serverless) with Prisma v7 ORM
- **Auth:** Auth.js v5 (next-auth@beta) with Credentials provider, database sessions via PrismaAdapter
- **Password hashing:** bcryptjs (10 salt rounds)
- **Prisma v7 specifics:** `prisma-client` generator (not `prisma-client-js`), requires `prisma.config.ts`, needs driver adapter (`@prisma/adapter-pg` + `pg`), `PrismaClient` requires `{ adapter }` option
- **Migration:** `prisma db push` for Neon (no shadow database permission); used `prisma migrate diff` to generate SQL + `prisma migrate resolve` to mark as applied
- **Neon permissions:** `authenticator` role lacks DDL permissions — used `neondb_owner` role for schema changes
- **CSV parsing:** papaparse (client preview + server validation)
- **File upload:** Next.js built-in formData() API — no multer/formidable needed
- **API pattern:** Route Handlers returning JSON, all scoped to authenticated user
- **Data isolation:** All queries filter by userId — no multi-tenant data leakage
- **Pagination:** Server-side cursor/offset pagination on fleet table + alerts
- **CSV handling:** In-memory only — parse with papaparse, discard file after processing, no disk/S3 storage
- **New user state:** Empty — no seed data, upload page is the entry point

---

## What to Do Next

1. Wire up API routes for vehicles, alerts, analytics, upload history
2. Build CSV upload page + API handler (dropzone + papaparse → insert to Neon)
3. Migrate hooks from static data to TanStack Query + API calls
4. Remove `generateStaticParams` + static data dependencies
5. Test full flow: register → login → upload CSV → see fleet → view analytics
6. Delete mock-auth artifacts (old lib/auth.ts functions no longer needed)
