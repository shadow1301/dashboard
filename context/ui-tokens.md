# UI Tokens

Design tokens for the Battery Health Analytics Platform. Visual direction is clean, professional, data-focused — a fleet operations dashboard that inspires confidence. Dark navy/slate default theme (industry standard for ops dashboards) with a light theme option. Electric blue primary accent, semantic health colors (green → amber → red), and a monospace data font for numerical displays.

Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

Tokens are defined as CSS custom properties on `:root` (dark, default) and overridden under a `[data-theme="light"]` selector, then exposed to Tailwind via `@theme inline`. This lets every token swap automatically based on the active theme without touching component code.

```tsx
// Correct — theme-aware
className="bg-background text-foreground"

// Never
className="bg-[#0f172a]"
className="text-[#94a3b8]"
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

:root {
  /* Dark theme — Fleet Ops Dark (default) */
  --bg: #0b1120;
  --surface: #111827;
  --surface-raised: #1e293b;
  --surface-inverse: #f8fafc;

  --fg: #f1f5f9;
  --fg-muted: #94a3b8;
  --fg-faint: #64748b;
  --fg-inverse: #0b1120;

  --border: #1e293b;
  --border-strong: #334155;

  --primary: #3b82f6;
  --primary-fg: #ffffff;
  --primary-muted: #1e3a5f;

  --health-good: #22c55e;
  --health-warning: #f59e0b;
  --health-critical: #ef4444;

  --overlay: rgba(11, 17, 32, 0.88);

  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  --chart-grid: #1e293b;
  --chart-line: #3b82f6;
}

[data-theme="light"] {
  --bg: #f1f5f9;
  --surface: #ffffff;
  --surface-raised: #e2e8f0;
  --surface-inverse: #0b1120;

  --fg: #0f172a;
  --fg-muted: #475569;
  --fg-faint: #94a3b8;
  --fg-inverse: #f1f5f9;

  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  --primary: #2563eb;
  --primary-fg: #ffffff;
  --primary-muted: #dbeafe;

  --health-good: #16a34a;
  --health-warning: #d97706;
  --health-critical: #dc2626;

  --overlay: rgba(241, 245, 249, 0.92);

  --success: #16a34a;
  --warning: #d97706;
  --error: #dc2626;
  --info: #2563eb;

  --chart-grid: #e2e8f0;
  --chart-line: #2563eb;
}

@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);

  --color-background: var(--bg);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-inverse: var(--surface-inverse);

  --color-foreground: var(--fg);
  --color-foreground-muted: var(--fg-muted);
  --color-foreground-faint: var(--fg-faint);
  --color-foreground-inverse: var(--fg-inverse);

  --color-border: var(--border);
  --color-border-strong: var(--border-strong);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-fg);
  --color-primary-muted: var(--primary-muted);

  --color-health-good: var(--health-good);
  --color-health-warning: var(--health-warning);
  --color-health-critical: var(--health-critical);

  --color-overlay: var(--overlay);

  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  --color-info: var(--info);

  --color-chart-grid: var(--chart-grid);
  --color-chart-line: var(--chart-line);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

body {
  background: var(--bg);
  color: var(--fg);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

---

## Theme Switching

- Theme is controlled via `data-theme="dark" | "light"` on `<html>`, set before hydration via inline script in `app/layout.tsx`
- Default: respects `prefers-color-scheme` on first visit; user's explicit choice persists to `localStorage` and takes precedence on return visits
- Never use Tailwind's `dark:` variant — all theme response happens through CSS variable remapping
- Color transition: 0.3s ease on `background-color` and `color` — layout is unaffected, no ScrollTrigger recalculation needed

---

## Color Usage Guide

### Page Layout

| Element | Token |
|---------|-------|
| Page background | `bg-background` |
| Card/panel | `bg-surface` |
| Raised panel (hovered card, dropdown) | `bg-surface-raised` |
| Inverse section (sidebar selected) | `bg-surface-inverse` / `text-foreground-inverse` |
| Default border | `border-border` |
| Strong border | `border-border-strong` |

### Typography

| Element | Token |
|---------|-------|
| Primary text / headings | `text-foreground` |
| Secondary text | `text-foreground-muted` |
| Faint / meta / timestamps | `text-foreground-faint` |
| Text on primary background | `text-primary-foreground` |

### Semantic Health Colors

| Status | Token | Usage |
|--------|-------|-------|
| Good (80-100) | `text-health-good` / `bg-health-good/10` | Health score badge, chart fill |
| Warning (60-79) | `text-health-warning` / `bg-health-warning/10` | Alert severity, trend indicators |
| Critical (<60) | `text-health-critical` / `bg-health-critical/10` | At-risk vehicles, urgent alerts |

### Accent / Primary

| Element | Token |
|---------|-------|
| Primary button background | `bg-primary` |
| Primary button text | `text-primary-foreground` |
| Subtle primary background | `bg-primary-muted` |
| Link / interactive hover | `text-primary` |
| Active nav item | `bg-primary/10 text-primary` |
| Chart primary line | `stroke-chart-line` |

### Alert Severity

| Severity | Token |
|----------|-------|
| Critical | `text-error` / `bg-error/10 border-error/30` |
| Warning | `text-warning` / `bg-warning/10 border-warning/30` |
| Info | `text-info` / `bg-info/10 border-info/30` |

---

## Typography

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Page title (h1) | 28px / 24px mobile | 700 | `font-sans` | `text-foreground` |
| Section heading (h2) | 20px / 18px mobile | 600 | `font-sans` | `text-foreground` |
| Card title (h3) | 16px | 600 | `font-sans` | `text-foreground` |
| Metric value | 32px | 700 | `font-mono` | `text-foreground` |
| Metric label | 13px | 500 | `font-sans` | `text-foreground-muted` |
| Body / table text | 14px | 400 | `font-sans` | `text-foreground` |
| Data cell (table) | 14px | 400 | `font-mono` | `text-foreground` |
| Small / meta | 12px | 400 | `font-sans` | `text-foreground-faint` |
| Badge text | 12px | 600 | `font-sans` | — |
| Sidebar nav | 14px | 500 | `font-sans` | `text-foreground-muted` |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Inline icon/text gaps |
| `gap-2` | 8px | Badge gaps, tight UI |
| `gap-3` | 12px | Card internal padding |
| `gap-4` | 16px | Section internal gaps |
| `gap-6` | 24px | Card spacing in grids |
| `gap-8` | 32px | Between page sections |
| Page padding | `px-6` (24px) | Dashboard pages |
| Card padding | `p-6` | Default card padding |
| Sidebar width | 240px desktop, full overlay mobile | Navigation |
| Header height | 64px | Top bar |

---

## Component Tokens

### Cards (StatCard, VehicleCard)

- background: `bg-surface`
- border: `border border-border`
- border-radius: `rounded-lg`
- padding: `p-6`

### Primary Button

- background: `bg-primary`
- color: `text-primary-foreground`
- border-radius: `rounded-md`
- padding: `px-4 py-2`
- font-weight: `font-medium`
- hover: `opacity-90` (subtle dim)
- size variants: `sm` (h-8), `default` (h-10), `lg` (h-12)

### Secondary / Outline Button

- background: `transparent`
- border: `border border-border-strong`
- color: `text-foreground`
- hover: `bg-surface-raised`

### Table

- header background: `bg-surface`
- row background: `transparent` (alternating: `bg-surface`/`bg-background`)
- row hover: `bg-surface-raised`
- border: `border-b border-border`
- padding: `px-4 py-3`

### Form Inputs

- background: `bg-surface`
- border: `border border-border-strong`
- focus: `ring-1 ring-primary border-primary`
- placeholder: `text-foreground-faint`
- padding: `px-3 py-2`

### Badge

- padding: `px-2 py-0.5`
- border-radius: `rounded-full`
- font-size: 12px, 600 weight

### Alerts Table

- Critical row: `bg-error/5 border-l-2 border-l-error`
- Warning row: `bg-warning/5 border-l-2 border-l-warning`
- Info row: `bg-info/5 border-l-2 border-l-info`

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Never use raw Tailwind color classes — use project tokens only
- Never use Tailwind's `dark:` variant — theme switching happens via `data-theme` and CSS variable remapping
- `--color-primary` is the primary accent (blue) — never introduce a second primary accent without updating this file
- Semantic health colors (`health-good`, `health-warning`, `health-critical`) are for battery health — alert severity colors use `success`/`warning`/`error`/`info` naming
- All numeric values in data displays use `font-mono` for alignment and readability
- Every new token must be defined in both `:root` and `[data-theme="light"]`
- Contrast must be verified in both themes for any new color pairing
