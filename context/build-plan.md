# Build Plan

## Core Principle

Build the full dashboard UI with placeholder data first — verified visually and in-browser before moving to the next section. Every feature must be visible and testable before proceeding. No invisible phases.

---

## Phase 1 — Foundation

### 01 Project Setup & Design Tokens

Set up the base Next.js 16 project, Tailwind v4 tokens, fonts, and TanStack Query foundation before any dashboard content is built.

**Logic:**

- Initialize Next.js 16 App Router project, TypeScript strict
- Install approved dependencies (see code-standards.md)
- Initialize shadcn/ui with default components: button, card, input, badge, table, skeleton, select, dialog, dropdown-menu
- Define all tokens in `app/globals.css` per ui-tokens.md
- Set up `next/font/google` — Inter + JetBrains Mono
- Create `lib/utils.ts` — `cn()` utility
- Create `lib/providers.tsx` — wraps app with QueryClientProvider
- Wire providers into `app/layout.tsx`
- Create `types/index.ts` — shared Vehicle, Alert, etc. types
- Create `data/site.ts` — site-wide config constants

**Verification:** App compiles clean, `cn()` utility works, fonts load with correct variable names.

---

### 02 Theme System — Light & Dark

Build theme infrastructure before any themed UI is built.

**Logic:**

- Define `:root` (dark) and `[data-theme="light"]` tokens in `app/globals.css` per ui-tokens.md
- Add the inline blocking theme-init script to `app/layout.tsx` (prevents flash of wrong theme)
- Create `lib/theme.ts` — get/set helpers for localStorage + data-theme attribute
- Create a simple ThemeToggle component (sun/moon icons, Framer Motion icon swap on toggle)
- Verify theme toggle works and choice persists on hard refresh

**Verification:** Toggle switches the entire page between themes, no flash on reload in either theme, choice persists.

---

### 03 Layout Shell — Login Page

Build the login/authentication entry point.

**UI:**

- Centered card layout on `bg-background`
- App logo/name, email + password fields, submit button
- Zod validation, inline errors, loading state on submit

**Logic:**

- `LoginForm.tsx` — form with Zod schema validation
- `lib/auth.ts` — mock auth that stores session to localStorage (any email + password works)
- `hooks/useAuth.ts` — auth context/hook that reads localStorage
- `components/auth/AuthGuard.tsx` — route protection wrapper that redirects to `/login` if unauthenticated
- `app/login/page.tsx` — renders LoginForm

**Verification:** Enter any email/password → redirected to `/dashboard`. Refresh → still authenticated. Click logout → back to `/login`. Visit `/dashboard` without session → redirected to `/login`.

---

### 04 Layout Shell — Dashboard Shell (Sidebar + Header)

Build the persistent dashboard layout used across all authenticated pages.

**UI:**

- `Sidebar.tsx` — 240px fixed width, nav links with icons, active state, theme toggle at bottom, logout
- `Header.tsx` — 64px fixed height, page title, theme toggle, user menu dropdown with logout
- `DashboardShell.tsx` — composes sidebar + header + content area
- `app/(dashboard)/layout.tsx` — wraps all dashboard pages with DashboardShell + AuthGuard

**Logic:**

- Sidebar nav items: Dashboard, Fleet, Analytics, Alerts
- Active route highlighted via `usePathname()`
- Mobile: sidebar hidden by default, hamburger toggle opens as overlay
- Responsive: sidebar disappears below 768px, hamburger appears

**Verification:** Navigation links highlight correctly. Sidebar collapses on mobile. Content renders in the main area.

---

## Phase 2 — Data Layer

### 05 Vehicle Data + Health Score Logic

Create the static data files and the prediction/health-score engine before any analysis UI is built.

**Logic:**

- Transform CSV data into `data/vehicles.ts` with the full Vehicle type
- Create `lib/predictions.ts` — `calculateHealthScore()` and `predictRemainingCycles()` formulas
- Create `lib/data.ts` — async wrapper functions (`getVehicles`, `getVehicleById`, etc.) with simulated delay
- Create `hooks/useVehicles.ts`, `hooks/useVehicle.ts` — TanStack Query wrappers
- Seed `data/alerts.ts` with mock alerts derived from low-health vehicles
- Create `hooks/useAlerts.ts`

**Verification:** `calculateHealthScore()` produces believable scores — high-cycle/high-temp/high fast-charge vehicles score lower. Data flows through hooks correctly with loading/error/success states.

---

## Phase 3 — Dashboard Overview

### 06 Dashboard Page — Stat Cards + Health Distribution + Alerts

