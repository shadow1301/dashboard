# Project Overview

## About the Project

This is a personal portfolio website built as a motion-led, agency-grade single-entity site — the same visual league as rogue.studio, herostudios.tv, and worldofnrg.com. It is not a generic template with a fade-in here and there. Every scroll, every page transition, every hover is choreographed with GSAP. The site exists to make one impression fast: this person can build things that move with intention.

Content is placeholder/default for now (name, bio, project details, contact info) and is structured so it can be swapped for real content later without touching layout or animation code.

---

## The Problem It Solves

A portfolio's job is to convert attention into a memory. Most developer portfolios look like documentation. This one is built to feel like an experience — cinematic intro, scroll-driven storytelling, a project showcase that feels like a reel, not a list. The bar is: would this hold up next to the three reference sites.

---

## Pages

```
/                  → Homepage (hero, intro statement, featured work, about teaser, contact CTA)
/work              → Full work/projects index
/work/[slug]       → Individual case study page
/about             → About page (bio, capabilities, timeline, tools)
/contact           → Contact page (form + direct details)
```

---

## Navigation

Fixed/overlay navbar. Minimal by default, expands into a full-screen menu overlay on open (agency-site pattern — not a dropdown).

```
Work    About    Contact          [Theme toggle]  [Menu toggle — top right]
```

- Theme toggle — sun/moon icon, switches light/dark, animated icon morph on toggle

- Logo / monogram — top left, links home
- Menu toggle — top right, opens full-screen nav overlay with large animated link list
- Navbar background transparent over hero, solidifies on scroll (color-mix with page background)

---

## Core User Flow

### Homepage

- Preloader — brief, animated, masks initial layout shift (counts to 100% or wordmark reveal), only on first load per session
- Hero — full viewport, oversized headline (name / role statement), animated entrance (split text reveal), subtle cursor-reactive or scroll-reactive element
- Marquee strip — scrolling text band (role keywords, tools, or tagline), infinite loop
- Featured Work — 3-4 projects, large image/video tiles, image reveals on scroll (clip-path or scale), hover distorts/zooms
- About teaser — short statement + portrait or abstract visual, link to full About page
- Capabilities / services band — horizontal list or grid, scroll-pinned reveal
- Contact CTA — full-bleed section, large "Let's Talk" style headline, animated on enter
- Footer — socials, email, back-to-top

### Work Index (`/work`)

- Page header with section title and short intro line
- Project list — alternating large rows or grid, each with title, role/year, tags, thumbnail that animates in on scroll and on hover
- Each row links to `/work/[slug]`

### Case Study (`/work/[slug]`)

- Hero — project title, large cover image/video, meta (role, year, tech stack, link)
- Overview section — problem, approach, outcome
- Gallery — full-bleed images/video with scroll-triggered reveals
- Next project — footer-style link to next case study, encourages continued browsing

### About (`/about`)

- Intro statement — large type, animated reveal
- Bio paragraph
- Timeline / experience list — scroll-triggered stagger
- Tools/stack grid
- Photo or abstract visual element

### Contact (`/contact`)

- Large animated headline
- Contact form (name, email, message)
- Direct contact details (email, social links)
- Optional: animated background element or magnetic button on submit

---

## Animation Language (GSAP)

This is the core differentiator of the project — treat it as a first-class system, not decoration.

- **Page load** — preloader → hero entrance timeline, staggered and sequenced, never simultaneous chaos
- **Scroll-driven reveals** — ScrollTrigger pinning, text split-and-stagger reveals, image clip-path/scale reveals as sections enter viewport
- **Smooth scroll** — Lenis (or GSAP ScrollSmoother) driving the entire site, native scroll disabled in favor of buttery inertia scroll
- **Page transitions** — route changes animate out/in rather than hard-cutting (overlay wipe or content fade+slide), using GSAP timelines tied to Next.js navigation
- **Micro-interactions** — magnetic buttons, cursor-follow elements, hover image distortion/parallax on project tiles
- **Marquee** — infinite horizontal scroll text band, GSAP-driven (not CSS-only) so speed can react to scroll velocity
- **Text reveals** — SplitText-style character/word/line stagger animations on headings as they enter view

---

## Features In Scope

- Animated preloader (session-gated)
- Full-screen navigation overlay menu
- GSAP-driven hero entrance timeline
- ScrollTrigger-based section reveals throughout all pages
- Lenis smooth scrolling integrated with ScrollTrigger
- Animated page transitions between routes
- Infinite marquee component
- Project showcase grid/list with hover and scroll reveals
- Individual case study pages with image/video galleries
- About page with timeline and tools grid
- Contact page with animated form
- Fully responsive across mobile/tablet/desktop with adapted (not removed) animation behavior
- Default/placeholder content for all personal details, structured for easy future replacement
- Light/dark theme toggle — system-preference-aware on first load, manually overridable, persisted across visits

## Features Out of Scope

- CMS or admin panel — content is hardcoded in data files for now
- Blog / articles section
- Authentication or user accounts
- Backend database — no persistence layer in this phase
- Real contact form submission backend (UI + client-side validation only initially; can be wired to an email service later)
- Multi-language support
- E-commerce or payments

---

## Target User

Anyone evaluating this person's work and craft at a glance — recruiters, founders, collaborators, other designers/developers. They should leave the site with zero doubt about the technical and visual quality of the work.

---

## Success Criteria

- Hero loads and animates in without layout jank or flash of unstyled content
- Scroll feels smooth and intentional on both desktop and mobile (Lenis tuned correctly, no scroll-jacking complaints)
- Every section reveal is triggered correctly on scroll, in both directions, without re-triggering bugs
- Page transitions never hard-cut — always animated
- Site holds up visually next to rogue.studio, herostudios.tv, and worldofnrg.com
- Lighthouse performance score reasonable despite heavy animation (lazy-loaded media, optimized assets)
- All content is placeholder-driven from a single data source per section, trivially editable later
