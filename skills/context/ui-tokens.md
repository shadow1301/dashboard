# UI Tokens

Design tokens for the portfolio site. Visual direction is royal + design sci-fi — deep amethyst accents, champagne gold highlights, space-black and warm parchment backgrounds. Confident type, high contrast, restrained color, motion does the rest of the talking. The site supports both a dark theme (default) and a light theme, sharing the same structure and accent so neither feels like an afterthought. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. Tokens are defined as CSS custom properties on `:root` (dark, default) and overridden under a `[data-theme="light"]` selector, then exposed to Tailwind via `@theme inline` referencing those custom properties. This lets every token swap automatically based on the active theme without touching component code.

```tsx
// Correct — theme-aware, works in both modes automatically
className="bg-background text-foreground"

// Never
className="bg-[#050508]"
className="text-[#f0ece4]"
// Never use Tailwind's dark: variant — see Theme Switching below
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

:root {
  /* Dark theme — Royal Sci-fi Dark (default) */
  --bg: #050508;
  --surface: #0c0c14;
  --surface-raised: #141420;
  --surface-inverse: #f5f0eb;

  --fg: #f0ece4;
  --fg-muted: #9690a8;
  --fg-faint: #5f5a72;
  --fg-inverse: #050508;

  --border: #1c1a2e;
  --border-strong: #2e2a44;

  --accent: #a78bfa;
  --accent-fg: #ffffff;
  --accent-muted: #1e1b4b;

  --accent-gold: #d4a853;
  --accent-gold-fg: #050508;

  --overlay: rgba(5, 5, 8, 0.88);

  --success: #4ade80;
  --error: #f87171;
}

[data-theme="light"] {
  --bg: #f0f4f8;
  --surface: #ffffff;
  --surface-raised: #e8edf4;
  --surface-inverse: #050508;

  --fg: #1a1423;
  --fg-muted: #5c5568;
  --fg-faint: #8a8396;
  --fg-inverse: #f0f4f8;

  --border: #d8dfe8;
  --border-strong: #c0cbd8;

  --accent: #3b82f6;
  --accent-fg: #ffffff;
  --accent-muted: #dbeafe;

  --accent-gold: #b8860b;
  --accent-gold-fg: #ffffff;

  --overlay: rgba(240, 244, 248, 0.92);

  --success: #16a34a;
  --error: #dc2626;
}

@theme inline {
  --font-sans: var(--font-space-grotesk);
  --font-display: var(--font-fraunces);

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

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-fg);
  --color-accent-muted: var(--accent-muted);

  --color-accent-gold: var(--accent-gold);
  --color-accent-gold-foreground: var(--accent-gold-fg);

  --color-overlay: var(--overlay);

  --color-success: var(--success);
  --color-error: var(--error);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

body {
  background: var(--bg);
  color: var(--fg);
  transition: background-color 0.4s ease, color 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

---

## Theme Switching

- Theme is controlled via a `data-theme="dark" | "light"` attribute on `<html>`, set before hydration (inline script in `app/layout.tsx`) to avoid a flash of the wrong theme
- Default: respects `prefers-color-scheme` on first visit; user's explicit choice (once made via the toggle) is persisted to `localStorage` and takes precedence over system preference on return visits
- Never use Tailwind's built-in `dark:` variant classes scattered through components — all theme response happens automatically through the CSS variable remapping above; components never need theme-conditional class names
- The one exception: any component that reads a color value directly into JS (e.g. for a canvas/SVG gradient driven by GSAP, or a custom cursor `mix-blend-mode` decision) reads the resolved CSS variable at runtime via `getComputedStyle`, never a hardcoded hex tied to one theme

---

## Color Usage Guide

### Page Layout

| Element | Token |
|---------|-------|
| Page background | `bg-background` |
| Raised panel/card | `bg-surface-raised` |
| Inverse section | `bg-surface-inverse` / `text-foreground-inverse` |
| Default border | `border-border` |
| Strong border | `border-border-strong` |

### Typography

| Element | Token |
|---------|-------|
| Primary text / headlines | `text-foreground` |
| Secondary / supporting text | `text-foreground-muted` |
| Faint / meta / timestamps | `text-foreground-faint` |
| Text on accent background | `text-accent-foreground` |

### Accent

Used for: primary CTA buttons, active nav state, hover underline on links, marquee highlight word, small decorative marks.

| Element | Token |
|---------|-------|
| Primary button background | `bg-accent` |
| Primary button text | `text-accent-foreground` |
| Subtle accent background | `bg-accent-muted` |
| Link hover / active state | `text-accent` |
| Gold decorative elements | `text-accent-gold` / `border-accent-gold` |

---

## Typography

Bold, oversized display type is the signature of this style — headlines should feel disproportionately large relative to typical web type scales.

| Element | Size (desktop) | Size (mobile) | Weight | Font | Color token |
|---------|---------------|---------------|--------|------|-------------|
| Hero headline | clamp(56px, 9vw, 140px) | clamp(36px, 12vw, 64px) | 600 | `font-display` | `text-foreground` |
| Section heading | clamp(32px, 4vw, 56px) | clamp(28px, 8vw, 40px) | 600 | `font-sans` | `text-foreground` |
| Subheading / lede | 20px | 16px | 400 | `font-sans` | `text-foreground-muted` |
| Body text | 16px | 15px | 400 | `font-sans` | `text-foreground-muted` |
| Nav links | 14px | 14px | 500 | `font-sans` | `text-foreground` (`text-accent` active) |
| Meta / eyebrow labels | 12px, uppercase, letter-spacing 0.1em | same | 500 | `font-sans` | `text-foreground-faint` |
| Marquee text | clamp(40px, 6vw, 80px) | same scaled | 600 | `font-sans` | `text-foreground` / `text-accent` / `text-accent-gold` |
| Footer text | 14px | 13px | 400 | `font-sans` | `text-foreground-muted` |

Line height for display/headline sizes: `0.95–1.05` (tight, editorial). Line height for body text: `1.5–1.6`.

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight inline gaps |
| `gap-2` | 8px | Tag/badge gaps |
| `gap-4` | 16px | Form field gaps |
| `gap-6` | 24px | Internal section gaps |
| `gap-12` | 48px | Between sub-sections |
| `gap-24` | 96px | Between full page sections |
| Page horizontal padding | `clamp(24px, 5vw, 96px)` | All pages, applied per-section |
| Section vertical padding | `clamp(64px, 10vw, 160px)` | Every full-width section |

---

## Component Tokens

### Buttons

**Primary:**
- background: `bg-accent`
- color: `text-accent-foreground`
- border-radius: `rounded-full`
- padding: `px-8 py-4`
- font-weight: `font-medium`
- hover: scale + magnetic cursor pull (see ui-rules.md), no color change needed

**Secondary (outline):**
- background: `transparent`
- border: `1px solid var(--border-strong)`
- color: `text-foreground`
- border-radius: `rounded-full`
- padding: `px-8 py-4`
- hover: border-color → accent

**Text link (nav, inline):**
- color: `text-foreground`
- underline: none by default
- hover: `text-accent`

### Cards / Project Tiles

- background: `bg-surface-raised`
- border: `1px solid var(--border)`
- border-radius: `rounded-lg`
- overflow: hidden (required for image scale/reveal animations)
- no box-shadow by default — depth implied by surface contrast, not shadow

### Form Inputs

- background: transparent
- border: none, bottom border `1px solid var(--border-strong)`
- padding: `py-3`
- color: `text-foreground`
- placeholder: `text-foreground-faint`
- focus: `border-bottom-color → accent`, no ring

### Marquee

- background: `bg-surface`
- text: large grotesk, alternating foreground/accent/accent-gold
- speed: GSAP-driven, base ~40-60px/s

### Glass-morphism Panels (Menu Overlay, etc.)

- background: `bg-surface-inverse/90`
- backdrop-filter: `backdrop-blur-xl`
- Used selectively for special panels, not globally

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Never use raw Tailwind color classes like `bg-black`, `text-white`, `bg-gray-900` — use project tokens only
- Never use Tailwind's `dark:` variant — theme switching happens via the `data-theme` attribute and CSS variable remapping only
- `--color-accent` is the primary accent (amethyst/purple), `--color-accent-gold` is the secondary accent — never introduce a third accent without updating this file
- Headlines always use the display type scale — never default browser heading sizes
- All borders default to `--border` or `--border-strong`
- Section vertical padding always uses the `clamp()` scale
- Every new token must be defined in both `:root` and `[data-theme="light"]`
- Contrast must be verified in both themes for any new color pairing
