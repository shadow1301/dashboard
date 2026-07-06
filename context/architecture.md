# Architecture

## Stack

| Layer              | Tool                          | Purpose                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| Framework          | Next.js 16 (App Router)       | Full stack framework                  |
| Styling            | Tailwind CSS v4               | Utility styling, tokens via `@theme`  |
| Language           | TypeScript strict             | Throughout                            |
| UI Components      | shadcn/ui (Radix primitives)  | Accessible dashboard components       |
| Charts             | Recharts                      | Degradation curves, distributions     |
| Data Fetching      | TanStack Query                | Client-side data from API routes      |
| Icons              | lucide-react                  | All icons                             |
| Fonts              | next/font/google              | Inter (UI), JetBrains Mono (data)     |
| Animations         | Framer Motion (light)         | Layout transitions, card reveals      |
| Form Validation    | Zod                           | Login form, CSV upload validation     |
| Database           | PostgreSQL                    | Production data store                  |
| ORM                | Prisma                        | Type-safe database access              |
| Auth               | Auth.js v5 (NextAuth.js)      | Email/password auth with JWT strategy  |
| File Upload        | — (JSON body)                 | CSV parsed client-side, JSON sent to API |
| CSV Parsing        | papaparse                     | Client + server CSV parsing            |
| Password Hashing   | bcryptjs                      | Secure password storage                |
| Database Hosting   | Neon                           | Serverless PostgreSQL                   |
| Deployment         | Vercel                         | Hosting                              |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/                             → All project context files
├── app/
│   ├── layout.tsx                       → Root layout, fonts, SessionProvider
│   ├── page.tsx                         → Redirects to /dashboard or /login
│   ├── login/
│   │   └── page.tsx                     → Login page
│   ├── register/
│   │   └── page.tsx                     → Registration page
│   ├── (dashboard)/
│   │   ├── layout.tsx                   → Sidebar + header shell (protected)
│   │   ├── dashboard/
│   │   │   └── page.tsx                 → Fleet dashboard overview
│   │   ├── fleet/
│   │   │   ├── page.tsx                 → Fleet table (client paginated, filters via ?drivingStyle=)
│   │   │   └── [vehicleId]/
│   │   │       └── page.tsx             → Vehicle detail + degradation charts
│   │   ├── analytics/
│   │   │   └── page.tsx                 → Cross-fleet analytics
│   │   ├── alerts/
│   │   │   └── page.tsx                 → Alerts dashboard
│   │   ├── upload/
│   │   │   └── page.tsx                 → CSV upload (single file, JSON body)
│   │   ├── upload-history/
│   │   │   └── page.tsx                 → Upload history
│   │   └── settings/
│   │       └── page.tsx                 → Account settings
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts             → Auth.js API routes
│       ├── vehicles/
│       │   ├── route.ts                 → GET /api/vehicles (paginated, filtered)
│       │   └── [vehicleId]/
│       │       └── route.ts             → GET /api/vehicles/[vehicleId]
│       ├── alerts/
│       │   ├── route.ts                 → GET /api/alerts
│       │   └── [alertId]/
│       │       └── route.ts             → PATCH /api/alerts/[alertId] (mark read/dismiss)
│       ├── analytics/
│       │   └── route.ts                 → GET /api/analytics (aggregated stats)
│       ├── upload/
│       │   ├── route.ts                 → POST /api/upload (single file)
│       │   └── batch/
│       │       └── route.ts             → POST /api/upload/batch
│       └── upload-history/
│           └── route.ts                 → GET /api/upload-history
├── components/
│   ├── ui/                              → shadcn/ui primitives
│   ├── dashboard/                       → Dashboard overview components
│   ├── fleet/                           → Fleet table, vehicle detail components
│   ├── analytics/                       → Analytics chart components + FleetInsights narrative
│   ├── alerts/                          → Alert table components
│   ├── upload/
│   │   ├── FileDropzone.tsx             → Drag-and-drop upload zone
│   │   ├── UploadProgress.tsx           → Per-file progress indicator
│   │   ├── BatchUploadList.tsx          → Batch file queue
│   │   ├── UploadResult.tsx             → Success/error summary after upload
│   │   └── CsvPreview.tsx               → Preview parsed CSV rows before upload
│   ├── auth/
│   │   ├── LoginForm.tsx                → Login form with validation
│   │   ├── RegisterForm.tsx             → Registration form
│   │   └── AuthGuard.tsx                → Route protection (redirect if no session)
│   └── motion/                          → FramerMotion wrappers
├── lib/
│   ├── utils.ts                         → cn() utility
│   ├── auth.ts                          → Auth.js config (authOptions, hash/verify)
│   ├── prisma.ts                        → Prisma client singleton (PrismaPg adapter)
│   ├── __generated__/prisma/            → Prisma client output
│   ├── providers.tsx                    → SessionProvider + QueryClientProvider + ThemeProvider + Toaster
│   ├── predictions.ts                   → Health score & RUL formula
│   └── theme.ts                         → Theme get/set localStorage helpers
├── hooks/
│   ├── useAuth.ts                       → Session info hook (useSession wrapper)
│   ├── useVehicles.ts                   → TanStack Query: vehicle list + single + count
│   ├── useAlerts.ts                     → TanStack Query: alerts + alerts by vehicle
│   └── useChartColors.ts               → Recharts color tokens from CSS variables
├── prisma/
│   └── schema.prisma                    → Database schema
├── types/
│   └── index.ts                         → Shared types
└── prisma.config.ts                     → Prisma v7 config (defineConfig)
```

---

## System Boundaries

| Folder           | Owns                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `app/`           | Routes and layout composition only. No data fetching logic inline (except RSC where needed). |
| `app/(dashboard)/` | Dashboard route group — all authenticated routes share sidebar/header layout.            |
| `app/api/`       | REST API route handlers — all DB access happens here. Return JSON.                       |
| `components/`    | UI components. Receive data via props from page components.                              |
| `components/ui/` | shadcn/ui primitives. Generic, unstyled, accessible.                                     |
| `lib/`           | Pure utility functions, DB helpers, auth config, CSV parsing. No React, no side effects. |
| `hooks/`         | TanStack Query wrappers — the bridge between API routes and components.                  |
| `prisma/`        | DB schema, migrations.                                                                    |
| `types/`         | Shared TypeScript types.                                                                 |

---

## Data Flow

```
User uploads CSV via /upload
         ↓
