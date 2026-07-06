# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 8 — Cleanup & Polish complete
**Last completed:** PATCH /api/alerts/[id], toast notifications (sonner), client-side pagination, responsive polish, dropdown bg opacity fix (missing `--color-popover` in theme), analytics page data story (FleetInsights), clickable driving style bar → filtered fleet page, Pencil→Eye icon swap, driving style filter via URL search params
**Next:** Maintenance / feature requests

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
  - [x] lib/auth.ts — Auth.js v5 config (Credentials, JWT strategy)
  - [x] lib/prisma.ts — PrismaClient singleton with PrismaPg adapter
  - [x] app/api/auth/[...nextauth]/route.ts — NextAuth route handler
  - [x] app/api/auth/register/route.ts — Registration API (bcrypt, Zod)
  - [x] Register page + form (/register)
  - [x] LoginForm — uses signIn("credentials", { redirect: false })
  - [x] AuthGuard — uses useSession from next-auth/react
  - [x] useAuth hook — wraps useSession/signOut from next-auth/react
  - [x] Providers — SessionProvider added
  - [x] Sidebar — uses real logout
  - [x] Layout — replaced mock AuthProvider with SessionProvider
  - [x] app/api/auth/password/route.ts — Change password
- [x] 17 API Routes — Vehicles + Alerts + Analytics
  - [x] GET /api/vehicles — user-scoped vehicle list (camelCase → snake_case mapping)
  - [x] GET /api/vehicles/[id] — single vehicle by vehicleId
  - [x] GET /api/alerts — user-scoped alert list
  - [x] DELETE /api/user/data — clear vehicles + alerts + upload history
  - [x] DELETE /api/user/account — delete everything + user record
- [x] 18 CSV Upload — Single File (dropzone → parse → DB)
  - [x] Client: drag-and-drop dropzone, papaparse preview, upload button
  - [x] Blocking full-screen overlay with spinner + cancel after 60s (AbortController)
  - [x] Confirmation dialog on success (Go to fleet / Upload another)
  - [x] Query cache invalidation on upload complete
- [x] 19 CSV Upload — Batch + Upload History
  - [x] Batch insert all rows from CSV in POST /api/upload
  - [x] UploadHistory record created per upload (status, rowCount, errorCount)
  - [x] CSV columns mapped to model fields via fieldMap (handles actual CSV headers)
- [x] 20 Migration — Hooks from Static to API
  - [x] useVehicles — fetches from /api/vehicles only (no static fallback)
  - [x] useAlerts — fetches from /api/alerts only (no static fallback)
  - [x] useVehicle — fetches from /api/vehicles/[id]
  - [x] useVehicleCount — reads from cache or fetches
  - [x] Dashboard empty state when no vehicles exist
- [x] 21 Settings Page — Account Management
  - [x] Change password (current + new, bcrypt verify + rehash)
  - [x] Delete all data (confirmation dialog with warning, query cache invalidation)
  - [x] Delete account (confirmation dialog, cascading delete, signOut)
  - [x] Success banner after data deletion

---

## Decisions Made During Build

### Frontend (MVP)
- **Stack:** Next.js 16 + shadcn/ui + Recharts + TanStack Query + Framer Motion
- **Health score:** Uses CSV's soh_percent as baseline, adjusted by temperature/fast-charge/discharge/driving-style penalties
- **Theme:** `.dark` class on `<html>` with CSS custom property remapping
- **Fonts:** Inter (UI) + JetBrains Mono (data) via next/font/google
- **Predictions:** Linear remaining-cycles estimate based on current degradation rate
- **Alerts:** Auto-generated from vehicles with health < 80, sorted by severity

### Backend
- **Database:** PostgreSQL (Neon serverless) with Prisma v7 ORM
- **Auth:** Auth.js v5 (next-auth@beta) with Credentials provider, **JWT strategy** (database strategy incompatible with Credentials provider)
- **Password hashing:** bcryptjs (10 salt rounds)
- **Prisma v7 specifics:** `prisma-client` generator (not `prisma-client-js`), requires `prisma.config.ts`, needs driver adapter (`@prisma/adapter-pg` + `pg`), `PrismaClient` requires `{ adapter }` option
- **Migration:** `prisma db push` for Neon (no shadow database permission); used `prisma migrate diff` to generate SQL + `prisma migrate resolve` to mark as applied
- **Neon permissions:** `authenticator` role lacks DDL permissions — used `neondb_owner` role for schema changes
- **CSV parsing:** papaparse (client preview, in-memory — file discarded after parse)
- **Upload flow:** Client parses CSV → sends JSON rows to POST /api/upload → maps CSV column names (Vehicle_ID, Car_Model, Battery_Capacity_kWh, etc.) via fieldMap → batch inserts to Prisma → records UploadHistory → invalidates query cache
- **API pattern:** Route Handlers returning JSON, all scoped to authenticated user via `auth()`
- **Data isolation:** All queries filter by userId — no multi-tenant data leakage
- **New user state:** Empty — no seed data, upload page is the entry point
- **Existing static data** (`data/vehicles.ts`, `data/alerts.ts`) — no longer used by hooks; kept for reference
- **CSV column mapping:** The source CSV (ev_battery_degradation_data.csv) uses headers like `Car_Model`, `Battery_Capacity_kWh`, `Vehicle_Age_Months`, `Total_Charging_Cycles`, `Avg_Temperature_C`, `Avg_Discharge_Rate_C` — mapped to camelCase model fields via fieldMap in `/api/upload`
- **Driving_Style normalization:** CSV stores capitalized values (Aggressive, Moderate, Conservative) — normalized to lowercase on insert
- **vehicle_age computation:** DB stores months (from Vehicle_Age_Months); API returns `vehicle_age` in years and `vehicle_age_months` as-is for frontend compatibility

---

## What to Do Next

1. **Remove static data dependencies** — `generateStaticParams` in fleet/[vehicleId] still generates 10k+ static HTML pages from `data/vehicles.ts`. Remove or switch to dynamic rendering now that data comes from the API.
2. **Delete mock-auth artifacts** — old `lib/data.ts` (getVehicles, getAlerts etc.) and `data/vehicles.ts` / `data/alerts.ts` are no longer consumed by hooks but kept as reference. Can be removed.
3. **Add edit/delete per vehicle** — individual vehicle management in the fleet page.
4. **Analytics page** — migrate from static-data calculations to API-driven data (currently uses useVehicles which already reads from API, so it should work).
5. **Fleet vehicle detail page** — `app/(dashboard)/fleet/[vehicleId]/page.tsx` uses `generateStaticParams` and reads from static data; needs migration to `useVehicle(id)` hook.
