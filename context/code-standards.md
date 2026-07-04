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
- Data fetching is simulated through TanStack Query hooks that wrap async functions with artificial delays — never fetch real APIs in MVP
- Route handlers (`app/api/`) are empty in MVP — added only when a real backend is introduced
- Dynamic routes (`/fleet/[vehicleId]`) use `generateStaticParams` where feasible so all pages are pre-rendered at build time

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
- shadcn/ui component dependencies (Radix primitives, etc.)
- `@next/font` (built-in) — fonts

Do not install any other packages without updating this list first. In particular, do not install a second chart library alongside Recharts, or a CSS framework alongside Tailwind.

---

## Testing

- No automated testing in MVP — visual verification in browser is the testing strategy
- Every state (loading, error, empty, success) must be manually verified for every data-driven component
- Test at minimum these breakpoints: 390px, 768px, 1440px, 1920px
- Test both themes on every page
