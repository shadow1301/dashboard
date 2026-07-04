# Library Docs

Project-specific usage patterns for every third-party library. Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** at the project root for any installed skills.
2. **Check this file** for project-specific patterns that override general library knowledge.
3. The order of authority is: `Skills → This file → General training knowledge`

---

## TanStack React Query

### Setup

```typescript
// lib/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Hook Pattern

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/lib/data";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 5 * 60 * 1000,
  });
}
```

**Rules:**

- `staleTime` of at least 5 minutes prevents excessive re-fetches in MVP — data is static anyway
- `retry: 1` gives a single retry on failure before showing the error state
- Never use `cacheTime` — TanStack Query v5 renamed this to `gcTime`, and with static data it's unnecessary
- Query keys are always arrays with string identifiers — use `["resource"]` for lists, `["resource", id]` for single items
- `enabled: !!id` pattern for queries that depend on a parameter that may not be available yet

---

## Recharts

### Responsive Container Pattern

```typescript
"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function DegradationChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="cycles"
            stroke="var(--fg-faint)"
            tick={{ fill: "var(--fg-faint)", fontSize: 12 }}
          />
          <YAxis
            domain={[60, 100]}
            stroke="var(--fg-faint)"
            tick={{ fill: "var(--fg-faint)", fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-inverse)",
              color: "var(--fg-inverse)",
              border: "none",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="health"
            stroke="var(--chart-line)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Rules:**

- Always wrap Recharts components in a sized container (parent div with explicit or percentage height) — Recharts requires a bounding box
- Use `ResponsiveContainer` for all charts — never use `width={500}` or other absolute values
- Use CSS variables for colors (`var(--chart-grid)`, `var(--chart-line)`, etc.) so chart colors update automatically with theme changes
- Tooltip uses `surface-inverse` background regardless of theme (standard chart convention — tooltip stands out from the chart)
- `margin` on chart components prevents axis label clipping
- `domain` on Y-axis is set explicitly where the meaningful range is known (e.g. health scores 60-100)
- All charts must have an `aria-label` or be wrapped in a visually hidden caption for accessibility

### Chart Types Used

| Chart Type | Component | Use Case |
|-----------|-----------|----------|
| Line Chart | `<LineChart>` | Degradation over cycles, trends over time |
| Bar Chart | `<BarChart>` | Health score distribution, comparisons |
| Scatter Chart | `<ScatterChart>` | Temperature vs health correlation |
| Pie Chart | `<PieChart>` | Battery type distribution (rare, prefer bar) |

---

## Framer Motion

Used sparingly for layout transitions and micro-interactions — not for heavy scroll-driven animation (this is a data dashboard, not a portfolio).

### Transition Pattern

```typescript
"use client";

import { motion } from "framer-motion";

export function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Rules:**

- Use Framer Motion only for: card entrance animations, page transition fades, sidebar collapse/expand, theme toggle icon morph
- Never use Framer Motion for: scroll-triggered animations (not needed in a dashboard), complex gesture-based interactions, path morphing
- Keep animations short (0.2-0.4s) — dashboards should feel snappy, not cinematic
- Respect `prefers-reduced-motion` — motion components respect this via `useReducedMotion()` or CSS `@media (prefers-reduced-motion: reduce)`

---

## shadcn/ui

### Installation

```bash
npx shadcn@latest add button card input badge table skeleton select dialog dropdown-menu
```

All shadcn/ui components live in `components/ui/`. They are customized via:

1. The `cn()` utility for conditional classes
2. The Tailwind design tokens defined in globals.css (colors, radii, etc.)

Components are never modified directly in `components/ui/` for project-specific styling — instead, compose them in your project components.

### Usage Pattern

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HealthScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive";

  return (
    <Badge variant={variant} className="font-mono">
      {score}%
    </Badge>
  );
}
```

**Rules:**

- shadcn/ui `variant` prop is used for semantic variants (`default`, `secondary`, `destructive`, `outline`)
- Custom colors are applied via Tailwind project tokens, never by editing the shadcn component source
- `className` is always passed through to the shadcn component's root element for composition

---

## Zod

### Login Validation Pattern

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;
```

**Rules:**

- Use `safeParse()` in form handlers — never throw
- Error messages are user-facing and descriptive, not technical
- Validation runs on submit only (no real-time validation in MVP to keep it simple)
- Zod is only used for the login form in MVP — no other schemas needed unless data filtering requires validation

---

## cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Rules:**

- Always use `cn()` for any component accepting a `className` prop or combining conditional classes
- Never use manual string concatenation or template literals for class merging
- shadcn/ui components already import `cn()` from `@/lib/utils` — keep this file as the single source
