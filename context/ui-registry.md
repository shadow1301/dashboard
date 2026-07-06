# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## Baseline — Established 2026-07-04

### Sidebar
File: components/dashboard/Sidebar.tsx
| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Width | 240px (desktop), full overlay (mobile) |
| Border | `border-r border-border` |
| Nav item default | `text-foreground-muted hover:text-foreground hover:bg-surface-raised` |
| Nav item active | `bg-primary/10 text-primary` + left border |
| Nav spacing | `px-4 py-2.5 gap-3` (icon + label) |
| Bottom section | `border-t border-border mt-auto pt-4` |

### Header
File: components/dashboard/Header.tsx
| Property | Class |
|----------|-------|
| Background | `bg-background` |
| Height | `h-16` |
| Border | `border-b border-border` |
| Padding | `px-6` |
| Page title | `text-foreground font-semibold text-xl` |
| Right section | `flex items-center gap-3` |

### StatCard
File: components/dashboard/StatCard.tsx
| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Radius | `rounded-lg` |
| Padding | `p-6` |
| Metric value | `font-mono text-3xl font-bold text-foreground` |
| Metric label | `font-sans text-sm text-foreground-muted mt-1` |
| Trend | `text-sm font-medium` (green/red) |

### FleetTable
File: components/fleet/FleetTable.tsx
| Property | Class |
|----------|-------|
| Header bg | `bg-surface` |
| Row bg | `bg-surface` / `bg-background` alternating |
| Row hover | `hover:bg-surface-raised cursor-pointer` |
| Cell padding | `px-4 py-3` |
| Border | `border-b border-border` |
| Font | `font-mono text-sm` for data cells |
| Sort indicator | `text-foreground-faint ml-1` |

### VehicleHeroCard
File: components/fleet/VehicleHeroCard.tsx
| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Radius | `rounded-lg` |
| Padding | `p-6` |
| Vehicle ID | `font-mono text-2xl font-bold` |
| Stat items | `font-mono text-lg` value, `text-foreground-muted text-sm` label |

### HealthScoreBadge
(Used inside FleetTable and VehicleHeroCard)
| Property | Class |
|----------|-------|
| Good (80-100) | `bg-health-good/10 text-health-good border-health-good/30` |
| Warning (60-79) | `bg-health-warning/10 text-health-warning border-health-warning/30` |
| Critical (<60) | `bg-health-critical/10 text-health-critical border-health-critical/30` |
| Shape | `rounded-full px-2 py-0.5 text-xs font-semibold` |

### AlertBadge
File: components/alerts/AlertBadge.tsx
| Property | Class |
|----------|-------|
| Critical | `bg-error/10 text-error` |
| Warning | `bg-warning/10 text-warning` |
| Info | `bg-info/10 text-info` |
| Shape | `rounded-full px-2 py-0.5 text-xs font-semibold` |

### Primary Button
| Property | Class |
|----------|-------|
| Background | `bg-primary` |
| Text | `text-primary-foreground font-medium` |
| Shape | `rounded-md px-4 py-2` |
| Hover | `opacity-90` |
| Disabled | `opacity-50 cursor-not-allowed` |

### Outline Button
| Property | Class |
|----------|-------|
| Background | `transparent` |
| Border | `border border-border-strong` |
| Text | `text-foreground` |
| Hover | `bg-surface-raised` |
| Shape | `rounded-md px-4 py-2` |

### Cards / Panels
| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Radius | `rounded-lg` |
| Padding | `p-6` |
| Shadow | none (depth from surface contrast) |

### Form Inputs
| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border-strong rounded-md` |
| Focus | `ring-1 ring-primary border-primary` |
| Padding | `px-3 py-2` |
| Text | `text-foreground text-sm` |
| Placeholder | `placeholder-foreground-faint` |

### Login Card
| Property | Class |
|----------|-------|
| Container | `min-h-screen grid place-items-center bg-background` |
| Card | `bg-surface border border-border rounded-xl p-8 w-full max-w-sm` |
| Title | `text-foreground text-2xl font-bold text-center` |
| Subtitle | `text-foreground-muted text-sm text-center mt-1` |

### Section Spacing (Dashboard pages)
| Property | Class |
|----------|-------|
| Page padding | `p-6` |
| Section gap | `space-y-8` (or `gap-8` in grid) |
| Card grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` |
| Chart container | `bg-surface border border-border rounded-lg p-6` |

### Breadcrumbs
| Property | Class |
|----------|-------|
| Container | `flex items-center gap-2 text-sm text-foreground-faint mb-4` |
| Links | `hover:text-foreground transition-colors` |
| Separator | `/` in `text-foreground-faint` |
| Current | `text-foreground font-medium` |

### FileDropzone
File: components/upload/FileDropzone.tsx
| Property | Class |
|----------|-------|
| Container | `border-2 border-dashed border-border-strong rounded-lg p-8 bg-surface text-center cursor-pointer` |
| Drag active | `border-primary bg-primary/5` |
| Error | `border-error bg-error/5` |
| Icon | `text-foreground-faint mb-2 mx-auto` |
| Text | `text-foreground-muted text-sm` |
| Hint | `text-foreground-faint text-xs mt-1` |

### UploadProgress
File: components/upload/UploadProgress.tsx
| Property | Class |
|----------|-------|
| Container | `flex items-center gap-3 p-3 bg-surface rounded-lg border border-border` |
| Progress track | `bg-surface-raised rounded-full h-2 flex-1` |
| Progress fill | `bg-primary rounded-full h-2 transition-all duration-300` |
| Status icon | success: `text-health-good`, error: `text-error`, processing: `text-primary animate-spin` |

