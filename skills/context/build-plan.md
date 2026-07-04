# Build Plan

## Core Principle

Full page UI built with placeholder content first — verified visually and verified in-browser (including scroll behavior) before moving to the next section. Animation is built alongside layout, not bolted on afterward — a section is not "done" until its motion matches ui-rules.md. Every feature must be visible and testable before moving to the next. No invisible phases.

---

## Phase 1 — Foundation

### 01 Project Setup & Design Tokens

Set up the base Next.js 16 project, Tailwind v4 tokens, fonts, and the GSAP/Lenis foundation before any page content is built.

**Logic:**

- Initialize Next.js 16 App Router project, TypeScript strict
- Install approved dependencies from code-standards.md (`gsap`, `@gsap/react`, `lenis`, `clsx`, `tailwind-merge`, `lucide-react`)
- Define all tokens in `app/globals.css` per ui-tokens.md
- Set up `next/font/google` (or local font) per ui-rules.md
- Create `lib/gsap.ts` — plugin registration
- Create `lib/lenis.ts` — Lenis instance setup
- Create `components/layout/SmoothScrollProvider.tsx` — wraps app, initializes Lenis once
- Wire `SmoothScrollProvider` into `app/layout.tsx`
- Create `data/site.ts` with placeholder site-wide constants (name, role/tagline, nav links, social links, email)

---

### 02 Theme System — Light & Dark

Build the theme infrastructure before any themed UI is built, so every subsequent component is theme-correct from the start.

**Logic:**

- Define `:root` (dark) and `[data-theme="light"]` tokens in `app/globals.css` per ui-tokens.md
- Add the inline blocking theme-init script to `app/layout.tsx` per architecture.md (prevents flash of wrong theme)
- Create `lib/theme.ts` — get/set helpers
- Create `components/layout/ThemeProvider.tsx` — context exposing `theme` + `toggleTheme()`
- Create `components/layout/ThemeToggle.tsx` — icon button, GSAP icon morph on toggle, wired into Navbar (built next)

**Verification:** toggle switches the entire page between themes with a smooth cross-fade, no flash on reload in either theme, choice persists after a hard refresh.

---

### 03 Layout Shell — Navbar, Footer, Menu Overlay

Build the persistent layout chrome used across every page.

**UI:**

- `Navbar.tsx` — logo/monogram left, nav links + theme toggle + menu toggle right, transparent → scrolled state per ui-rules.md
- `MenuOverlay.tsx` — full-screen overlay menu, staggered link entrance/exit, locks Lenis scroll while open
- `Footer.tsx` — socials, email, back-to-top link

**Logic:**

- Navbar background state driven by scroll position (GSAP ScrollTrigger toggle, not CSS-only)
- Menu toggle morphs hamburger → X via GSAP
- Menu overlay open/close timelines (staggered link reveal)
- Theme toggle (built in 02) placed in navbar, verified visible and functional in both transparent and scrolled states

---

### 04 Preloader

Build the initial-load preloader, session-gated so it only plays once.

**UI:**

- `Preloader.tsx` — wordmark or percentage counter, full-screen, masks initial content

**Logic:**

- Plays once per session (sessionStorage flag) — does not replay on internal navigation
- Exit timeline hands off directly into the homepage hero entrance timeline (sequenced, not two separate unrelated animations)
- Preloader background/text correctly themed on load — verify in both dark and light

---

### 05 Page Transition System

Build the route-change animation wrapper before adding more than one real page, so every subsequent page automatically inherits transitions.

**Logic:**

- `app/template.tsx` — detects route change via `usePathname`
- `components/layout/PageTransition.tsx` — exit/enter timeline logic
- `ScrollTrigger.refresh()` called after transition completes
- Scroll resets to top after transition (unless anchor-based navigation)

---

## Phase 2 — Homepage

### 06 Hero Section

Build the homepage hero with full entrance choreography.

**UI:**

- Oversized headline (placeholder name/role statement) using display type scale
- Supporting subline
- Primary CTA button (e.g. "View Work") with magnetic hover
- Scroll cue element

**Logic:**

- Headline split into words/lines (manual split utility or SplitText per license status) with staggered entrance
- Entrance sequence: preloader exit → headline reveal → subline/CTA fade-up → scroll cue fade-in
- Magnetic button behavior on CTA (`components/motion/MagneticButton.tsx`)

---

### 07 Marquee Component

Build the reusable infinite marquee.

**UI:**

- `components/motion/Marquee.tsx` (or `home/Marquee.tsx` if homepage-specific) — looping text band

**Logic:**

- GSAP-driven infinite loop, no visible seam
- Configurable direction and speed via props
- Used at least once on homepage (role keywords or tagline)

---

### 08 Featured Work Section

Build the homepage's featured project showcase.

**UI:**

- 3-4 project tiles using placeholder data from `data/projects.ts`
- Tile image, title, role/year meta, tag list

**Logic:**

- Scroll-in reveal per tile (clip-path or scale pattern, applied consistently — see ui-rules.md)
- Desktop hover: image scale/parallax, title slide-up
- Mobile: hover effects dropped, scroll-reveal only, title always visible
- Each tile links to `/work/[slug]` (using placeholder slugs)

