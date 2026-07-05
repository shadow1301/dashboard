# UI Rules

Concise rules for building the Battery Health Analytics dashboard UI. These cover layout, component, and interaction patterns needed to keep the interface clean, data-dense but readable, and consistent with fleet operations dashboard conventions. Pair this file with `ui-tokens.md` for exact values.

---

## Font

Import fonts via `next/font/google` in the root layout.

```typescript
import { Inter, JetBrains_Mono } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
```

Apply both variable classes to `<html>`. Use `font-sans` for all UI text, `font-mono` for all numeric/data values.

---

## Layout

- Dashboard uses a sidebar + header + content area layout (standard ops dashboard pattern)
- Sidebar: 240px fixed width on desktop, hidden on mobile (hamburger toggle overlay)
- Header: 64px fixed height, sits above content area, spans full width minus sidebar
- Content area: fills remaining space, scrolls independently of sidebar/header
- No max-width constraint on content — charts and tables span available width
- Page horizontal padding: `px-6` (24px) consistent across all dashboard pages
- Section spacing: `gap-8` (32px) between sections within a page

---

## Sidebar

- Three states: expanded (desktop default), collapsed (icons only, optional future), hidden (mobile)
- Background: `bg-surface` with `border-r border-border`
- Active nav item: `bg-primary/10 text-primary` with left border indicator
- Inactive nav item: `text-foreground-muted hover:text-foreground hover:bg-surface-raised`
- Nav items should have icon + label
- Bottom section: theme toggle (if not in header) + logout link
- Collapse/expand is animated (width transition)

---

## Header

- Sticky top, `h-16`, `bg-background` with `border-b border-border`
- Left: page title (breadcrumb context optional)
- Right: theme toggle + user avatar/info dropdown
- No complex scroll-based state changes — header is always visible

---

## Data Tables

- Tables are the primary vehicle for fleet data — they must be fast, sortable, filterable
- Each sortable column header shows an arrow indicator when active
- Click column header to sort asc → desc → none
- Filters appear as a horizontal bar above the table (can be collapsed)
- Table rows are `h-12` minimum for touch targets
- Alternating row colors (`bg-surface` / `bg-background`) for readability in dense tables
- Row hover: `bg-surface-raised`
- Clickable rows have a cursor pointer
- Tables show loading skeleton rows while data is fetching
- Empty tables show a centered muted message with an icon

### Server-Side Pagination (Fleet Table)

- Fleet table uses server-side pagination — API returns `{ data: Vehicle[], total: number, page: number, limit: number, totalPages: number }`
- Pagination controls at the bottom: previous/next buttons, page number display, per-page selector (25/50/100)
- Sort state sent as query param: `sort=healthScore&order=desc`
- Filter state sent as query params: `search=`, `batteryType=`, `drivingStyle=`, `healthMin=`, `healthMax=`
- URL search params synced with filter state for shareable/bookmarkable filtered views
- Loading state: table body replaced with skeleton rows (same layout as data rows)
- Empty page: show message with option to clear filters

### Fleet Table Columns

| Column | Type | Sortable | Filterable |
|--------|------|----------|------------|
| Vehicle ID | text | yes | yes (search) |
| Model | text | yes | yes (dropdown) |
| Battery Type | text | yes | yes (dropdown) |
| Capacity | number | yes | no |
| Age | number | yes | yes (range) |
| Cycles | number | yes | yes (range) |
| Health Score | badge | yes | yes (range) |
| Status | badge | yes | yes (dropdown) |

---

## Health Score Display

- Always displayed as a badge or colored metric, never raw number alone
- Color-coded by threshold:
  - 80–100: `bg-health-good/10 text-health-good border-health-good/30`
  - 60–79: `bg-health-warning/10 text-health-warning border-health-warning/30`
  - 0–59: `bg-health-critical/10 text-health-critical border-health-critical/30`
- Always show the numeric score alongside the color cue (accessibility)
- In tables, a small horizontal bar (mini progress bar) next to the number adds quick scanability

---

## Charts (Recharts)

- All charts are responsive via container width, not fixed pixel dimensions
- Axis labels: `text-foreground-faint`, 12px, `font-sans`
- Grid lines: `stroke-chart-grid`, subtle
- Line/stroke colors use the semantic tokens (primary for main line, semantic colors for breakdowns)
- Chart tooltips have a dark background (`bg-surface-inverse text-foreground-inverse`) regardless of page theme — standard chart convention
- All charts must have accessible `aria-label` or `role="img"` with a descriptive title
- Empty/no-data state: a centered message in the chart area, never a broken SVG
- Loading state: pulsing rectangle skeleton matching chart dimensions

### Specific Chart Patterns

**Health Distribution Bar Chart:**
- X-axis: health score buckets (0-20, 21-40, 41-60, 61-80, 81-100)
- Y-axis: vehicle count
- Bars colored by bucket midpoint: critical (0-20, 21-40) → warning (41-60, 61-80) → good (81-100)

**Degradation Line Chart (vehicle detail):**
- X-axis: charging cycles or vehicle age
- Y-axis: health score (80-100 range zoomed)
- Main line: `stroke-primary` with area fill below
- Threshold lines at 60 and 80 (dashed, semantic colors)
- Tooltip shows exact values at hovered point