### BatchUploadList
File: components/upload/BatchUploadList.tsx
| Property | Class |
|----------|-------|
| Container | `space-y-2` |
| File item | `flex items-center gap-3 p-3 bg-surface rounded-lg border border-border` |
| Remove button | `text-foreground-faint hover:text-error transition-colors` |

### UploadResult
File: components/upload/UploadResult.tsx
| Property | Class |
|----------|-------|
| Success banner | `bg-health-good/10 border border-health-good/30 text-health-good rounded-lg px-4 py-3` |
| Warning banner | `bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-3` |
| Error banner | `bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3` |
| Error list | `mt-2 text-sm space-y-1 text-foreground-muted` |

### CsvPreview
File: components/upload/CsvPreview.tsx
| Property | Class |
|----------|-------|
| Container | `overflow-x-auto rounded-lg border border-border` |
| Table | `w-full text-sm` |
| Header | `bg-surface text-foreground-muted text-xs font-semibold uppercase` |
| Cell | `px-3 py-2 font-mono text-xs text-foreground border-b border-border` |

### Pagination
(Used in FleetTable and AlertsPage — client-side slice of fetched data)
| Property | Class |
|----------|-------|
| Container | `flex items-center justify-between px-4 py-2 border-t border-border` |
| Info text | `text-xs text-foreground-faint` |
| Page buttons | `Button variant={p === page ? "outline" : "ghost"} size="icon-sm" className="size-8 text-xs"` |
| Prev/Next | `PaginationPrevious` / `PaginationNext` with disabled state `pointer-events-none opacity-50` |
| Ellipsis | `PaginationEllipsis` for gaps >1 between current and edge pages |
| Page size | 20 (FleetTable), 15 (AlertsPage) |

### FleetInsights
File: components/analytics/FleetInsights.tsx
| Property | Class |
|----------|-------|
| Container | `bg-surface border border-border rounded-lg p-6 space-y-3` |
| Icon row | `flex items-center gap-2 text-foreground font-semibold text-sm` |
| Icon | `Lightbulb size-4 text-warning` |
| Body | `text-sm text-foreground-muted leading-relaxed` |
| Highlights | `<span className="text-foreground font-medium">` for data values |
| Risk number | `<span className="text-error font-medium">` for at-risk count |

### Upload Blocking Overlay
File: app/(dashboard)/upload/page.tsx (inline)
| Property | Class |
|----------|-------|
| Container | `fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm` |
| Spinner | `Loader2 size-16 animate-spin text-primary` with `Database` icon overlay |
| Title | `text-xl font-semibold text-foreground` |
| Body | `text-foreground-muted` |
| Progress bar | `w-48 h-1.5 bg-surface-raised rounded-full overflow-hidden` with `h-full bg-primary rounded-full animate-pulse w-[60%]` |
| Cancel button | `text-sm text-foreground-faint hover:text-error transition-colors flex items-center gap-2` (shown after 60s) |

### Empty State (Dashboard & Fleet)
Used in dashboard/page.tsx and fleet/page.tsx
| Property | Class |
|----------|-------|
| Container | `flex flex-col items-center justify-center py-20 text-center` |
| Icon | `size-12 text-foreground-faint mb-4` |
| Heading | `text-lg font-semibold text-foreground mb-2` |
| Body | `text-foreground-muted text-sm mb-6 max-w-sm` |
| CTA button | `inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90` |

### Settings Sections
File: app/(dashboard)/settings/page.tsx
| Property | Class |
|----------|-------|
| Section header | `flex items-center gap-3 mb-4` with icon `size-5 text-foreground-muted` and `h2 text-lg font-semibold` |
| Password form | `space-y-4 max-w-sm` |
| Section divider | `hr border-border` |
| Danger zone | icon `text-error`, button `variant="destructive"` |
| Confirmation dialog | `DialogContent` with `bg-error/10 p-3 text-sm text-error` warning inside |

### Toast Notifications
Library: sonner, wired via `lib/providers.tsx` as `<Toaster richColors closeButton position="top-right" />`
| Property | Class |
|----------|-------|
| Placement | `top-right` |
| Style | `richColors` with `closeButton` |
| Usage | `toast.success("...")`, `toast.error("...")` in upload, delete, password change, alert update flows |
| Error rollback | Optimistic UI reverted on API failure |

### Chart Patterns
| Property | Class |
|----------|-------|
| Card wrapper | `Card` with `CardHeader` + `CardTitle text-base` + `CardContent` |
| Chart height | `h-[250px]` (bar), `h-[300px]` (scatter) |
| Tooltip | `contentStyle={{ background: colors.surfaceInverse, color: colors.fgInverse, border: "none", borderRadius: "8px", fontSize: "13px" }}` |
| Grid | `CartesianGrid strokeDasharray="3 3" stroke={colors.grid}` |
| Axis | `stroke={colors.fgFaint} tick={{ fontSize: 12 }}` |
| Clickable bar | Recharts `<Bar cursor="pointer" onClick={...}>` — navigates to filtered fleet page |

### Dialog + Delete Confirmation
Used in FleetTable and SettingsPage
| Property | Class |
|----------|-------|
| Trigger | `DialogTrigger` wrapping the action button |
| Warning box | `flex items-start gap-2 rounded-lg bg-error/10 p-3 text-sm text-error` |
| Confirm button | `variant="destructive"` with loading state `<Loader2 className="size-4 animate-spin mr-2" />Deleting...` |
| Footer | `DialogFooter` with action button |

### Skeleton (Loading State)
| Property | Class |
|----------|-------|
| Base | `bg-surface-raised rounded-md animate-pulse` |
| Text line | `h-4 w-3/4` |
| Card skeleton | `h-32 w-full` |
| Row skeleton | `h-12 w-full` |
| Table skeleton | `space-y-1` with `h-10` rows |