---

### 09 About Teaser + Capabilities Band

Build the homepage sections that lead into the About page.

**UI:**

- Short bio statement + portrait/abstract visual, "More about me" link to `/about`
- Capabilities/services list or grid (placeholder service/skill items)

**Logic:**

- Scroll-triggered stagger reveal on capability items
- Standard `ScrollReveal` wrapper pattern established here for reuse elsewhere

---

### 10 Contact CTA Section + Homepage Footer Assembly

Complete the homepage with its closing CTA section.

**UI:**

- Full-bleed CTA section, large "Let's Talk" style headline, button to `/contact`
- Footer (already built in 02, now placed on homepage)

**Logic:**

- Entrance animation on CTA headline as it scrolls into view
- Verify full homepage scroll flow end-to-end: preloader → hero → marquee → featured work → about teaser → capabilities → CTA → footer, all transitions correct in both scroll directions

---

## Phase 3 — Work Pages

### 11 Work Index Page — Full UI

Build the `/work` listing page.

**UI:**

- Page header (section title + intro line), animated in via page transition + scroll reveal
- Full project list — alternating large rows or grid (per ui-rules.md), using all placeholder projects from `data/projects.ts`

**Logic:**

- Reuses tile/row reveal pattern from Featured Work (07) — do not reinvent, confirm consistency in ui-registry.md
- Each row links to `/work/[slug]`

---

### 12 Case Study Page — Full UI

Build the dynamic `/work/[slug]` case study template.

**UI:**

- `CaseStudyHero.tsx` — title, full-bleed cover image/video, meta row (role, year, stack, external link)
- `CaseStudyOverview.tsx` — problem/approach/outcome, constrained reading width
- `CaseStudyGallery.tsx` — full-bleed gallery images, each individually scroll-revealed
- `NextProject.tsx` — large footer-style link to the next project in `data/projects.ts` (wrap around to first project after the last)

**Logic:**

- `generateStaticParams` (or dynamic route handling) reads all slugs from `data/projects.ts`
- 404/not-found handling for an invalid slug
- Gallery images use `next/image` `fill` pattern with sized containers per library-docs.md

---

## Phase 4 — About & Contact Pages

### 13 About Page — Full UI

Build the `/about` page.

**UI:**

- `Intro.tsx` — large animated statement
- Bio paragraph
- `Timeline.tsx` — experience/milestones list, placeholder entries, staggered scroll reveal
- `ToolsGrid.tsx` — tools/stack grid, placeholder items
- Photo or abstract visual element

**Logic:**

- Timeline stagger reveal reuses `ScrollReveal` pattern
- Page transition entrance verified consistent with other pages

---

### 14 Contact Page — Full UI + Form Logic

Build the `/contact` page including client-side form handling.

**UI:**

- Large animated headline
- `ContactForm.tsx` — name, email, message fields per ui-rules.md form pattern
- `ContactDetails.tsx` — direct email + social links
- Submit button with magnetic hover, primary CTA treatment

**Logic:**

- Zod schema validation on submit (client-side only in this phase — see library-docs.md)
- Inline error display per field
- Success state — animated reveal replacing/overlaying the form (no real backend submission yet; logs to console or no-ops, structured so a real submit handler can be dropped in later)

---

## Phase 5 — Polish & Performance

### 15 Responsive Pass

Audit every page and component at all four required breakpoints (390px, 768px, 1440px, 1920px) per ui-rules.md, in both themes.

**Logic:**

- Verify ScrollTrigger start/end values hold up at each breakpoint
- Verify `ScrollTrigger.matchMedia()` used wherever desktop/mobile animation behavior genuinely differs (especially any pinned sections)
- Confirm all hover-only interactions are absent on touch devices
- Re-check every page in light theme as well as dark — a layout or contrast issue can hide in one theme and surface in the other

---

### 16 Reduced Motion & Accessibility Pass

Ensure the experience degrades gracefully and remains usable.

**Logic:**

- `prefers-reduced-motion` respected — simplify or disable large entrance/scroll animations
- Keyboard navigation works through navbar, menu overlay, and all links/buttons
- Focus states visible and styled consistently (not browser default, but never removed entirely)
- Alt text present on all images (placeholder alt text acceptable for now, structured per project)

---

### 17 Performance Pass

Verify the site performs acceptably despite animation density.

**Logic:**

- Images optimized via `next/image`, correct `sizes` and `priority` usage per library-docs.md
- No layout-shift-causing animated properties (`top`/`left`/`width`/`height`) remain — confirm all motion uses `transform`/`opacity`
- Lighthouse pass on homepage and one case study page — address any major flagged issues
- Confirm preloader does not artificially delay perceived load on repeat visits (session-gated correctly)

---

## Feature Count

| Phase                          | Features |
| -------------------------------- | -------- |
| Phase 1 — Foundation             | 5        |
| Phase 2 — Homepage                | 5        |
| Phase 3 — Work Pages               | 2        |
| Phase 4 — About & Contact          | 2        |
| Phase 5 — Polish & Performance      | 3        |
| **Total**                         | **17**   |
