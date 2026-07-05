# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception.

---

## Engineering Mindset

- **Think before implementing** — understand what is being built and why before writing code
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope
- **Every feature must be testable** — if it cannot be verified immediately (visually, in browser) after implementation, it is incomplete
- **Clean over clever** — simple readable code is always preferred over clever abstractions
- **One thing at a time** — complete one section/component fully before touching the next
- **Data from hooks, not directly** — components never import from `data/`; they call hooks that wrap TanStack Query

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props that are part of a public API
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- Components are Server Components by default
- Only add `"use client"` when the component requires:
  - TanStack Query hooks or React state
  - `useEffect`, browser APIs, event listeners
  - shadcn/ui primitives (they use Radix with state)
  - Interactive behavior (sorting, filtering, toggles)
- Never add `"use client"` to layout files unless absolutely required
- API routes (`app/api/`) handle all database access — never import Prisma or DB directly from page components
- Dynamic routes that use `params` must await it (`params` is a Promise in Next.js 16)

---

## API Route Standards

- All API route handlers validate authentication via `getServerSession(authOptions)` first
- Return consistent JSON response shape: `{ data?, error?, total?, page?, limit?, totalPages? }`
- Error responses: `{ error: string, code?: string }` with appropriate HTTP status codes
- Use Zod for request body validation in POST/PATCH handlers
- Pagination query params: `page` (default 1), `limit` (default 50, max 200)
- Sort query params: `sort` (field name), `order` (asc|desc)
- Filter query params: freeform per-route (documented in architecture.md)
- Never expose raw database errors to clients — map to user-friendly messages
- Use `try/catch` in route handlers and return 500 for unexpected errors

```typescript
// Example route handler pattern
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 50));

  try {
    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: { userId: session.user.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.vehicle.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}
```

---

## Database Standards

- All database access goes through Prisma — never raw SQL
- Prisma client is instantiated as a singleton in `lib/prisma.ts` (prevents hot-reload connection exhaustion)
- Migrations are run via `npx prisma migrate dev` during development, `npx prisma migrate deploy` in production
- Schema changes are tracked in the `prisma/migrations/` directory (committed to git)
- No seed data — new users see empty state; CSV upload is the data entry point
- All queries scope to `userId` for data isolation — never return data from other users
- Use transactions (`prisma.$transaction`) for multi-step operations (e.g., CSV upload + alert generation)
- Index all foreign keys and frequently-queried columns (userId, status, severity)

---

## Auth Standards

- Auth.js v5 (NextAuth.js) with Credentials provider — email/password via database adapter
- Passwords hashed with bcryptjs (10 salt rounds)
- Session stored in database (via Auth.js adapter) — not JWT
- Session checked via `getServerSession(authOptions)` in API routes
- Client-side session via `useSession()` from `next-auth/react`
- Registration creates user via `prisma.user.create()` — separate from Auth.js auth flow
- Protected routes use AuthGuard component that wraps the dashboard layout
- API routes check session at the start of every handler
- Never store raw passwords, never log session tokens, never expose user IDs in error messages

---

## File and Folder Naming

- Folders: kebab-case — `dashboard`, `fleet`, `analytics`
- Route groups: `(group-name)` — `(dashboard)`
- Component files: PascalCase — `FleetTable.tsx`, `StatCard.tsx`
- Utility/lib files: camelCase — `utils.ts`, `auth.ts`, `predictions.ts`
- Data files: camelCase — `vehicles.ts`, `alerts.ts`
- Hook files: camelCase — `useVehicles.ts`, `useAuth.ts`
- Type files: camelCase — `index.ts`
- One component per file — never export multiple components from one file

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal imports
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// 3. Type definitions
type Props = {
  vehicles: Vehicle[];
  className?: string;
};

// 4. Component
export function FleetTable({ vehicles, className }: Props) {
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports — always named exports
- Props type defined directly above the component, not in a separate types file
- `className` prop accepted and merged via `cn()` on the root element for composition
- No inline styles — use Tailwind classes or CSS variables

---

## Data Files

```typescript
// data/vehicles.ts — transformed from CSV source

export type Vehicle = {
  vehicle_id: string;
  vehicle_model: string;
  battery_type: BatteryType;
  battery_capacity: number; // kWh
  vehicle_age: number; // years
  total_charging_cycle: number;
  avg_temp_c: number;
  fast_charge_ratio: number; // 0-1
  avg_discharge_rate: number; // C-rate
  driving_style: DrivingStyle;
};

export type BatteryType = "LFP" | "NMC" | "NCA";
export type DrivingStyle = "gentle" | "moderate" | "aggressive";

export const vehicles: Vehicle[] = [
  // ... CSV data transformed to TS
];
```

- All placeholder data lives in `data/*.ts` and is strongly typed
- Components never import from `data/` directly — hooks from `hooks/` mediate the data layer
- This ensures swapping static data for real API calls requires changing only `lib/data.ts` (the async wrapper) and `hooks/*.ts` (the query config) — no component changes

---

## Hook Pattern

```typescript
// hooks/useVehicles.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/lib/data";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleById(id),
    enabled: !!id,
  });
}
```

---

## shadcn/ui Usage

- shadcn/ui components live in `components/ui/` as installed via `npx shadcn@latest add`
- Components are customized via the `cn()` utility and project tokens — never by editing the component source's hardcoded classes
- Add new shadcn/ui components only when needed — `button`, `input`, `card`, `badge`, `table`, `dialog`, `dropdown-menu`, `select`, `skeleton` are the expected initial set

---

## Error Handling

- All data-fetching hooks surface `error` from TanStack Query — components display errors inline with a retry action
- Form validation uses Zod `safeParse()` — never throw raw errors
- No try/catch in components — error boundaries at the page level for unexpected crashes
- Log errors to console in development only — no production logging in MVP
- Never expose raw error objects to users — always map to human-readable messages

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious data transformation, a performance decision, or a deliberate deviation from ui-rules.md
- Never leave TODO comments in committed code — track outstanding work in progress-tracker.md instead

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already provide this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native CSS/JS solution?

**Approved dependencies for this project:**

### Frontend
- `next` — framework
- `react` / `react-dom` — UI library
- `typescript` — language
- `tailwindcss` — styling
- `@tanstack/react-query` — data fetching
- `recharts` — charts
- `lucide-react` — icons
- `clsx` / `tailwind-merge` — class merging (`cn()` utility)
- `zod` — form validation
- `framer-motion` — layout transitions and micro-interactions
- `papaparse` — client-side CSV preview parsing
- shadcn/ui component dependencies (Radix primitives, etc.)
- `@next/font` (built-in) — fonts

### Backend
- `next-auth` (v5) — authentication
- `@prisma/client` — database ORM
- `prisma` (dev) — schema management, migrations
- `bcryptjs` — password hashing
- `papaparse` — server-side CSV parsing (in-memory, no disk write)
- `postgresql` (platform add-on) — database

Do not install any other packages without updating this list first. In particular, do not install a second chart library alongside Recharts, or a CSS framework alongside Tailwind.

---

## Testing

- No automated testing in MVP — visual verification in browser is the testing strategy
- Every state (loading, error, empty, success) must be manually verified for every data-driven component
- Test at minimum these breakpoints: 390px, 768px, 1440px, 1920px
- Test both themes on every page
- API routes tested manually via browser or curl during development
- CSV upload tested with valid data, malformed data, missing columns, oversized files
- Auth flows tested: registration → login → protected route → logout → redirect
- Multi-tenant isolation verified by creating two accounts and confirming no data overlap
