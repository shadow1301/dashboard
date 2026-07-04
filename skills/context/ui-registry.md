# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## Baseline — Established 2026-07-03

[Note: Full project rebuild with royal sci-fi theme]

### Navbar
File: components/layout/Navbar.tsx
| Property | Class |
|----------|-------|
| Background | transparent → `bg-surface/80 backdrop-blur-lg` on scroll |
| Border | `border-transparent` → `border-border/50` on scroll |
| Border radius | none |
| Text — primary | `text-foreground` |
| Text — hover | `hover:text-accent` |
| Spacing | fixed h-[88px], px-[clamp(24px,5vw,96px)] |

### MenuOverlay
File: components/layout/MenuOverlay.tsx
| Property | Class |
|----------|-------|
| Background | `bg-surface-inverse/90 backdrop-blur-xl` |
| Text — primary | `text-foreground-inverse` |
| Text — nav links | `font-display text-[clamp(32px,6vw,56px)]` |
| Text — secondary | `text-foreground-muted` |
| Stagger | 0.06s GSAP stagger |

### Footer
File: components/layout/Footer.tsx
| Property | Class |
|----------|-------|
| Background | `bg-background` |
| Border | `border-t border-border` |
| Text | `text-foreground-muted` |
| Spacing | `px-[clamp(24px,5vw,96px)] py-[clamp(64px,10vw,160px)]` |

### ThemeToggle
File: components/layout/ThemeToggle.tsx
| Property | Class |
|----------|-------|
| Background | none (transparent) |
| Shape | h-10 w-10 rounded-full |
| Text | `text-foreground` → `hover:text-accent` |

### Preloader
File: components/layout/Preloader.tsx
| Property | Class |
|----------|-------|
| Background | `bg-background` |
| Text — wordmark | `font-display text-[clamp(24px,4vw,48px)]` |
| Text — counter | `font-sans text-sm text-foreground-muted` |

### PageTransition (template)
File: app/template.tsx
| Property | Class |
|----------|-------|
| Animation pattern | Exit: fade+slide y:20 (0.4s), Enter: fade+slide (0.5s), 0.2s overlap |

### Primary CTA Button
| Property | Class |
|----------|-------|
| Background | `bg-accent` |
| Text | `text-accent-foreground font-medium` |
| Shape | `rounded-full px-8 py-4` |
| Hover | Magnetic pull via `MagneticButton` wrapper |

### Cards / Tiles
| Property | Class |
|----------|-------|
| Background | `bg-surface-raised` |
| Border | `border border-border` |
| Radius | `rounded-lg` |
| Overflow | `overflow-hidden` |

### Form Inputs
| Property | Class |
|----------|-------|
| Background | `bg-transparent` |
| Border | `border-b border-border-strong` |
| Focus | `focus:border-accent` |
| Text | `text-foreground` |
| Placeholder | `placeholder-foreground-faint` |

### Section Spacing
| Property | Class |
|----------|-------|
| Horizontal padding | `px-[clamp(24px,5vw,96px)]` |
| Vertical padding | `py-[clamp(64px,10vw,160px)]` |
| Section separators | `border-t border-border` |
