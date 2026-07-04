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

## Feature Count

| Phase | Features |
|-------|----------|
| Phase 1 — Foundation | 4 |
| Phase 2 — Data Layer | 1 |
| Phase 3 — Dashboard Overview | 1 |
| Phase 4 — Fleet Pages | 2 |
| Phase 5 — Analytics & Alerts | 2 |
| Phase 6 — Polish & Responsive | 4 |
| **Total** | **14** |