Build the main `/dashboard` landing page.

**UI:**

- 4 StatCards: Total Vehicles, Avg Health Score, At-Risk Count (<60), Avg Degradation Rate
- Health Distribution Bar Chart — vehicles grouped by score bucket
- Battery Type Breakdown — simple comparison chart or table
- Recent Alerts feed — last 5 alerts with severity + link to vehicle
- All wrapped in the dashboard card pattern (bg-surface, border, rounded-lg)

**Logic:**

- Derive aggregate stats from `useVehicles()` data
- Filter vehicles into health buckets for the distribution chart
- Pass sliced alerts to RecentAlerts
- Each StatCard click navigates to relevant section
- Loading state shows skeleton cards
- Error state shows error message + retry

**Verification:** All 4 metrics display correctly. Chart renders with data. Alerts show. Resize to tablet/mobile — layout adapts.

---

## Phase 4 — Fleet Pages

### 07 Fleet Table Page — Full UI

Build `/fleet` with a sortable, filterable, searchable table.

**UI:**

- `FleetFilters.tsx` — search input, battery type dropdown, driving style dropdown, health range filter
- `FleetTable.tsx` — columns: Vehicle ID, Model, Battery Type, Capacity, Age, Cycles, Health Score (badge), Status
- Sortable columns (click header to sort)
- Click row → navigate to `/fleet/[vehicleId]`

**Logic:**

- Client-side sort, filter, and search (data is small enough for this in MVP)
- Filter state synced with URL search params for shareable filtered views
- Mobile: table switches to card-style list
- Loading state: skeleton rows
- Empty state: "No vehicles match your filters" + clear button

**Verification:** Sort by each column works. Filters narrow results. Search by vehicle ID or model works. Mobile layout shows cards. Click row navigates to vehicle detail.

---

### 08 Vehicle Detail Page — Full UI

Build `/fleet/[vehicleId]` with full degradation analysis.

**UI:**

- `VehicleHeroCard.tsx` — vehicle_id, model, battery type, capacity, age
- Stat row: health score (large, colored), remaining cycles prediction, total cycles, avg temp
- `DegradationChart.tsx` — SoH vs cycles, threshold lines at 60 and 80
- Charging profile: fast-charge ratio + discharge rate display
- `TemperatureChart.tsx` — mini chart showing temp bands
- `PredictionWidget.tsx` — remaining cycles estimate with confidence band
- "Flag for Maintenance" button → creates a mock alert
- Back link to `/fleet`

**Logic:**

- `generateStaticParams` pre-renders all vehicle detail pages
- Health score and prediction calculated from the same formulas
- Degradation chart shows simulated curve based on current data
- 404 handling for invalid vehicle IDs

**Verification:** Page loads with correct vehicle data. Chart renders with proper thresholds. Prediction widget shows sensible values. Flag button works. Invalid ID shows 404.

---

## Phase 5 — Analytics & Alerts

### 09 Analytics Page — Cross-Fleet Insights

Build `/analytics` with comparative analysis charts.

**UI:**

- `BatteryTypeComparison.tsx` — bar chart comparing avg health score by battery type (LFP vs NMC vs NCA)
- `DrivingStyleImpact.tsx` — bar or box chart showing health distribution by driving style
- `FastChargeAnalysis.tsx` — scatter or bar chart correlating fast-charge ratio with health score
- `TemperatureCorrelation.tsx` — scatter plot: avg temp vs health score, colored by battery type

**Logic:**

- Group/filter vehicle data by the relevant dimension
- Each chart is its own component with loading/error/empty states
- Charts share the same card container pattern

**Verification:** Each chart renders with correct data aggregation. Hover tooltips work. Empty data scenarios display properly.

---

### 10 Alerts Page — Full UI

Build `/alerts` with severity filtering and status management.

**UI:**

- Filter bar: severity filter (All / Critical / Warning / Info), status filter (All / Unread / Read)
- `AlertTable.tsx` — columns: severity badge, vehicle ID (linked), alert type, description, timestamp, status, actions
- Left border color coded by severity
- Unread indicator dot
- Actions: Mark as Read, Dismiss

**Logic:**

- Initially derived from `data/alerts.ts` — vehicles with health < 75 get an alert
- Filter state updates table in real time
- Mark as read / dismiss updates local state (no persistence in MVP)
- "Resolve" action changes alert status

**Verification:** Alerts display with correct severity colors. Filters work. Mark as read and dismiss work. Empty state shows when all alerts dismissed.

---

## Phase 6 — Polish & Responsive

### 11 Loading, Empty, Error States Audit

