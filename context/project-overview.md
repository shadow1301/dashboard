# Project Overview

## About the Project

An AI-powered Battery Health Analytics Platform that helps fleet operators monitor battery degradation and predict maintenance using vehicle telemetry. The platform ingests charging cycle data, temperature history, discharge patterns, and driving behavior to surface actionable health insights — so fleet operators can replace batteries on schedule, not on failure.

This is a full-stack SaaS application with per-user authentication, CSV-based data ingestion, and a PostgreSQL database backend. The initial build used static placeholder data — now migrating to a real backend with user-owned data.

---

## The Problem It Solves

Fleet operators run hundreds to thousands of EVs. Battery degradation is invisible until range drops or a vehicle fails mid-route. Without analytics, maintenance is reactive — replace on failure or replace on a fixed calendar schedule that wastes still-healthy batteries. Operators need a single pane that ingests telemetry, scores each battery's health, predicts remaining useful life, and flags vehicles needing attention — before they strand a driver.

---

## Datasets

Each vehicle record includes the following telemetry fields:

| Field | Type | Description |
|-------|------|-------------|
| `vehicle_id` | string | Unique vehicle identifier |
| `vehicle_model` | string | Make/model of the vehicle |
| `battery_type` | string | Chemistry/pack type (e.g. LFP, NMC, NCA) |
| `battery_capacity` | number | Nominal capacity in kWh |
| `vehicle_age` | number | Age in years |
| `total_charging_cycle` | number | Cumulative charge cycles |
| `avg_temp_c` | number | Average operating temperature (°C) |
| `fast_charge_ratio` | number (0-1) | Proportion of charges that are fast-charges |
| `avg_discharge_rate` | number | Average discharge rate (C-rate) |
| `driving_style` | enum | `gentle`, `moderate`, `aggressive` |
| `soh_percent` | number | State of Health percentage (from CSV source) |

Data is uploaded by users via CSV files (single or batch). Each user's data is isolated by tenant.

---

## Pages

```
/login                  → Authentication page (email/password, real auth)
/register               → User registration page
/dashboard              → Fleet overview with key metrics, health distribution, recent alerts
/fleet                  → Full searchable/sortable fleet table
/fleet/[vehicleId]      → Single-vehicle deep-dive: degradation curve, cycle history, prediction
/analytics              → Cross-fleet trend analysis, battery type comparison, prediction scenarios
/alerts                 → Maintenance alerts dashboard with severity filtering
/upload                 → CSV upload page (single file, client-side parse, JSON to API)
/upload-history         → Upload history with status and row counts
/settings               → User account settings, API keys, profile
```

---

## Navigation

Sidebar-driven dashboard layout (fleet management standard):

```
[Dashboard]  [Fleet]  [Analytics]  [Alerts]  [Upload]         [Theme toggle]  [User menu (top-right)]
```

- Sidebar is collapsible on desktop, hidden by default on mobile (hamburger toggle)
- Active route is highlighted in the sidebar
- Top header shows current page title + breadcrumb context
- User menu shows user name/role + settings + logout

---

## Core User Flow

### Registration & Login
- User lands on `/login` or `/register`
- Creates account with email + password (hashed, stored in DB)
- Real session-based auth (NextAuth.js / Auth.js v5 with database sessions)
- Redirect to `/dashboard` on success

### Upload Data
- User navigates to `/upload`
- Drag-and-drop zone or click to select CSV file(s)
- Single file upload or batch (multiple files, progress tracked per file)
- Backend parses CSV, validates schema, inserts into user's tenant-isolated tables
- Error report generated for malformed rows
- Upload history tracked: timestamp, filename, row count, error count, status

### Dashboard → Alerts
- Dashboard loads aggregate metrics from user's uploaded data
- 4 metric cards: total vehicles, avg battery health, at-risk count, avg degradation rate
- Health distribution bar chart
- Recent alerts feed (last 5)

### Fleet Overview → Vehicle Detail
- `/fleet` shows user's vehicles in a sortable, filterable, searchable table
- Click any row → `/fleet/[vehicleId]` full detail page
- Detail page: hero card with key stats, degradation trend chart, prediction widget

### Analytics
- Cross-fleet degradation trends by battery type, driving style, temperature correlation
- All scoped to the authenticated user's data

### Alerts
- Auto-generated from vehicles with health < 80
- Severity: critical (<60), warning (60-79), info (80-90)
- Mark as read / dismiss actions (persisted to DB)

---

## Features In Scope

- User registration and authentication (email/password via Auth.js, database sessions)
- Per-user data isolation (multi-tenant)
- CSV file upload (single file via drag-and-drop or file picker)
- Batch CSV upload (multiple files with per-file progress)
- CSV row-level validation with error reporting
- PostgreSQL database with Prisma ORM
- Fleet dashboard with key metric cards and health distribution
- Fleet table with sort, filter, and search (client-side pagination, URL-driven filters)
- Vehicle detail page with degradation chart and prediction
- Health score calculation (formula based on SoH baseline + cycle/temp/fast-charge/driving-style penalties)
- Remaining useful life prediction
- Cross-fleet analytics by battery type, driving style, temperature bands
- Alerts system with severity levels and status management
- Upload history page with status tracking
- Dark/light theme toggle
- Responsive across mobile/tablet/desktop

## Features Out of Scope

- Real ML model training or inference — health score is a deterministic formula
- Real-time telemetry ingestion (no WebSocket/SSE streaming)
- Export/PDF report generation
- Integration with actual vehicle telemetry APIs (CAN bus, OBD-II, etc.)
- Team/collaborator features within a tenant — single user per account
- Billing/subscription management
- OAuth/social login providers
- Admin panel (user management, system monitoring)

---

## Target User

Fleet operations managers and maintenance leads at EV fleet operators — delivery fleets, ride-share operators, municipal EV fleets, logistics companies. They need a quick, accurate answer to: "Which batteries are about to fail, and which are fine?" They upload their telemetry CSVs and get immediate actionable insights.

---

## Success Criteria

- User can register, login, upload a CSV, and see their fleet dashboard immediately
- Each user sees only their own data
- CSV upload validates schema and reports errors per-row
- Batch upload processes multiple files with progress feedback
- Dashboard loads and displays accurate aggregate metrics from uploaded data
- Sort/filter/search on the fleet table works with client-side pagination
- Health score formula produces believable relative rankings
- Upload history shows past uploads with status and row counts
- Theme toggle persists and works across all pages
- Responsive layout works at 390px, 768px, 1440px, 1920px
- Auth routes protected — unauthenticated users redirected to /login
