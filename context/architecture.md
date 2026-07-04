# Architecture

## Stack

| Layer            | Tool                          | Purpose                              |
| ---------------- | ----------------------------- | ------------------------------------ |
| Framework        | Next.js 16 (App Router)       | Full stack framework                  |
| Styling          | Tailwind CSS v4               | Utility styling, tokens via `@theme`  |
| Language         | TypeScript strict             | Throughout                            |
| UI Components    | shadcn/ui (Radix primitives)  | Accessible dashboard components       |
| Charts           | Recharts                      | Degradation curves, distributions     |
| Data Fetching    | TanStack Query                | Client-side data (simulated async)    |
| Icons            | lucide-react                  | All icons                             |
| Fonts            | next/font/google              | Inter (UI), JetBrains Mono (data)     |
| Animations       | Framer Motion (light)         | Layout transitions, card reveals      |
| Form Validation  | Zod                           | Login form validation                 |
| Deployment       | Vercel                        | Hosting                               |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout, fonts, ThemeProvider
│   ├── page.tsx                            → Redirects to /dashboard or /login
│   ├── login/
│   │   └── page.tsx                        → Mock login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                      → Sidebar + header shell
│   │   ├── page.tsx                        → Fleet dashboard overview
│   │   ├── fleet/
│   │   │   ├── page.tsx                    → Full fleet table
│   │   │   └── [vehicleId]/
│   │   │       └── page.tsx                → Vehicle detail + degradation charts
│   │   ├── analytics/
│   │   │   └── page.tsx                    → Cross-fleet analytics
│   │   └── alerts/
│   │       └── page.tsx                    → Alerts dashboard
│   └── api/                                → (future API routes — empty in MVP)
├── components/
│   ├── ui/                                 → shadcn/ui primitives (button, input, card, table, badge, etc.)
│   ├── dashboard/
│   │   ├── DashboardShell.tsx              → Sidebar + header layout
│   │   ├── Sidebar.tsx                     → Navigation sidebar
│   │   ├── Header.tsx                      → Top header bar
│   │   ├── StatCard.tsx                    → Metric display card
│   │   ├── HealthDistributionChart.tsx     → Bar chart: health score buckets
│   │   └── RecentAlerts.tsx                → Alert feed widget
│   ├── fleet/
│   │   ├── FleetTable.tsx                  → Sortable/filterable table
│   │   ├── FleetFilters.tsx                → Filter controls
│   │   ├── VehicleHeroCard.tsx             → Summary card for detail page
│   │   ├── DegradationChart.tsx            → SoH vs cycles line chart
│   │   ├── TemperatureChart.tsx            → Temp history chart
│   │   └── PredictionWidget.tsx            → RUL prediction display
│   ├── analytics/
│   │   ├── BatteryTypeComparison.tsx       → Degradation by battery type
│   │   ├── DrivingStyleImpact.tsx          → Degradation by driving style
│   │   ├── FastChargeAnalysis.tsx          → Fast-charge correlation chart
│   │   └── TemperatureCorrelation.tsx      → Scatter plot: temp vs health
│   ├── alerts/
│   │   ├── AlertTable.tsx                  → Alerts list with severity
│   │   └── AlertBadge.tsx                  → Severity badge
│   ├── auth/
│   │   ├── LoginForm.tsx                   → Login form with Zod validation
│   │   └── AuthGuard.tsx                   → Route protection wrapper
│   └── motion/
│       ├── FadeIn.tsx                      → Fade-in reveal wrapper
│       └── SlideIn.tsx                     → Slide-in wrapper
├── lib/
│   ├── utils.ts                            → cn() utility
│   ├── auth.ts                             → Mock auth (localStorage)
│   ├── data.ts                             → Async data helpers (simulated API)
│   └── predictions.ts                      → Health score & RUL formula
├── data/
│   ├── vehicles.ts                         → Vehicle telemetry data (transformed from CSV)
│   ├── alerts.ts                           → Mock alerts data
│   └── site.ts                             → Site-wide config
├── hooks/
│   ├── useAuth.ts                          → Auth context hook
│   ├── useVehicles.ts                      → TanStack Query wrapper for vehicle data
│   └── useAlerts.ts                        → TanStack Query wrapper for alert data
└── types/
    └── index.ts                            → Shared types (Vehicle, Alert, etc.)
