# Architecture

## Stack

| Layer            | Tool                          | Purpose                                              |
| ----------------- | ------------------------------ | ----------------------------------------------------- |
| Framework         | Next.js 16 (App Router)        | Full stack framework                                   |
| Animation         | GSAP 3 (latest)                 | All animation — timelines, ScrollTrigger, SplitText    |
| Smooth scroll     | Lenis                           | Inertia scroll, synced with ScrollTrigger              |
| Styling           | Tailwind CSS v4                 | Utility styling, tokens via `@theme`                    |
| Language          | TypeScript strict                | Throughout                                              |
| Media             | next/image, next/video (native) | Optimized image/video delivery                          |
| Fonts             | next/font/google or local fonts | Typography                                              |
| Icons             | lucide-react                    | Icons where needed                                       |
| Deployment target | Vercel                          | Hosting                                                  |

GSAP plugins used: `ScrollTrigger`, `ScrollSmoother` (or Lenis as the smoother — pick one, see Invariants), `SplitText` (Club GreenSock plugin — note license requirement, see Invariants), `Flip` (only if needed for layout-shift animations).

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout, fonts, Lenis + GSAP providers
│   ├── page.tsx                            → Homepage
│   ├── template.tsx                        → Page transition wrapper (runs on every route change)
│   ├── work/
│   │   ├── page.tsx                        → Work index
│   │   └── [slug]/
│   │       └── page.tsx                    → Case study page
│   ├── about/
│   │   └── page.tsx                        → About page
│   └── contact/
│       └── page.tsx                        → Contact page
├── components/
│   ├── ui/                                 → Generic primitives (Button, Tag, Input, Textarea)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MenuOverlay.tsx                 → Full-screen nav menu
│   │   ├── Footer.tsx
│   │   ├── Preloader.tsx
│   │   ├── PageTransition.tsx              → Wraps app/template.tsx animation logic
│   │   ├── SmoothScrollProvider.tsx        → Initializes Lenis once at app root
│   │   ├── ThemeProvider.tsx               → Reads/writes data-theme, exposes toggle via context
│   │   └── ThemeToggle.tsx                 → Navbar icon button, animates icon + triggers theme switch
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Marquee.tsx
│   │   ├── FeaturedWork.tsx
│   │   ├── AboutTeaser.tsx
│   │   ├── Capabilities.tsx
│   │   └── ContactCta.tsx
│   ├── work/
│   │   ├── WorkList.tsx
│   │   ├── WorkRow.tsx
│   │   └── NextProject.tsx
│   ├── case-study/
│   │   ├── CaseStudyHero.tsx
│   │   ├── CaseStudyOverview.tsx
│   │   └── CaseStudyGallery.tsx
│   ├── about/
│   │   ├── Intro.tsx
│   │   ├── Timeline.tsx
│   │   └── ToolsGrid.tsx
│   ├── contact/
│   │   ├── ContactForm.tsx
│   │   └── ContactDetails.tsx
│   └── motion/
│       ├── SplitTextReveal.tsx             → Reusable text reveal wrapper
│       ├── ScrollReveal.tsx                → Reusable scroll-triggered fade/slide wrapper
│       ├── MagneticButton.tsx              → Cursor-magnetic button wrapper
│       └── Cursor.tsx                      → Custom cursor (optional, desktop only)
├── lib/
│   ├── gsap.ts                             → GSAP instance, plugin registration (client-only)
│   ├── lenis.ts                            → Lenis instance setup + ScrollTrigger sync
│   ├── theme.ts                            → Theme read/write helpers (localStorage + data-theme attribute)
│   └── utils.ts                            → Shared utility functions (cn, etc.)
├── data/
│   ├── projects.ts                         → Project/case-study placeholder data
│   ├── about.ts                            → Bio, timeline, tools placeholder data
│   └── site.ts                             → Site-wide constants (name, role, socials, nav links)
└── types/
    └── index.ts                            → Shared TypeScript types (Project, TimelineEntry, etc.)
