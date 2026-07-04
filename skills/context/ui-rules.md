# UI Rules

Concise rules for building the portfolio UI. These cover layout, component, and motion-interaction patterns needed to keep the site visually and behaviorally consistent with the rogue.studio / herostudios.tv / worldofnrg.com reference tier. Pair this file with `ui-tokens.md` for exact values.

---

## Font

Import the primary sans font via `next/font/google` (or `next/font/local` if using a licensed font) in the root layout.

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

Apply the font variable class to the `<html>` tag in root layout. Never use system fonts as the primary font. If a display/serif pairing is used for hero headlines, load it the same way and bind it to `--font-display`.

---

## Layout

- Page max-width: none — this project uses true full-bleed, full-viewport sections (unlike a dashboard's centered max-width container). Inner content within a section may be constrained to a max content width (e.g. 1600px) where appropriate (case study body text), but hero/marquee/CTA sections always span full viewport width.
- Page horizontal padding: `clamp(24px, 5vw, 96px)` applied per-section, not a single global wrapper
- Section vertical padding: `clamp(64px, 10vw, 160px)` — see ui-tokens.md spacing scale
- Navbar height: 88px, fixed/sticky, transparent over hero, background fades in on scroll
- No sidebar — top navbar + full-screen overlay menu only

---

## Navbar

Two states: transparent-over-hero and scrolled (solid background).

- Transparent state: `background: transparent`, text always `text-foreground` for the current active theme (theme-aware, not assumed dark)
- Scrolled state: `background: var(--background)` at ~92% opacity with backdrop-blur, border-bottom `1px solid var(--border)`
- Transition between states driven by GSAP (ScrollTrigger toggleClass or scroll-progress-driven opacity), not CSS-only `:hover`/scroll snap
- Menu toggle (right side): two-line hamburger that morphs to an X via GSAP rotate/transform when overlay opens — never an instant icon swap
- Theme toggle sits beside the menu toggle, always visible (not hidden inside the overlay menu) — see Theme Toggle section below

---

## Theme Toggle

- Icon-only button (sun/moon, or a single morphing icon) placed in the navbar, both transparent and scrolled states
- On click: icon morphs via GSAP (rotate + crossfade or path morph), `data-theme` attribute updates on `<html>`, and `body` background/text colors cross-fade via the CSS `transition` defined in ui-tokens.md globals.css — never an instant hard color swap
- Choice persists to `localStorage` and is read before first paint (inline script in root layout, see architecture.md) to prevent a flash of the wrong theme on load
- Toggle never triggers a full ScrollTrigger re-calculation or section re-animation — only colors transition, layout and active scroll-reveal state are untouched
- Hero background elements (gradient mesh, noise texture, abstract shape — see Hero Section below) must have a light-theme-appropriate variant defined alongside the dark one; never an element that only looks intentional in one theme
- Project tile images and any photography are theme-agnostic — only UI chrome (backgrounds, text, borders, accent) responds to the toggle, never the imagery itself

---

## Full-Screen Menu Overlay

- Covers 100vw/100dvh, `background: var(--background)` or `var(--surface-inverse)` for contrast break
- Nav links rendered large (display-scale type), each animates in with a staggered slide/reveal on open (GSAP timeline, ~0.06-0.1s stagger between items)
- Closing reverses the timeline — never an abrupt unmount
- Background page scroll is locked while overlay is open (Lenis `stop()`/`start()`, not just CSS `overflow: hidden`, so scroll position doesn't drift)
- Includes secondary content: social links, email, current time/location (optional agency-site flourish) — keep secondary content visually subordinate to the main nav list

---

## Hero Section

- Full viewport height (`100dvh`)
- Headline uses the display type scale and is split into characters/words/lines for staggered entrance (see SplitTextReveal pattern in architecture.md)
- Entrance animation sequence: preloader exits → headline reveals → supporting text/CTA fades up → background element settles. Always sequenced, never all elements animating simultaneously on load.
- Optional scroll cue (small animated arrow/text) bottom-center, fades out as user starts scrolling
- Background may include a subtle animated element (gradient mesh, noise texture, abstract shape) — must be performant (CSS/SVG-based or lightweight canvas, not a heavy video loop on mobile) and must have a defined appearance in both themes (e.g. via CSS variables for its colors), never built assuming only the dark background

---

## Project Tiles / Work Grid

- Image fills the tile (`object-fit: cover`), wrapped in an `overflow: hidden` container per ui-tokens.md card spec
- On scroll into view: image reveals via clip-path wipe or scale-down-from-110%-to-100% (pick one pattern, apply consistently across all tiles)
- On hover (desktop only): image scales slightly (1.0 → 1.05) and/or shifts on a parallax offset tied to cursor position; title/meta text may slide up from below the tile
- Tile click area is the entire tile, not just the title text
- On mobile, hover effects are dropped entirely — only the scroll-in reveal applies; mobile must never rely on a `:hover` state to reveal content

---

## Marquee

- Full-width band, text loops infinitely with no visible seam (duplicate content technique, not `animation: marquee` CSS alone — driven by GSAP for control over speed/direction tied to scroll velocity if desired)
- Direction can alternate between marquee instances (left-to-right vs right-to-left) if more than one is used on a page
- Pauses or slows on hover only if there's a clear interaction reason (e.g. marquee items are clickable); otherwise runs continuously

---

## Case Study Page

- Hero image/video is full-bleed, large, establishes the project's visual identity immediately
- Meta row (role, year, stack, external link) sits in a clean horizontal list below or beside the hero, using the "meta / eyebrow" type style from ui-tokens.md
- Body content (overview, approach, outcome) uses a constrained reading width (max ~720px) even though the page itself is full-bleed
- Gallery images are full-bleed or near-full-bleed, each with its own scroll-triggered reveal — never load all gallery images pre-revealed/static
- "Next project" footer link is large, full-width, treated like a secondary hero — encourages continued browsing, not a tiny "next" arrow

---

## Buttons & CTAs

- Primary CTA buttons use the pill/full-round shape per ui-tokens.md, paired with a magnetic hover effect (button visually pulls slightly toward cursor within a defined radius, GSAP `quickTo`-driven)
- Never use a plain `:hover` color-swap as the only interaction on a primary CTA — motion is required to match the reference-site bar
- Button text never wraps to two lines — pad/size accordingly

---

## Forms (Contact Page)

- Inputs are borderless except for a bottom border, per ui-tokens.md form input spec
- Labels animate up out of the input on focus/fill (floating label pattern) rather than sitting as static placeholder-only text, OR use a minimal placeholder-only approach consistently — pick one pattern project-wide, do not mix
- Submit button uses the primary CTA treatment with magnetic hover
- Validation errors shown inline below the relevant field in `text-error`, never as a raw browser alert or unstyled message
- Success state replaces the form (or shows an overlay confirmation) with an animated reveal — never a static "Thank you" text swap with no motion

---

## Custom Cursor (optional, desktop only)

- If implemented: default state is a small dot; expands/morphs into a ring or label (e.g. "View", "Drag") when hovering interactive elements like project tiles or buttons
- Always disabled on touch devices — detect via pointer media query, never rendered or attached on mobile/tablet
- `mix-blend-mode: difference` (or `exclusion`) keeps the cursor visible regardless of what's beneath it in either theme — preferred over a flat theme-colored cursor that could disappear against a matching background
- Never replaces native cursor functionality (text selection cursor, etc.) on text-input elements

---

## Page Transitions

- Every internal route change animates — see architecture.md `app/template.tsx` pattern
- Standard pattern: outgoing content fades/slides out (or an overlay panel wipes in), route swaps, incoming content fades/slides in (or overlay wipes out revealing new content)
- Transition duration: short enough to not feel sluggish (~0.5-0.8s total), never a multi-second showpiece on every single navigation
- Scroll position resets to top on route change after the transition (or as part of it), unless the destination is a same-page anchor

---

## Empty / Loading States

- Preloader is the only full-page loading state — used once per session on initial load
- Images use a low-contrast placeholder (blurred placeholder via `next/image` `placeholder="blur"`, or a solid `bg-surface-raised` block) while loading — never a layout-shifting blank gap
- No content section should ever be visibly "empty" in this project (all content is placeholder-seeded by default) — but if a future dynamic section has zero items, follow the same minimal empty-state pattern as a content-driven project (short muted text, no harsh error styling)

---

## Responsiveness

- Mobile breakpoint behavior is not just "scale down" — re-evaluate animation choreography per breakpoint:
  - Hero type scale drops via the `clamp()` values in ui-tokens.md, never overflows viewport width
  - Horizontal/pinned scroll sections (if any) either adapt to vertical scroll on mobile or are simplified — pinned horizontal scroll-jacking on mobile is fragile and should be avoided unless thoroughly tested
  - Hover-only interactions are removed entirely on touch devices, replaced with tap/scroll-triggered equivalents where the content matters (e.g. project tile title is always visible on mobile rather than hover-revealed)
- Test all ScrollTrigger start/end values at minimum at these breakpoints: 390px (mobile), 768px (tablet), 1440px (desktop), 1920px (large desktop)

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-purple-500`, `text-gray-600`) — use project tokens only
- Never define colors in a `tailwind.config.ts` file — use the `:root` / `[data-theme]` / `@theme inline` setup in globals.css
- Never use Tailwind's `dark:` variant or any component-level theme branching — all theme response comes from the token remapping in ui-tokens.md
- Never ship a new color, image, or background treatment that was only checked in one theme — verify both before considering a component done
- Never ship a section reveal animation that only plays once and never re-triggers correctly when scrolling back up and down again (test both directions)
- Never use `position: fixed` for general layout elements without accounting for Lenis's transform-based scrolling — verify fixed elements behave correctly with the chosen smooth-scroll setup
- Never animate `top`/`left`/`width`/`height` for motion — always animate `transform` and `opacity` for performance
- Never leave a GSAP ScrollTrigger instance uncleared on component unmount — always scoped via `useGSAP`
- Never stack more than 2 simultaneous large entrance animations competing for attention on first load
- Never show raw, unstyled browser form validation messages
