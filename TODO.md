# TODO — NOEL frontend (branch: ridwan/migrate)

## Auth screens — DONE ✓
- [x] /login — working
- [x] /register — fixed SSR crash (window/localStorage in useState initializers)
- [x] /forgot-password — working
- [x] /reset-password — working
- [x] /confirm-password — working
- [x] /verify-email — working
- [x] /auth-error — working

---

## Restore muted screens

> One at a time. Run `npx next build` after each restore before moving on.
> Restore: `git checkout main -- app/<route>/page.tsx`
> Fix pattern: move `window`/`localStorage`/`document` out of render path → into `useEffect`.

- [x] app/dashboard/page.tsx
- [x] app/referrals/page.tsx
- [x] app/directory/page.tsx
- [x] app/message/page.tsx
- [x] app/message/single/page.tsx — wrapper pattern (useAuth), SSR fix for window.location
- [x] app/chats/page.tsx — wrapper pattern (useAuth), SSR fix for window.location in useState
- [x] app/leads/page.tsx — SSR fix: window.location moved to useEffect
- [x] app/dealcard/page.tsx — wrapper pattern (useAuth)
- [x] app/dealcard/view/page.tsx — wrapper pattern (useAuth)
- [x] app/profile/page.tsx
- [x] app/connected-users/page.tsx
- [x] app/settings/profile/page.tsx
- [x] app/settings/password/page.tsx
- [x] app/settings/appearance/page.tsx
- [x] app/settings/blocked-users/page.tsx — default [] for blockedUsers prop
- [x] app/settings/subscription/page.tsx
- [x] app/payment/page.tsx
- [x] app/subscription-required/page.tsx
- [x] app/admin/activities/page.tsx

---

## Known issues / tech debt

- [ ] Rename `middleware.ts` → `proxy.ts` + `middleware` export → `proxy` (Next 16 deprecation)
- [ ] `recharts` renders with `width=-1`/`height=-1` during SSR in chart pages — wrap chart components with `ClientOnly` or dynamic import `ssr: false`
- [ ] `AuthErrorPage` receives `message`/`buttonText`/`buttonLink` as props but it's a page route — those props will always be undefined; needs rework to read from `searchParams`
- [ ] Settings pages (password, profile) use `AppLayout` but contain no subscription guard — confirm intentional
- [ ] `app-layout.tsx` renewal modal `onClose` is a no-op (intentional for expired subs — document why)

---

## Future screens (not yet built)
- [ ] /payment — stub only, needs Stripe flow wired
- [ ] /admin/activities — admin-only, needs role guard
