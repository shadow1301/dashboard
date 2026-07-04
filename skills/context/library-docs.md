# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to this portfolio site.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them.
2. **Check if an MCP server is configured** for that library (e.g. a GSAP docs MCP). If available — use it before falling back to general knowledge.
3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

GSAP 3's API has had meaningful changes across minor versions (plugin registration patterns, `@gsap/react` hook behavior). Never rely on general training knowledge alone for exact GSAP method signatures — verify against current docs when in doubt.

---

## GSAP 3 (core)

**Check first:** Check AGENTS.md for an installed GSAP skill or MCP. GSAP's official docs at gsap.com are the authoritative source.

### Plugin Registration

```typescript
// lib/gsap.ts — the only place plugins are registered
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export { gsap, ScrollTrigger, Flip };
```

**Rules:**

- Register plugins once, only in `lib/gsap.ts`
- Always guard registration with `typeof window !== "undefined"` since GSAP plugins reference the DOM
- Import `gsap` and plugins from `@/lib/gsap` everywhere else in the app — never `import { gsap } from "gsap"` directly in a component

---

### `@gsap/react` — `useGSAP` Hook

```typescript
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export function Section() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".item", { opacity: 0, y: 40, stagger: 0.08 });
    },
    { scope: ref, dependencies: [] },
  );

  return <div ref={ref}>...</div>;
}
```

**Rules:**

- Always pass `{ scope: ref }` — scopes all GSAP selector text (`".item"`) to descendants of `ref`, preventing collisions with identically-named classes elsewhere on the page
- Pass `dependencies: []` (or relevant deps) the same way you would a `useEffect` dependency array — omitting it re-runs on every render
- Cleanup (killing tweens/triggers) is automatic on unmount — no manual `.kill()` needed for anything created inside the callback

---

### ScrollTrigger

```typescript
useGSAP(
  () => {
    gsap.from(".reveal", {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%", // animation begins when section top hits 80% of viewport height
        end: "bottom 20%",
        toggleActions: "play none none reverse", // reverses when scrolling back up past start
        // markers: true, // enable during development only — never ship with markers on
      },
    });
  },
  { scope: ref },
);
```

**Rules:**

- `toggleActions: "play none none reverse"` is the default pattern for most reveal-on-scroll sections — animation plays once entering, reverses if the user scrolls back above the start point, so re-entering plays it again. Use `"play none none none"` only for genuinely one-time entrance animations that should never replay.
- Never leave `markers: true` in committed code — development-only debugging aid.
- Pinned sections (`pin: true`) are powerful but expensive — use sparingly, test thoroughly on mobile, and prefer disabling pin behavior below the tablet breakpoint via `matchMedia`.
- Use `ScrollTrigger.matchMedia()` for responsive animation differences (e.g. disabling a pinned horizontal scroll on mobile) rather than manually checking `window.innerWidth` inside the animation callback.

```typescript
useGSAP(() => {
  ScrollTrigger.matchMedia({
    "(min-width: 1024px)": function () {
      // desktop-only pinned/complex animation
    },
    "(max-width: 1023px)": function () {
      // simplified mobile equivalent
    },
  });
}, { scope: ref });
```

---

### Text Splitting (SplitText)

**Updated:** GSAP became 100% free — including every formerly Club GreenSock plugin (SplitText, MorphSVG, ScrollSmoother, etc.) — as of April 2025 following Webflow's acquisition of GreenSock. `SplitText` ships in the standard `gsap` npm package (confirmed installed at `node_modules/gsap/SplitText.js`, gsap v3.15). No license check, no manual fallback needed — import it directly.

```typescript
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText); // register once in lib/gsap.ts alongside ScrollTrigger

const split = SplitText.create(headlineRef.current, { type: "chars,words" });
gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.02, ease: "power2.out" });
```

SplitText 3.13+ was rewritten with an `autoSplit` option that handles resize/re-splitting automatically — for responsive headline type (this project uses `clamp()` sizing throughout), prefer creating the animation inside SplitText's `onSplit()` callback so re-splits on resize don't animate stale elements:

```typescript
SplitText.create(headlineRef.current, {
  type: "chars,words",
  autoSplit: true,
  onSplit: (self) => {
    return gsap.from(self.chars, { opacity: 0, y: 20, stagger: 0.02 });
  },
});
```

