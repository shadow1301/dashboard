# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Complete
**Last completed:** Phase 5 — Polish & Performance
**Next:** — (all features shipped)

---

## Progress (Full Rebuild — Royal Sci-fi Theme)

### Phase 1 — Foundation

- [x] 01 Project Setup & Design Tokens
- [x] 02 Theme System — Light & Dark
- [x] 03 Layout Shell — Navbar, Footer, Menu Overlay
- [x] 04 Preloader
- [x] 05 Page Transition System

### Phase 2 — Homepage

- [x] 06 Hero Section
- [x] 07 Marquee Component
- [x] 08 Featured Work Section
- [x] 09 About Teaser + Capabilities Band
- [x] 10 Contact CTA Section + Homepage Footer Assembly

### Phase 3 — Work Pages

- [x] 11 Work Index Page — Full UI
- [x] 12 Case Study Page — Full UI

### Phase 4 — About & Contact Pages

- [x] 13 About Page — Full UI
- [x] 14 Contact Page — Full UI + Form Logic

### Phase 5 — Polish & Performance

- [x] 15 Responsive Pass
- [x] 16 Reduced Motion & Accessibility Pass
- [x] 17 Performance Pass

---

## Decisions Made During Build

- **Theme redesign:** Complete rebuild with "royal + design sci-fi" direction. Both themes redesigned — dark (deep space purple-black, amethyst accent, champagne gold), light (warm parchment/ivory, deep royal purple, dark goldenrod).
- **New token:** `--color-accent-gold` added as a second accent token for decorative highlights, hover states, and marquee word alternation.
- **Glass-morphism:** Applied selectively — MenuOverlay gets `bg-surface-inverse/90 backdrop-blur-xl`; all other surfaces remain solid.
- **Fonts:** Space Grotesk (sans) + Fraunces (display) via next/font/google.
- **GSAP:** SplitText is freely available (GSAP 100% free since April 2025). Registered in lib/gsap.ts alongside ScrollTrigger and useGSAP.
- **Scaffold:** Fresh `npx create next-app` style scaffold — config files recreated manually. eslint uses `@next/eslint-plugin-next` + `eslint-plugin-react-hooks` flat config (avoids circular JSON issue with `@eslint/eslintrc` compat).
- **Reduced motion:** CSS override for all animations + JS check in ScrollReveal component sets final state immediately. GSAP components skip entrance animations.
- **Contact form:** Zod v4 validation on submit (inline errors), animated success state replaces form. No backend submission.

---

## Notes

- All 17 features built in a single session as a complete rebuild.
- TypeScript strict mode, no `any`, no `as` type assertions.
- Lint and tsc both pass clean.
