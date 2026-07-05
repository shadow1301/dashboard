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
      staleTime: 30 * 1000, // 30s — reasonable for real API data
      retry: 1,
      refetchOnWindowFocus: false,
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

### Hook Pattern (Real API)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

type VehiclesResponse = {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Params = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
};

export function useVehicles(params: Params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);

  return useQuery<VehiclesResponse>({
    queryKey: ["vehicles", params],
    queryFn: () =>
      fetch(`/api/vehicles?${searchParams}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch vehicles");
        return r.json();
      }),
    placeholderData: keepPreviousData, // smooth pagination
  });
}
```

**Rules:**

- `staleTime: 30_000` (30s) — short enough for fresh data, long enough to avoid spamming the API on navigation
- `placeholderData: keepPreviousData` for paginated queries — shows previous page while next loads
- Query keys include all params so cache invalidates when filters change
- Always check `!r.ok` and throw — TanStack Query catches and surfaces via `error`
- Mutation hooks (`useMutation`) for POST/PATCH/DELETE — invalidate related queries on success

### Hook Pattern (Mutations)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) =>
      fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update alert");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
```

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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="cycles"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[60, 100]}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#f8fafc",
              color: "#0b1120",
              border: "none",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="health"
            stroke="#3b82f6"
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

**Critical Rule — React 19 Compatibility:**
- Do NOT use CSS variable strings (`var(--xyz)`) for Recharts `fill`, `stroke`, `tick`, `contentStyle`, or `label` style values. React 19 throws "style prop expects a mapping" when it encounters CSS variable values through Recharts' internal rendering.
- Instead, use the `useChartColors()` hook which returns resolved hex values based on the current theme.
- Always wrap Recharts components in a sized container — Recharts requires a bounding box.
- Use `ResponsiveContainer` for all charts.
- `margin` on chart components prevents axis label clipping.
- `domain` on Y-axis set explicitly where meaningful.

### Chart Types Used

| Chart Type | Component | Use Case |
|-----------|-----------|----------|
| Line Chart | `<LineChart>` | Degradation over cycles, trends over time |
| Bar Chart | `<BarChart>` | Health score distribution, comparisons |
| Scatter Chart | `<ScatterChart>` | Temperature vs health correlation |

**Data key naming:** Never use `style` or `type` as data key names — these collide with React reserved props. Use `drivingStyle`, `batteryType` instead.

---

## Prisma

### Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

This pattern prevents multiple Prisma Client instances during Next.js hot-reloads.

### Query Pattern

```typescript
import { prisma } from "@/lib/prisma";

// Paginated list with filters (always scoped to user)
const vehicles = await prisma.vehicle.findMany({
  where: {
    userId: session.user.id,
    ...(search && {
      OR: [
        { vehicleId: { contains: search, mode: "insensitive" } },
        { vehicleModel: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(batteryType && { batteryType }),
    ...(drivingStyle && { drivingStyle }),
  },
  orderBy: sort ? { [sort]: order === "desc" ? "desc" : "asc" } : { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
});

// Transaction for CSV upload (insert vehicles + create upload history + generate alerts)
const result = await prisma.$transaction(async (tx) => {
  const inserted = await tx.vehicle.createMany({ data: validVehicles });
  const history = await tx.uploadHistory.create({ data: uploadRecord });
  const alerts = await tx.alert.createMany({ data: newAlerts });
  return { inserted: inserted.count, history, alerts: alerts.count };
});
```

### Migration Workflow

```bash
# Development — create migration from schema changes
npx prisma migrate dev --name add_vehicle_table

# Production — apply pending migrations
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

---

## Auth.js v5 (NextAuth.js)

### Configuration

```typescript
// lib/auth.ts
import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
```

### Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Protecting API Routes

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## CSV Upload (papaparse)

### Server-Side Parsing

CSV files are processed entirely in-memory — no disk writes, no S3/R2 upload. The file is read as text, parsed, validated, and the raw File object is discarded immediately after processing.

```typescript
import { parse } from "papaparse";
import { z } from "zod";
import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const VehicleRowSchema = z.object({
  vehicle_id: z.string().min(1),
  vehicle_model: z.string().min(1),
  battery_type: z.enum(["LFP", "NMC", "NCA"]),
  battery_capacity: z.coerce.number().positive(),
  vehicle_age: z.coerce.number().int().nonnegative(),
  total_charging_cycle: z.coerce.number().int().nonnegative(),
  avg_temp_c: z.coerce.number(),
  fast_charge_ratio: z.coerce.number().min(0).max(1),
  avg_discharge_rate: z.coerce.number().min(0),
  driving_style: z.enum(["gentle", "moderate", "aggressive"]),
  soh_percent: z.coerce.number().min(0).max(100),
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || !file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "Only .csv files are accepted" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
  }

  const text = await file.text();
  const { data, errors: parseErrors } = parse(text, { header: true, skipEmptyLines: true });

  const validRows: Vehicle[] = [];
  const rowErrors: { row: number; field: string; message: string }[] = [];

  (data as Record<string, string>[]).forEach((row, index) => {
    const result = VehicleRowSchema.safeParse(row);
    if (result.success) {
      validRows.push(result.data);
    } else {
      result.error.issues.forEach((issue) => {
        rowErrors.push({
          row: index + 2, // +2 for header row + 1-indexed
          field: issue.path.join("."),
          message: issue.message,
        });
      });
    }
  });

  // Insert to DB, create upload history, generate alerts...
  // Return { insertedCount, errorCount, errors }
}
```

**Rules:**

- Parse + validate in one pass — never parse once then validate separately
- Coerce numeric fields with `z.coerce.number()` — CSV values are strings
- Track row numbers for error reporting (offset by 2: header + 0-indexed)
- File size limit: 10MB single, 50MB batch
- Delete temp files after processing

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
- Never use Framer Motion for: scroll-triggered animations, complex gesture-based interactions, path morphing
- Keep animations short (0.2-0.4s) — dashboards should feel snappy, not cinematic
- Respect `prefers-reduced-motion` via `useReducedMotion()` or CSS `@media (prefers-reduced-motion: reduce)`

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

### Registration Validation Pattern

```typescript
export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().min(1, "Name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
```

### CSV Row Validation (Server)

See CSV section above — `z.coerce.number()` for numeric CSV fields, `z.enum()` for constrained string fields.

**Rules:**

- Use `safeParse()` in form handlers — never throw
- Error messages are user-facing and descriptive, not technical
- Validation runs on submit only (no real-time validation to keep UI simple)
- Server-side validation for CSV rows uses the same Zod schema pattern — never trust client-parsed data

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
