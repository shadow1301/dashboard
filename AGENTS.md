<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes from older training data — async `params`/`searchParams`, `middleware.ts` renamed `proxy.ts`, `next/image`'s `priority` prop replaced by `preload`, `next lint` removed in favor of ESLint 9 directly, Turbopack as the default bundler. Before writing any unfamiliar API, check official docs first (nextjs.org/docs, recharts.org, tanstack.com/query), then fall back to `node_modules/` if offline context is needed. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes — only project tokens via `@theme inline`
- Components never import from `data/*.ts` directly — always through hooks (`hooks/*.ts`)
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — check official docs first, then `context/library-docs.md` for project-specific rules
- Every data-driven component must handle four states: loading, error, empty, success
- If the same problem persists after one corrective prompt — stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

## Notes

- No real backend/database in scope (see project-overview.md "Features Out of Scope"). All data is static placeholder in `data/*.ts`, fetched through simulated async hooks. Ignore any BaaS/SDK boilerplate.
- Authentication is mock — any email/password works, session stored in localStorage. No real auth provider.
- Health score is a deterministic formula, not ML. See `lib/predictions.ts` in architecture.md.
- shadcn/ui components live in `components/ui/` — never edit their source for project styling; compose with `cn()` and project tokens.