**Scatter Plot (temp vs health):**
- X-axis: avg temperature °C
- Y-axis: health score
- Dots colored by battery type
- Optional trend line

---

## Alert Severity

| Severity | Visual treatment |
|----------|------------------|
| Critical | Red left border, red badge, full opacity |
| Warning | Amber left border, amber badge |
| Info | Blue left border, blue badge |

- Alerts are displayed in a table with severity as the first visual cue
- Unread alerts have a small dot indicator
- Click to expand/see details inline
- Bulk actions: mark selected as read, dismiss selected

---

## Metric / Stat Cards

- Used on the dashboard overview to display aggregate numbers
- Format: icon (optional, top-left) → large metric value → label → trend indicator (optional)
- Metric value uses `font-mono` text-3xl or text-4xl
- Trend indicator: green up-arrow or red down-arrow with percentage
- Clicking a card navigates to the relevant section (`/fleet`, `/alerts`, etc.)
- Loading state: skeleton pulse (same dimensions, no content)

---

## Forms

- Login form: centered card layout, email + password fields, submit button
- No floating labels — use standard label above input pattern (more accessible for data entry)
- Validation errors shown inline below the relevant field in `text-error`, 12px
- Submit button shows loading spinner while "authenticating" (simulated delay)
- Submit is disabled while loading to prevent double-submit
- Error summary above the form for server-level errors (wrong credentials, etc.)

---

## File Upload

- Upload page centered layout with card container
- Drag-and-drop zone supports `.csv` files only — show restriction text
- Single file upload: dropzone → file selected → progress → result summary
- Batch upload: dropzone accepts multiple files → queue displayed as list → upload all button → per-file progress → combined result
- File validation on drop:
  - Extension must be `.csv` — reject with error message if not
  - File size ≤ 10MB (single), total ≤ 50MB (batch)
  - Show error inline on the dropped file card
- Upload progress: per-file progress bar with filename, row count (after parse), status indicator
- CSV preview: after parsing (client-side), show first 5 rows in a mini-table before user confirms upload
- Upload result:
  - Success: green banner with inserted count, link to fleet
  - Partial: amber banner with inserted count + error count, expandable error list
  - Failure: red banner with error message
- Drag-over state: dashed border turns primary blue, background tinted — immediate visual feedback

### Upload History

- Table displaying past uploads: filename, date, rows inserted, errors, status
- Click a row to expand error details (if any)
- Status badges match the notification banner colors
- Empty state: "No uploads yet" with a link to the upload page

---

## Navigation & Breadcrumbs

- Breadcrumbs are shown below the header on detail pages (e.g. Fleet > Vehicle ABC-123)
- Breadcrumb format: muted links separated by `/`, last item is current page (not a link)
- Breadcrumbs help the user understand depth and navigate back up

---

## Loading States

Every data-driven component must handle four states:

1. **Loading** — skeleton placeholder matching the component's layout dimensions
2. **Error** — centered error message with a "Retry" button
3. **Empty** — centered muted message explaining nothing was found (with clear action if applicable)
4. **Success** — normal rendered content

Never show a blank section or a spinner alone — always use skeleton placeholders for loading.

---

## Empty States

- Fleet table with no results after filtering: "No vehicles match your filters" with a "Clear filters" button
- Alerts with no items: "No alerts — your fleet is in good shape" (positive framing)
- Charts with no data: "Insufficient data to display this chart" centered in the chart area
- Empty states use `text-foreground-muted` with a subtle icon above the message

---

## Responsiveness

- **Desktop (1440px+):** Full sidebar, 4 stat cards in a row, multi-column chart layouts
- **Tablet (768px):** Sidebar collapses to hamburger overlay, 2 stat cards per row, charts stack vertically
- **Mobile (390px):** Single column layout, stat cards stack, tables show a card-style list instead of columns, filters stacked
- Tables on mobile: switch to a stacked card layout (each row becomes a card with labeled fields) rather than horizontal scroll — fleet ops users need to scan data quickly, horizontal scroll is acceptable for 2-3 overflow columns but not 8+
- Charts on mobile: maintain aspect ratio but reduce axis labels to avoid overlap

---

## Theme Transition

- Background and text colors transition at 0.3s ease
- Theme toggle icon morphs (sun ↔ moon) via Framer Motion
- Theme choice is respected on all pages without flicker (inline init script)
- Charts re-render with new theme colors — Recharts responsive containers + CSS variable approach means the chart line/grid colors update automatically

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-blue-500`, `text-gray-400`) — use project tokens only
- Never define colors in `tailwind.config.ts` — use `@theme inline` in globals.css
- Never use Tailwind's `dark:` variant — all theme response comes from token remapping
- Never ship a new color or component that was only checked in one theme — verify both
- Never show raw, unstyled browser form validation messages
- Never leave chart `markers: true` or development-only debugging in committed code
- Never animate `width`/`height`/`top`/`left` for layout motion — use `transform` for performance
- Never stack more than 3 charts loading simultaneously — lazy load below-fold charts
- Never hide severity labels behind color alone — always include text (Critical, Warning, Info) for accessibility
