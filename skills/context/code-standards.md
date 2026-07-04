# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately (visually, in browser) after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions, including in animation code
- **One thing at a time** — complete one section/component fully (including its animation) before touching the next
- **Motion is a first-class feature, not a finishing touch** — never defer animation work to "later"; a section without its intended GSAP animation is an incomplete section, not a done one with polish pending

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- Use `const` by default — only use `let` when reassignment is necessary (common in GSAP timeline variables, ref mutations)

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- Components are Server Components by default
- Only add `"use client"` when the component requires:
  - GSAP, Lenis, or any animation/scroll logic
  - useState, useReducer, or useRef tied to DOM measurement
  - useEffect or useGSAP
  - Browser APIs (window, IntersectionObserver outside GSAP, etc.)
  - Event listeners (onClick, onMouseMove for cursor/magnetic effects, etc.)
- Never add `"use client"` to layout files unless absolutely required — keep `app/layout.tsx` as a thin Server Component shell, push client logic (Lenis init, GSAP plugin registration) into a dedicated client wrapper component imported by the layout
- Static placeholder content is read from `data/*.ts` in Server Components and passed down as props — never re-fetched or re-imported inside Client Components that already received it as a prop
- Route handlers (`app/api/`) are only introduced if/when the contact form is wired to a real backend — not present in the initial build
- Always read Next.js and GSAP documentation before implementing any unfamiliar API — both ecosystems change; do not rely solely on training data for exact method signatures (especially GSAP 3.x plugin APIs and Next.js 16 App Router specifics)

---

## File and Folder Naming

- Folders: kebab-case — `case-study`, `motion`
- Component files: PascalCase — `Hero.tsx`, `MenuOverlay.tsx`
- Utility/lib files: camelCase — `gsap.ts`, `lenis.ts`, `utils.ts`
- Data files: camelCase — `projects.ts`, `about.ts`, `site.ts`
- Type files: camelCase — `index.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` if a barrel export is genuinely useful — never barrel export from animated section folders (`home/`, `work/`, etc.)

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

// 2. Internal imports
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

// 3. Type definitions
type Props = {
  projects: Project[];
};

// 4. Component
export function ComponentName({ projects }: Props) {
  // refs
  // useGSAP animation block
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared across multiple components
- No inline styles except where a value must be computed at runtime (e.g. a CSS variable driven by cursor position for magnetic buttons) — in that case use `style={{ '--x': x }}` and consume it via CSS, documented with a brief comment why

---

## GSAP-Specific Standards

- Every animated component uses the `useGSAP` hook from `@gsap/react` with an explicit `{ scope: ref }` — never bare `useEffect` + manual `gsap.context()` unless `useGSAP` genuinely cannot cover the case (document why if so)
- All GSAP plugin imports happen through `@/lib/gsap` — components never call `gsap.registerPlugin()` themselves
- ScrollTrigger `start`/`end` values are kept readable and commented when non-obvious (e.g. `start: "top 80%" // begins as section enters lower fifth of viewport`)
- Timelines with multiple sequenced steps use a named `gsap.timeline()` variable, not chained one-off tweens, once there are more than 2 sequenced animations — improves readability and makes the sequence easy to scrub/debug
- Cleanup is implicit via `useGSAP`'s automatic revert on unmount — never manually call `.kill()` on every individual tween; if a specific tween needs early manual control, store it in a ref and document why
- Avoid animating layout-triggering properties (`width`, `height`, `top`, `left`); always prefer `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`
- `ScrollTrigger.refresh()` is called after page transitions and after any async content/image load that could change document height (see architecture.md Data Flow)

---

## Data Files

```typescript
// data/projects.ts

export type Project = {
  slug: string;
  title: string;
  role: string;
  year: string;
  tags: string[];
  coverImage: string;
  overview: string;
  gallery: string[];
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    role: "Design & Development",
    year: "2026",
    tags: ["Next.js", "GSAP", "Branding"],
    coverImage: "/images/projects/project-one/cover.jpg",
    overview: "Placeholder overview text — replace with real project description.",
    gallery: ["/images/projects/project-one/01.jpg", "/images/projects/project-one/02.jpg"],
  },
  // additional placeholder projects...
];
```

- All placeholder content lives in `data/` and is strongly typed
- Never hardcode copy strings directly in component JSX — always import from the relevant `data/*.ts` file
- Placeholder images live under `public/images/` in a predictable folder structure mirroring the data file references

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious animation timing choice, a Lenis/ScrollTrigger interaction quirk, or a deliberate deviation from ui-rules.md
- Never leave TODO comments in committed code — track outstanding work in progress-tracker.md instead

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does GSAP's core or a free plugin already do this? (Prefer free GSAP plugins over paid Club GreenSock ones unless explicitly licensed)
2. Does Next.js already provide this functionality (next/image, next/font)?
3. Is there a simpler native CSS/JS solution?

Approved dependencies for this project:

- `gsap` — core animation engine + free plugins (ScrollTrigger, Flip, Draggable)
- `@gsap/react` — `useGSAP` hook
- `lenis` — smooth scroll
- `clsx` / `tailwind-merge` (or a small `cn()` utility built from them) — conditional class merging
- `lucide-react` — icons
- `tailwindcss` — styling
- `zod` — form validation (contact form), if/when added

Do not install any other packages without updating this list first. In particular, do not install a second smooth-scroll library or a second animation library (e.g. Framer Motion) alongside GSAP — GSAP is the single animation system for this project, to avoid conflicting scroll/animation engines fighting each other.
