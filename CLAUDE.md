@AGENTS.md

## Project: NOEL — Business Referral Network

Next.js 16.2.4 frontend. Laravel backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). All API calls proxied via `next.config.ts` rewrites — no direct backend URLs in components.

Auth: Laravel session cookie (`laravel_session`). `middleware.ts` guards protected routes. `AuthContext` fetches `/api/me` on mount, exposes `{ user, subscription, loading, refresh }`.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (Turbopack, App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + `tailwind-merge` + `clsx` |
| UI primitives | Radix UI + shadcn/ui (`components/ui/`) |
| Forms | react-hook-form + zod |
| HTTP | axios (configured in `lib/axios-config`) |
| Animation | framer-motion |
| Toast | react-hot-toast |
| Charts | recharts, apexcharts/react-apexcharts |
| Icons | lucide-react, react-icons |
| Fonts | Montserrat (Google), GT Walsheim (local `/fonts/`) |

## Key paths

```
app/                    — routes (App Router)
components/
  ui/                   — shadcn primitives
  auths/                — auth-screen components
  cards/                — user/deal/directory cards
  chart/                — chart wrappers
  sidebars/             — slide-out panels
  modals/               — dialog components
  leads/                — leads feature
  messages/             — messaging feature
  referral/             — smart match feature
layouts/
  auth-layout.tsx       — wraps AuthLayoutTemplate
  app-layout.tsx        — wraps AppLayoutTemplate, tracks activity, shows renewal modal
context/
  AuthContext.tsx       — useAuth() hook, user + subscription state
hooks/                  — custom hooks (useAuth, useSmartMatch, etc.)
services/               — API service classes (smart-match, notifications)
types/index.d.ts        — User, Auth, SharedData, PageProps
middleware.ts           — session-cookie route guard (rename to proxy.ts for Next 16)
```

## Code style

- All pages: `'use client'` + `export const dynamic = 'force-dynamic'`
- NO `window`/`localStorage`/`document` in render path or `useState` initializers — only inside `useEffect`
- Pages using `useSearchParams`: wrap inner component in `<Suspense fallback={null}>` at default export
- Auth-protected pages use `AppLayout` wrapper; auth pages use `AuthLayout`
- Types defined inline per file (not imported from global) unless reused
- Tailwind only — no inline styles except dynamic background images
- `@/*` alias maps to repo root

## Restoring muted screens

Non-auth pages stubbed to `export default function Page() { return null }` on `ridwan/migrate`. Original in git.

```bash
git show main:app/<route>/page.tsx        # preview original
git checkout main -- app/<route>/page.tsx # restore
npx next build                            # verify before moving to next
```

Fix pattern after restore: move any `window`/`localStorage`/`document` call that runs at render time into `useEffect`.

Stubbed routes:
- app/dashboard/page.tsx
- app/referrals/page.tsx
- app/directory/page.tsx
- app/message/page.tsx
- app/message/single/page.tsx
- app/chats/page.tsx
- app/leads/page.tsx
- app/dealcard/page.tsx
- app/dealcard/view/page.tsx
- app/profile/page.tsx
- app/connected-users/page.tsx
- app/settings/profile/page.tsx
- app/settings/password/page.tsx
- app/settings/appearance/page.tsx
- app/settings/blocked-users/page.tsx
- app/settings/subscription/page.tsx
- app/payment/page.tsx
- app/subscription-required/page.tsx
- app/admin/activities/page.tsx