Review every data-driven component and ensure all four states are handled.

**Logic:**

- Create `LoadingSkeleton.tsx` components for each major layout (dashboard, table, chart, detail page)
- Verify error states display a retry button that re-fetches
- Verify empty states have clear messaging and suggested action
- Check tooltip/empty states for all charts

---

### 12 Responsive Pass

Audit every page at all breakpoints.

**Logic:**

- 390px: single column, stacked cards, no sidebar, hamburger nav, tables → card list
- 768px: 2-column card grid, sidebar overlay, charts stack
- 1440px: full layout, 4-column stat grid
- 1920px: verify content doesn't stretch awkwardly — chart containers cap at reasonable max-width if needed
- Check sidebar collapse behavior at each breakpoint
- Verify charts don't overlap or clip at narrow widths

---

### 13 Accessibility & Reduced Motion Pass

**Logic:**

- `prefers-reduced-motion` respected — Framer Motion simplified or disabled
- Keyboard navigation through sidebar, tables, filters, and forms
- Visible focus states on all interactive elements
- Alt text on any images (unlikely in this project — mostly charts with aria-labels)
- Chart aria-labels and/or off-screen descriptions
- Severity never conveyed by color alone — text labels always present
- Form inputs have associated labels

---

### 14 Performance Pass

**Logic:**

- No layout-shift-causing animated properties
- Lazy load below-fold charts (conditionally render or use `dynamic` import)
- Verify no unnecessary re-renders in table/filter interactions
- Lighthouse pass on dashboard and fleet page
- Confirm TanStack Query caching prevents unnecessary re-fetches on route changes

---

---

## Phase 7 — Backend (Database, Auth, CSV Upload)

### 15 Database Setup — PostgreSQL + Prisma

Set up the persistent data layer.

**Logic:**

- Provision PostgreSQL database on Neon (serverless, generous free tier)
- Install `prisma`, `@prisma/client`, `bcryptjs`, `next-auth`, `@auth/prisma-adapter`, `papaparse`
- Create `lib/prisma.ts` — singleton client
- Define `prisma/schema.prisma` with models: User, Vehicle, Alert, UploadHistory, Account, Session
- Run `npx prisma migrate dev` to create initial schema
- No seed script — new users see empty state, upload is the entry point
- Add `.env` file with `DATABASE_URL` (Neon connection string), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

**Dependencies:** prisma, @prisma/client, bcryptjs
**Verification:** `npx prisma db push` succeeds, `npx prisma studio` shows empty tables.

---

### 16 Auth System — NextAuth.js v5

Replace mock auth with real database-backed authentication.

**Logic:**

- Create `lib/auth.ts` — Auth.js config with Credentials provider, PrismaAdapter, bcrypt password verification
- Create `app/api/auth/[...nextauth]/route.ts` — API route handler
- Create `app/register/page.tsx` + `RegisterForm.tsx` — registration page with Zod validation
- Update `LoginForm.tsx` — POST to `/api/auth/callback/credentials` instead of localStorage
- Update `AuthGuard.tsx` — use `useSession()` from next-auth/react instead of custom context
- Update `lib/providers.tsx` — wrap with `<SessionProvider>`
- Add `useSession` hook everywhere session info is needed
- Remove mock `lib/auth.ts`, `hooks/useAuth.ts` (localStorage-based) — replaced by Auth.js

**Dependencies:** next-auth, @auth/prisma-adapter, bcryptjs
**Verification:** Register → login → protected route → refresh stays logged in → logout → redirect to login. Wrong credentials rejected. No localStorage auth artifacts remain.

---

### 17 API Routes — Vehicles + Alerts + Analytics

Build the REST API layer for all data access.

**Logic:**

- `app/api/vehicles/route.ts` — GET paginated, filtered, sortable vehicle list (scoped to user)
- `app/api/vehicles/[vehicleId]/route.ts` — GET single vehicle detail
- `app/api/alerts/route.ts` — GET paginated alerts with severity/status filters
- `app/api/alerts/[alertId]/route.ts` — PATCH mark as read / dismiss / delete
- `app/api/analytics/route.ts` — GET aggregated stats (avg health, distribution, at-risk count, etc.)
- All routes: check `getServerSession(authOptions)` first, scope queries to `userId`
- Update hooks (`useVehicles.ts`, `useAlerts.ts`) to call real API routes instead of static data
- Remove `lib/data.ts` (simulated async wrappers) — no longer needed
- Remove `data/` folder references from hooks (static files kept for reference)

**Dependencies:** None new
**Verification:** API routes return correct JSON. Pagination works. Filters work. Unauthorized requests return 401. Data is isolated per user.