**Rules:**

- Register `SplitText` in `lib/gsap.ts` only, same as every other plugin — never call `gsap.registerPlugin()` in a component.
- The manual span-wrapping fallback (wrapping words in `overflow: hidden` spans by hand) is no longer necessary for this project and should not be used — `SplitText` is simpler, more accurate (handles foreign characters, emoji), and has built-in accessibility (`aria-label` on the split element, `aria-hidden` on generated spans).

---

## Lenis (Smooth Scroll)

**Check first:** Check AGENTS.md for an installed Lenis skill/MCP. lenis.darkroom.engineering is the authoritative source.

### Setup

```typescript
// lib/lenis.ts
"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let lenisInstance: Lenis | null = null;

export function initLenis(): Lenis {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({ autoRaf: false });
  lenisInstance.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
```

Initialized once inside a small Client Component (`components/layout/SmoothScrollProvider.tsx` or similar) rendered in the root layout, wrapping `children`.

### Locking Scroll (e.g. while menu overlay is open)

```typescript
const lenis = getLenis();
lenis?.stop(); // on overlay open
lenis?.start(); // on overlay close
```

**Rules:**

- `autoRaf: false` is required since GSAP's ticker drives the raf loop instead — never let both Lenis's internal RAF and GSAP's ticker run simultaneously, this causes double-update jank
- `gsap.ticker.lagSmoothing(0)` disables GSAP's lag smoothing so Lenis's own smoothing isn't fighting it
- Always use `lenis.stop()` / `lenis.start()` to lock scroll (e.g. for the full-screen menu overlay) — never `document.body.style.overflow = 'hidden'` alone, which desyncs from Lenis's internal scroll position tracking
- Anchor links (e.g. "scroll to contact") use `lenis.scrollTo(target, { offset, duration })` instead of native `element.scrollIntoView()`

---

## Theming (custom, no next-themes)

This project hand-rolls theme switching (see architecture.md Theme Initialization Pattern) rather than using the `next-themes` package. `next-themes` is a fine library in general, but its default class-based (`dark`/`light` className on `<html>`) approach pairs naturally with Tailwind's `dark:` variant, which this project deliberately avoids (see ui-rules.md) in favor of a pure CSS-variable remap via `data-theme`. Adding `next-themes` on top would mean two competing theme-application mechanisms for no benefit.

**Rules:**

- Theme state lives in `data-theme="dark" | "light"` on `<html>`, never a `dark`/`light` class
- The blocking inline script in `app/layout.tsx` is the only thing allowed to set `data-theme` before hydration — `ThemeProvider` syncs React state to the already-applied attribute on mount, it does not re-apply the attribute itself on initial mount (only on subsequent toggles)
- If a future requirement genuinely needs `next-themes` (e.g. multi-theme beyond light/dark, or SSR cookie-based theme persistence), that's a deliberate architecture change — update architecture.md and this file before introducing the dependency, don't add it ad hoc

---



**Check first:** Check AGENTS.md for an installed Next.js skill/MCP for App Router specifics that may differ from training data.

### Images

```typescript
import Image from "next/image";

<Image
  src={project.coverImage}
  alt={project.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isHero} // only true for above-the-fold hero/first visible image
/>
```

**Rules:**

- `fill` + a sized, `position: relative` parent with `overflow: hidden` is the standard pattern for project tiles and gallery images — required so GSAP scale/clip-path reveals have a stable container
- `priority` only on the single hero image (or first viewport image) — never set on every image, defeats lazy loading
- Always provide accurate `sizes` for responsive images used in grids

### Fonts

```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**Rules:**

- `display: "swap"` to avoid invisible text during font load (FOIT)
- Local/licensed fonts use `next/font/local` with the same `variable` pattern

---

## clsx / tailwind-merge (`cn` utility)

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Rules:**

- Always use `cn()` for any component accepting a `className` prop or combining conditional classes — never manual string concatenation/template literals for class merging

---

## zod (Contact Form Validation, when wired)

```typescript
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message is too short"),
});

type ContactFormValues = z.infer<typeof contactSchema>;
```

**Rules:**

- Client-side validation on submit before any future server wiring — `safeParse()`, never throw raw from the form handler
- Error messages map directly to the inline error UI pattern defined in ui-rules.md — never expose raw Zod error objects to the user
