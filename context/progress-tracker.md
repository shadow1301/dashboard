# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Context updated for Phase 7 — Backend (awaiting implementation)
**Last completed:** Phase 6 — Polish & Responsive
**Next:** Phase 7-15 — Database Setup (PostgreSQL + Prisma)

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

- [ ] 15 Database Setup — PostgreSQL + Prisma
- [ ] 16 Auth System — NextAuth.js v5 (replaces mock auth)
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

### Backend (Planned)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js v5 (Auth.js) with Credentials provider, database sessions
- **Password hashing:** bcryptjs (10 salt rounds)
- **CSV parsing:** papaparse (client preview + server validation)
- **File upload:** Next.js built-in formData() API — no multer/formidable needed
- **API pattern:** Route Handlers returning JSON, all scoped to authenticated user
- **Data isolation:** All queries filter by userId — no multi-tenant data leakage
- **Pagination:** Server-side cursor/offset pagination on fleet table + alerts
- **Database hosting:** Neon (serverless PostgreSQL) — Vercel Postgres discontinued
- **CSV handling:** In-memory only — parse with papaparse, discard file after processing, no disk/S3 storage
- **New user state:** Empty — no seed data, upload page is the entry point

---

## What to Do Next

1. Install backend dependencies (prisma, @prisma/client, bcryptjs, next-auth, @auth/prisma-adapter, papaparse)
2. Set up Prisma schema and run initial migration
3. Implement Auth.js v5 (replace mock auth)
4. Build vehicle/alerts/analytics API routes
5. Migrate hooks from static data to API calls
6. Build CSV upload UI and API
7. Test full flow: register → login → upload CSV → see fleet → view analytics
