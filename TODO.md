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

- [ ] app/dashboard/page.tsx
- [ ] app/referrals/page.tsx
- [ ] app/directory/page.tsx
- [ ] app/message/page.tsx
- [ ] app/message/single/page.tsx
- [ ] app/chats/page.tsx
- [ ] app/leads/page.tsx
- [ ] app/dealcard/page.tsx
- [ ] app/dealcard/view/page.tsx
- [ ] app/profile/page.tsx
- [ ] app/connected-users/page.tsx
- [ ] app/settings/profile/page.tsx
- [ ] app/settings/password/page.tsx
- [ ] app/settings/appearance/page.tsx
- [ ] app/settings/blocked-users/page.tsx
- [ ] app/settings/subscription/page.tsx
- [ ] app/payment/page.tsx
- [ ] app/subscription-required/page.tsx
- [ ] app/admin/activities/page.tsx

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