```

---

## System Boundaries

| Folder         | Owns                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| `app/`         | Routes and layout composition only. No data querying inline here.                        |
| `app/(dashboard)/` | Dashboard route group — shares the sidebar/header layout. No auth-visible routes live outside this group. |
| `components/`  | UI components and section composition. Data is received via props, not fetched directly.  |
| `components/ui/` | shadcn/ui primitives. Only generic, unstyled, accessible base components live here.      |
| `lib/`         | Pure utility functions, auth helpers, prediction formulas. No React, no side effects.     |
| `data/`        | All static placeholder data. Components never reference these files directly — hooks mediate. |
| `hooks/`       | TanStack Query wrappers that read from `data/` (simulating async API calls). Components call hooks, never `data/` directly. |
| `types/`       | Shared TypeScript types.                                                                  |

---

## Data Flow

```
data/*.ts (static TS files)
        ↓
hooks/*.ts (TanStack Query — useQuery wrapping a simulated async delay)
        ↓
Components receive data via hook return value (data, isLoading, error)
        ↓
Child presentational components receive sliced data as props
        ↓
Charts render via Recharts in dedicated chart components
```

### Auth Flow

```
User enters email/password on /login
        ↓
LoginForm validates with Zod schema
        ↓
lib/auth.ts stores session to localStorage ({ email, name, loggedInAt })
        ↓
AuthGuard reads localStorage, redirects to /login if no session
        ↓
Logout clears localStorage, redirects to /login
```

### Simulated API Pattern

```typescript
// hooks/useVehicles.ts
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/lib/data";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles, // lib/data.ts wraps a setTimeout delay
  });
}
```

```typescript
// lib/data.ts
import { vehicles } from "@/data/vehicles";

export async function getVehicles(): Promise<Vehicle[]> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
  return vehicles;
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  return vehicles.find((v) => v.vehicle_id === id);
}
```

This pattern means every data-consuming component already works with `isLoading`/`error` states before any real API exists. Swapping static data for a real fetch call requires changing only the `lib/data.ts` implementation — no component changes.

---

## Health Score & Prediction Formula

Health score and remaining useful life are deterministic formulas in the MVP, designed to produce believable relative rankings:

```typescript
// lib/predictions.ts

export function calculateHealthScore(vehicle: Vehicle): number {
  let score = 100;

  // Cycle degradation: ~0.02% per cycle
  score -= vehicle.total_charging_cycle * 0.02;

  // Temperature penalty: above 35°C accelerates degradation
  if (vehicle.avg_temp_c > 35) {
    score -= (vehicle.avg_temp_c - 35) * 0.5;
  }

  // Fast-charge penalty: ratio > 0.6
  if (vehicle.fast_charge_ratio > 0.6) {
    score -= (vehicle.fast_charge_ratio - 0.6) * 15;
  }

  // Discharge rate penalty: higher rates = more stress
  if (vehicle.avg_discharge_rate > 1.5) {
    score -= (vehicle.avg_discharge_rate - 1.5) * 8;
  }

  // Driving style penalty
  if (vehicle.driving_style === "aggressive") score -= 8;
  if (vehicle.driving_style === "moderate") score -= 3;

  // Battery type resilience factor
  if (vehicle.battery_type === "LFP") score += 2;  // More resilient
  if (vehicle.battery_type === "NCA") score -= 2;  // Less resilient

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function predictRemainingCycles(vehicle: Vehicle): number {
  const health = calculateHealthScore(vehicle);
  const cyclesPerYear = vehicle.total_charging_cycle / Math.max(1, vehicle.vehicle_age);
  const degradationPerCycle = (100 - health) / Math.max(1, vehicle.total_charging_cycle);

  // Estimate cycles until health reaches 60% (end of life threshold)
  const cyclesToEOL = (health - 60) / Math.max(0.001, degradationPerCycle);
  return Math.max(0, Math.round(cyclesToEOL));
}
```

---

## Component Patterns

### Client vs Server

- Pages and layout composition default to Server Components
- Any component using TanStack Query, React state, browser APIs, or interactivity is a Client Component (`"use client"`)
- shadcn/ui components are Client Components (they use Radix primitives with state)
- Layout shell (sidebar/header) is a Client Component for the interactive parts, wrapping server content via `children`

### Data Fetching Pattern

```typescript
"use client";

import { useVehicles } from "@/hooks/useVehicles";
import { FleetTable } from "@/components/fleet/FleetTable";

export default function FleetPage() {
  const { data: vehicles, isLoading, error } = useVehicles();

  if (isLoading) return <FleetTableSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  return <FleetTable vehicles={vehicles} />;
}
```

### Route Protection Pattern

```typescript
// components/auth/AuthGuard.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

---

## Constants

- Health score range: 0–100 (100 = perfect)
- End-of-life threshold: score < 60 → "replace soon"
- Alert severity: `critical` (< 60), `warning` (60–75), `info` (75–90)
- Simulated API delay: 200–500ms
- Session storage key: `battery-analytics-session`
- Theme storage key: `battery-analytics-theme`