app/api/upload/route.ts — receives file as FormData (in-memory, no disk write)
         ↓
Parses with papaparse, validates each row with Zod schema
         ↓
CSV file object discarded after parsing — never stored
         ↓
Inserts valid rows into vehicles table (user_id scoped) via Prisma transaction
         ↓
Creates upload_history record with row count, error count, status
         ↓
Returns summary: inserted count, error rows (with line numbers)
         ↓
--- Subsequent page loads ---
         ↓
Component → hook (useVehicles) → TanStack Query → GET /api/vehicles?page=1&limit=50
         ↓
API route → auth check (getServerSession) → Prisma query (user_id filtered) → JSON response
```

### Auth Flow (Auth.js v5)

```
User registers via /register
         ↓
POST /api/auth/register → creates user in DB (email + bcrypt hashed password)
         ↓
Redirect to /login
         ↓
User enters credentials on /login
         ↓
POST /api/auth/callback/credentials → Auth.js validates email/password
         ↓
Session created in DB (via Auth.js database adapter)
         ↓
NextAuth.js session cookie set
         ↓
AuthGuard (useSession) reads session, redirects to /login if unauthenticated
         ↓
Logout → POST /api/auth/signout → clears session from DB + cookie
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  vehicles      Vehicle[]
  alerts        Alert[]
  uploadHistory UploadHistory[]
  accounts      Account[]      // Auth.js
  sessions      Session[]     // Auth.js
}

model Vehicle {
  id                  String   @id @default(cuid())
  userId              String
  vehicleId           String
  vehicleModel        String
  batteryType         String   // LFP | NMC | NCA
  batteryCapacity     Float
  vehicleAge          Int      // years
  totalChargingCycle  Int
  avgTempC            Float
  fastChargeRatio     Float    // 0-1
  avgDischargeRate    Float    // C-rate
  drivingStyle        String   // gentle | moderate | aggressive
  sohPercent          Float
  createdAt           DateTime @default(now())

  user    User         @relation(fields: [userId], references: [id])
  alerts  Alert[]

  @@unique([userId, vehicleId])
  @@index([userId])
}

model Alert {
  id          String   @id @default(cuid())
  userId      String
  vehicleId   String
  severity    String   // critical | warning | info
  alertType   String   // low_health | high_temp | fast_charge
  description String
  status      String   @default("unread") // unread | read | dismissed
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  vehicle Vehicle @relation(fields: [userId, vehicleId], references: [userId, vehicleId])

  @@index([userId, status])
}

