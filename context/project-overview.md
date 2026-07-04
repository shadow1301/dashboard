# Project Overview

## About the Project

An AI-powered Battery Health Analytics Platform that demonstrates how fleets can monitor battery degradation and predict maintenance using vehicle telemetry. The platform ingests charging cycle data, temperature history, discharge patterns, and driving behavior to surface actionable health insights — so fleet operators can replace batteries on schedule, not on failure.

This is an MVP/mockup SaaS built to validate the product concept and UX before committing to a production backend. All data is placeholder but structurally identical to real telemetry feeds. The architecture is designed so that static data files can be swapped for API-backed data without touching a single component.

---

## The Problem It Solves

Fleet operators run hundreds to thousands of EVs. Battery degradation is invisible until range drops or a vehicle fails mid-route. Without analytics, maintenance is reactive — replace on failure or replace on a fixed calendar schedule that wastes still-healthy batteries. Operators need a single pane that ingests telemetry, scores each battery's health, predicts remaining useful life, and flags vehicles needing attention — before they strand a driver.

---

## Datasets

The platform is built around vehicle telemetry with the following fields:

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

---

## Pages

```
/login                  → Authentication page (mock)
/dashboard              → Fleet overview with key metrics, health distribution, recent alerts
/fleet                  → Full searchable/sortable fleet table
/fleet/[vehicleId]      → Single-vehicle deep-dive: degradation curve, cycle history, prediction
/analytics              → Cross-fleet trend analysis, battery type comparison, prediction scenarios
/alerts                 → Maintenance alerts dashboard with severity filtering
```

---

## Navigation

Sidebar-driven dashboard layout (fleet management standard):

```
[Dashboard]  [Fleet]  [Analytics]  [Alerts]       [Theme toggle]  [User menu (top-right)]
```

- Sidebar is collapsible on desktop, hidden by default on mobile (hamburger toggle)
- Active route is highlighted in the sidebar
- Top header shows current page title + breadcrumb context
- User menu shows mock user name/role + logout

---

## Core User Flow

### Login → Dashboard
- User lands on `/login`, enters mock credentials (any email/password works in MVP)
- Session stored in localStorage, redirect to `/dashboard`
- Dashboard loads: 4 metric cards (total vehicles, avg battery health, at-risk count, avg degradation rate)
- Below: battery health distribution bar chart
- Below: recent alerts feed (last 5)
- Below: fleet health breakdown by battery type

### Fleet Overview → Vehicle Detail
- `/fleet` shows all vehicles in a table: vehicle_id, model, battery type, age, health score, alerts
- Sortable by any column, filterable by battery type / driving style / health range
- Click any row → `/fleet/[vehicleId]` full detail page
- Detail page: hero card with key stats, degradation trend chart (SoH over cycles), charging profile breakdown, temperature history mini-chart, prediction widget (remaining cycles estimate)
- "Flag for maintenance" button → creates a mock alert

### Analytics
- Cross-fleet degradation trends by battery type (LFP vs NMC vs NCA)
- Degradation by driving style
- Fast-charge impact on health
- Temperature correlation scatter plot
- Predictive "what-if" scenarios

### Alerts
- Sortable/filterable alert list
- Severity: critical (immediate), warning (soon), info (monitor)
- Each alert: vehicle link, alert type, severity, timestamp, status
- Mark as read / dismiss actions

---

## Features In Scope

- Mock authentication with localStorage session
- Fleet dashboard with key metric cards and health distribution
- Full fleet table with sort, filter, and search
- Vehicle detail page with degradation chart, cycle history, prediction
- Health score calculation (simulated AI — weighted formula based on cycles, temperature, fast-charge ratio, discharge rate, driving style)
- Remaining useful life prediction (linear regression or simple decay model)
- Cross-fleet analytics: comparisons by battery type, driving style, temperature bands
- Alerts system with severity levels and status management
- Light/dark theme toggle
- Responsive across mobile/tablet/desktop
- All data driven from static TypeScript files, structured for easy API replacement

## Features Out of Scope

- Real backend API or database
- Real ML model training or inference — health score is a deterministic formula in MVP
- Real CSV file upload (data is pre-loaded from static files)
- Multi-tenant auth or user management
- Real-time telemetry ingestion
- Export/PDF report generation
- Integration with actual vehicle telemetry APIs (CAN bus, OBD-II, etc.)

---

## Target User

Fleet operations managers and maintenance leads at EV fleet operators — delivery fleets, ride-share operators, municipal EV fleets, logistics companies. They need a quick, accurate answer to: "Which batteries are about to fail, and which are fine?"

---

## Success Criteria

- Fleet dashboard loads and displays accurate aggregate metrics from the static data
- Sort/filter/search on the fleet table works without page reload
- Vehicle detail page shows a degradation chart that reflects the vehicle's actual cycle/temp data
- Health score formula produces believable relative rankings (high-cycle/high-temp vehicles score lower)
- Predictions feel grounded in the data, not random
- Theme toggle persists and works across all pages
- Responsive layout works at 390px, 768px, 1440px, 1920px
- All data is driven from `data/*.ts` — swapping the source for an API call requires zero component changes