```

---

## System Boundaries

| Folder         | Owns                                                                                   |
| --------------- | --------------------------------------------------------------------------------------- |
| `app/`          | Routes and route-level composition only. No animation logic written inline here.        |
| `components/`   | UI and section composition. Animation triggered via `lib/gsap.ts` and `components/motion/` wrappers, never ad-hoc GSAP calls scattered without structure. |
| `components/motion/` | The only place raw GSAP timelines/ScrollTrigger instances are authored directly. Every other component composes these wrappers. |
| `lib/`          | Third-party client setup only — GSAP registration, Lenis instance, utilities.            |
| `data/`         | All placeholder content. Components never hardcode copy inline — always import from `data/`. |
| `types/`        | Shared TypeScript types.                                                                  |

---

## Data Flow

### Content

```
data/*.ts (placeholder content)
        ↓
Server Component reads data at build/request time
        ↓
Passed as props to presentational components
        ↓
Client Components (motion/) animate the rendered DOM
```

No database, no API routes in this phase. All content is static TypeScript data, structured so it can later be swapped for a CMS or markdown source without changing component props.

### Animation

```
Page/section mounts (Client Component)
        ↓
useGSAP / useEffect registers a GSAP context scoped to a ref
        ↓
ScrollTrigger instances created within that context
        ↓
Lenis drives scroll position → ScrollTrigger reads it via lenis 'scroll' event sync
        ↓
On unmount — gsap.context().revert() cleans up all tweens/triggers
```

### Page Transitions

```
User clicks internal link
        ↓
app/template.tsx detects route change (via usePathname key change)
        ↓
Exit timeline plays on current content
        ↓
Next.js swaps route content
        ↓
Enter timeline plays on new content
        ↓
ScrollTrigger.refresh() called after transition completes
```

---

## Component Patterns

### Client vs Server

- Pages and layout composition default to Server Components
- Any component that touches GSAP, Lenis, refs, or browser APIs is a Client Component (`"use client"`)
- Data fetching (reading from `data/*.ts`) happens in Server Components and is passed down as props — animation wrappers receive plain data/JSX, never re-import data files themselves

### GSAP Registration Pattern

```typescript
// lib/gsap.ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

### Lenis + ScrollTrigger Sync Pattern

```typescript
// lib/lenis.ts
"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

export function initLenis(): Lenis {
  const lenis = new Lenis({
    autoRaf: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
```

Lenis is initialized once in the root layout (inside a Client Component wrapper) and provided via a minimal context or module-level singleton — never re-initialized per page.

### Scoped GSAP Context Pattern (every animated component)

```typescript
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function ExampleSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".reveal-item", {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: containerRef },
  );

  return <div ref={containerRef}>...</div>;
}
```

`@gsap/react`'s `useGSAP` hook is the standard pattern — it auto-cleans on unmount via `gsap.context()`. Never write raw `useEffect` + manual `gsap.context().revert()` when `useGSAP` covers it.

### Theme Initialization Pattern (no flash of wrong theme)

Theme must be resolved before first paint — this requires an inline, blocking script in the document head, not a React effect (effects run after hydration, causing a visible flash).

```typescript
// app/layout.tsx — inline script, runs before any rendering
const themeInitScript = `
  (function() {
    const stored = localStorage.getItem('theme');
    const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// lib/theme.ts
export type Theme = "dark" | "light";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("theme") as Theme | null;
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
```

`ThemeProvider.tsx` (Client Component) reads the already-applied `data-theme` attribute on mount to sync React state, then exposes `theme` and `toggleTheme()` via context for `ThemeToggle.tsx` and any component that needs to read the active theme in JS (e.g. for a canvas-based hero background).

---



Rules the AI agent must never violate:

- All raw GSAP timeline/ScrollTrigger authoring happens inside `components/motion/` or within a component's own scoped `useGSAP` call — never inline in a Server Component (impossible anyway since GSAP requires the client) and never as an unscoped global side effect.
- Every `useGSAP` call must pass `{ scope: containerRef }` — unscoped selectors (`gsap.to(".class", ...)` without scope) are never allowed, to avoid cross-component selector collisions.
- Lenis is initialized exactly once at the app root — never per-page or per-component.
- `gsap.registerPlugin(...)` calls only ever happen inside `lib/gsap.ts`, guarded by `typeof window !== "undefined"` — never repeated in individual components.
- `ScrollTrigger.refresh()` is always called after route transitions complete and after any dynamic content/image load that changes layout height.
- All page transitions are GSAP-driven through `app/template.tsx` — no relying on Next.js default instant route swap for any user-facing route change.
- SplitText is a Club GreenSock (paid) plugin — if not licensed, the agent must build text-splitting manually (e.g. wrapping characters/words in spans via a utility function) rather than importing `SplitText` from `gsap/SplitText`. Confirm license status before importing it directly.
- No animation logic blocks first paint — preloader and hero entrance must not delay Largest Contentful Paint beyond a reasonable threshold; defer non-critical animations until after load.
- All images/videos used in scroll-triggered reveal components must have explicit width/height (or `fill` with a sized parent) to prevent layout shift that would desync ScrollTrigger start/end positions.
- No `position: fixed` Lenis-breaking patterns — any fixed/sticky element must be tested against Lenis's transform-based scroll (Lenis transforms the scroll container, which can affect naive `position: fixed` children depending on configuration).
- Respect `prefers-reduced-motion` — heavy entrance/scroll animations are simplified or disabled when the user has this preference set.
- All content text/copy lives in `data/*.ts` — never hardcoded directly inside component JSX, so default/placeholder content can be swapped later without touching component code.
- Theme is always resolved via the inline blocking script before first paint — never via a `useEffect` that applies `data-theme` after hydration, which causes a visible flash of the wrong theme on load.