model UploadHistory {
  id          String   @id @default(cuid())
  userId      String
  filename    String
  fileSize    Int      // bytes
  rowCount    Int
  errorCount  Int
  errors      Json?    // Array of { row: number, field: string, message: string }
  status      String   // processing | completed | failed
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

// Auth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id])

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
}
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create account |
| GET/POST | /api/auth/[...nextauth] | Varies | Auth.js endpoints |
| GET | /api/vehicles | Yes | Paginated vehicle list (query: page, limit, search, sort, filter) |
| GET | /api/vehicles/[vehicleId] | Yes | Single vehicle detail |
| GET | /api/alerts | Yes | Alerts list (query: severity, status, page, limit) |
| PATCH | /api/alerts/[alertId] | Yes | Mark as read / dismiss |
| GET | /api/analytics | Yes | Aggregated analytics data |
| POST | /api/upload | Yes | CSV upload (JSON body: { filename, rows }) |
| DELETE | /api/vehicles/[vehicleId] | Yes | Delete vehicle + its alerts |
| DELETE | /api/user/data | Yes | Delete all user data (vehicles, alerts, upload history) |
| DELETE | /api/user/account | Yes | Delete user account + all data |
| POST | /api/auth/password | Yes | Change password (current + new) |
| GET | /api/upload-history | Yes | Past upload records |

### File Upload Contract

```
POST /api/upload
Content-Type: application/json
Body: { filename: string, rows: Record<string, string>[] }

Response 200:
{ "count": 950 }

Response 400:
{ "error": "description" }
```

---

## Health Score & Prediction Formula

Health score and remaining useful life are deterministic formulas, designed to produce believable relative rankings:

```typescript
// lib/predictions.ts

export function calculateHealthScore(vehicle: {
  sohPercent: number;
  totalChargingCycle: number;
  avgTempC: number;
  fastChargeRatio: number;
  avgDischargeRate: number;
  drivingStyle: string;
  batteryType: string;
}): number {
  let score = vehicle.sohPercent;

  // Temperature penalty: above 35°C accelerates degradation
  if (vehicle.avgTempC > 35) {
    score -= (vehicle.avgTempC - 35) * 0.5;
  }

  // Fast-charge penalty: ratio > 0.6
  if (vehicle.fastChargeRatio > 0.6) {
    score -= (vehicle.fastChargeRatio - 0.6) * 15;
  }

  // Discharge rate penalty: higher rates = more stress
  if (vehicle.avgDischargeRate > 1.5) {
    score -= (vehicle.avgDischargeRate - 1.5) * 8;
  }

  // Driving style penalty
  if (vehicle.drivingStyle === "aggressive") score -= 8;
  if (vehicle.drivingStyle === "moderate") score -= 3;

  // Battery type resilience factor
  if (vehicle.batteryType === "LFP") score += 2;
  if (vehicle.batteryType === "NCA") score -= 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function predictRemainingCycles(vehicle: {
  sohPercent: number;
  totalChargingCycle: number;
  vehicleAge: number;
}): number {
  const health = calculateHealthScore(vehicle);
  const cyclesPerYear = vehicle.totalChargingCycle / Math.max(1, vehicle.vehicleAge);
  const degradationPerCycle = (100 - health) / Math.max(1, vehicle.totalChargingCycle);
  const cyclesToEOL = (health - 60) / Math.max(0.001, degradationPerCycle);
  return Math.max(0, Math.round(cyclesToEOL));
}
```

Note: SoH comes from the CSV (`soh_percent`), not calculated. Health score adjusts it for operational factors.

---

## Component Patterns

### Client vs Server

- Pages and layout composition default to Server Components
- API route handlers are server-side
- Components using TanStack Query, React state, browser APIs, or interactivity are Client Components
- shadcn/ui components are Client Components
- Auth-related pages (login, register) are Client Components for form interactivity

### Data Fetching Pattern (Backend-connected)

```typescript
// hooks/useVehicles.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export function useVehicles(params: { page: number; limit?: number; search?: string }) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 50),
    ...(params.search && { search: params.search }),
  });

  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () =>
      fetch(`/api/vehicles?${searchParams}`).then((r) => r.json()),
  });
}
```

### Route Protection Pattern

```typescript
// components/auth/AuthGuard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return null;
  if (!session) return null;

  return <>{children}</>;
}
```

---

## Constants

- Health score range: 0–100 (100 = perfect)
- End-of-life threshold: score < 60 → "replace soon"
- Alert severity: `critical` (< 60), `warning` (60–79), `info` (80–90)
- Client pagination defaults: 20 per page (fleet), 15 per page (alerts)
- URL-driven filters: fleet page reads `?drivingStyle=` from search params
- CSV max file size: 10MB (single), 50MB total (batch)
- Supported CSV columns must match Vehicle type
- New user state: empty — no seed data, upload page is the entry point
- CSV file handling: in-memory only — parsed via papaparse, file object discarded immediately after processing
- Session storage key: `battery-analytics-theme` (theme only, auth uses Auth.js cookies)