---

### 18 CSV Upload — Single File

Build the CSV upload flow: front-end dropzone → back-end parse → insert to DB.

**UI:**

- `components/upload/FileDropzone.tsx` — drag-and-drop zone, file validation
- `components/upload/CsvPreview.tsx` — show first 5 rows before confirming
- `components/upload/UploadProgress.tsx` — progress bar during processing
- `components/upload/UploadResult.tsx` — success/error summary
- `app/(dashboard)/upload/page.tsx` — upload page

**Logic:**

- `app/api/upload/route.ts` — POST multipart form, parse CSV with papaparse, validate with Zod, insert to DB via Prisma transaction
- Create `lib/csv.ts` — CSV parsing + Zod validation helpers
- Server-side: validate file extension, file size (10MB max), parse headers, validate each row
- If errors: return error array with row numbers; valid rows inserted, invalid rows reported
- Create `UploadHistory` record after processing
- Auto-generate alerts based on SoH thresholds after successful upload
- Create `hooks/useUpload.ts` — TanStack Query mutation for upload
- Update sidebar nav: add "Upload" link

- CSV file processed in-memory only — parsed via papaparse `file.text()`, file object discarded after processing
- No disk write, no S3/R2 upload — CSV data lives only in the DB after successful parse

**Dependencies:** papaparse (Next.js 16 built-in `formData()` for multipart parsing)
**Verification:** Upload valid CSV → success summary + data appears in fleet. Upload invalid CSV → error list with row numbers. Upload wrong file type → rejected. Upload >10MB → rejected. Data scoped to user.

---

### 19 CSV Upload — Batch + History

Support multiple file upload and upload history tracking.

**UI:**

- `components/upload/BatchUploadList.tsx` — file queue with per-file progress
- Update `FileDropzone` to accept multiple files when in batch mode
- `app/(dashboard)/upload/history/page.tsx` — upload history table
- `hooks/useUploadHistory.ts` — TanStack Query for history

**Logic:**

- `app/api/upload/batch/route.ts` — POST multiple files, process sequentially, return combined summary
- Client-side: queue files, call batch endpoint, poll or stream progress per file
- `app/api/upload-history/route.ts` — GET paginated upload history for user
- History shows: filename, date, row count, error count, status (processing/completed/failed)
- Expandable row shows per-row errors if any

**Dependencies:** None new
**Verification:** Upload 3 CSV files → all appear in history. Batch with one failing file → partial success with errors. History page shows all uploads with correct status.

---

### 20 Migration — Hooks from Static to API

Update all existing hooks to fetch from API routes instead of static data.

**Logic:**

- `hooks/useVehicles.ts` — replace `getVehicles()` from `lib/data.ts` with `fetch("/api/vehicles?...")`
- `hooks/useAlerts.ts` — replace mock data with `fetch("/api/alerts?...")`
- `hooks/useVehicle.ts` — replace with `fetch("/api/vehicles/${id}")`
- Add `useAnalytics.ts` — fetch from `/api/analytics`
- Update all page components to use new hook signatures (pagination params, etc.)
- Update `app/(dashboard)/dashboard/page.tsx` to aggregate from API
- Remove `lib/data.ts`, `data/vehicles.ts`, `data/alerts.ts` (keep as reference, not imported)
- Add/update `lib/predictions.ts` — no changes needed, formula is already backend-agnostic

**Verification:** Every page loads data from API with correct loading/error/success states. No remaining imports from `data/` in any component or hook.

---

### 21 Settings Page — Account Management

Basic user settings page.

**UI:**

- `app/(dashboard)/settings/page.tsx` — settings page
- Display user email, name, account creation date
- Change password form (current password + new password)
- Danger zone: delete account (with confirmation dialog)

**Logic:**

- `app/api/settings/route.ts` — GET user profile, PATCH update profile
- `app/api/settings/password/route.ts` — POST change password (verify current, hash new)
- `app/api/settings/account/route.ts` — DELETE account (cascade delete all user data)

**Dependencies:** None new
**Verification:** Profile displays correctly. Password change works. Account deletion removes all user data.

---

## Feature Count

| Phase | Features |
|-------|----------|
| Phase 1 — Foundation | 4 |
| Phase 2 — Data Layer | 1 |
| Phase 3 — Dashboard Overview | 1 |
| Phase 4 — Fleet Pages | 2 |
| Phase 5 — Analytics & Alerts | 2 |
| Phase 6 — Polish & Responsive | 4 |
| Phase 7 — Backend | 7 |
| **Total** | **21** |
