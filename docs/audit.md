# BASE 23 — NOEL Frontend Codebase Audit

**Date:** 2026-06-03  
**Audited by:** Claude Code (claude-sonnet-4-6)  
**Scope:** Full frontend audit covering user roles, API integrations, and folder structure

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Types — Company vs Agent](#2-user-types--company-vs-agent)
3. [Authentication System](#3-authentication-system)
4. [API Integrations](#4-api-integrations)
5. [Page Implementation Status](#5-page-implementation-status)
6. [Folder Structure](#6-folder-structure)
7. [Component Inventory](#7-component-inventory)
8. [Services & Hooks Layer](#8-services--hooks-layer)
9. [Critical Gaps & Action Items](#9-critical-gaps--action-items)

---

## 1. Executive Summary

BASE 23 is a Next.js 16 (App Router) frontend for a business referral network called **NOEL**. The UI and component architecture are well-built and visually polished. However, the **core functional systems — authentication, user roles, and API connections — are either stubbed, hardcoded, or non-functional**.

### Status at a Glance

| System | Status |
|---|---|
| UI / Design | ✅ Implemented (polished, responsive) |
| Company vs Agent roles | ❌ Not implemented |
| Login (API call) | ❌ Stubbed — no real API call |
| AuthContext (real user) | ❌ Hardcoded guest user |
| Route protection / middleware | ❌ No-op passthrough |
| Registration flow | ⚠️ Partial — Step 2 missing |
| Smart Match (FastAPI) | ⚠️ Wired up, depends on port 3100 running |
| Notifications (Laravel) | ⚠️ Wired up, fails if backend is down |
| Messaging (Laravel) | ⚠️ Wired up, fails if backend is down |
| Connections / Directory | ⚠️ Wired up, fails if backend is down |
| Profile / Settings pages | ❌ All stubbed (`return null`) |
| Payment / Subscription pages | ❌ All stubbed (`return null`) |

---

## 2. User Types — Company vs Agent

### What the Landing Page Promises

`app/page.tsx` presents two user personas on the landing screen:

| Option | Label | Description | Route |
|---|---|---|---|
| Company | "I'm Hiring" | Find verified sales agents, post opportunities | `/register` |
| Agent | "I'm a Sales Agent" | List experience, get verified, find companies | `/register` |

**Both buttons link to the exact same `/register` route with no query param, state, or any differentiation passed forward.**

### What the User Model Contains

**`types/index.d.ts`** — the canonical `User` interface:

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  company_name?: string;
  company_description?: string;
  industry?: string;
  phone?: string;
  linkedin?: string;
  country?: string;
  position?: string;
  years_of_operation?: string;
  number_of_employees?: string;
  selected_outcome?: string;
  goals?: string;
  categories?: string;
  great_at?: string[];
  can_help_with?: string[];
  email_verified_at: string | null;
  is_admin?: boolean;            // ← only role-like field
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
```

**There is no `account_type`, `user_type`, `role`, or `is_company` / `is_agent` field** in the user model.

### What is Actually Implemented

| Checkpoint | Status | Detail |
|---|---|---|
| Landing page choice UI | ✅ | Company / Agent cards visible |
| Choice persisted to registration | ❌ | Both link to same `/register`, no param |
| `role` or `user_type` field in User model | ❌ | Only `is_admin?: boolean` exists |
| `is_admin` field used anywhere | ❌ | Defined in type, never read in any component |
| Role-specific navigation | ❌ | Same sidebar, same nav items for all users |
| Role-specific page views | ❌ | No conditional rendering per role anywhere |
| Role-specific API calls | ❌ | All API calls are role-agnostic |
| Role-specific onboarding | ❌ | Single onboarding flow for all users |

### What Needs to Be Built

To properly distinguish Company vs Agent users, the following needs to be designed and implemented end-to-end:

1. **User model**: Add `account_type: 'company' | 'agent'` (or equivalent) on both the backend Laravel model and the frontend `User` interface in `types/index.d.ts`.
2. **Registration**: Pass the user's choice from the landing page through to `/register` (e.g., `?type=company` or `?type=agent`) and include it in the registration form submission payload.
3. **AuthContext**: After fetching the real user, expose the `account_type` so any component can read `user.account_type`.
4. **Navigation / sidebar**: Add conditional rendering in `components/app-sidebar.tsx` so different nav items show for company vs agent.
5. **Pages**: Build company-specific and agent-specific page variants where the two types need different views (e.g., leads, deal cards, directory).

---

## 3. Authentication System

### Login — `app/login/page.tsx`

**Current implementation:**

```typescript
const submit = (e: React.FormEvent) => {
  e.preventDefault();
  // validates email format and password presence...
  router.push("/dashboard");   // ← just redirects, no API call
};
```

The login form **performs client-side validation only and then hard-redirects to `/dashboard`**. No `axios.post('/login')` call is made. No session cookie is set. No credentials are checked.

### AuthContext — `context/AuthContext.tsx`

```typescript
const guestUser: User = {
  id: 0,
  name: "Guest User",
  email: "guest@example.com",
  email_verified_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user] = useState<User | null>(guestUser);   // ← hardcoded
  const [subscription] = useState(null);
  return (
    <AuthContext.Provider value={{ user, subscription, loading: false, refresh: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Every component that calls `useAuth()` receives this hardcoded guest user.** No `/api/me` call is made. This is why:
- User name always shows "Guest User"
- `auth.user?.id` is always `0`
- Smart match API receives `userId = 0`, causing errors on the backend
- Subscription is always `null`
- The renewal modal logic in `app-layout.tsx` can never show a real subscription

### Middleware — `middleware.ts`

```typescript
export function middleware() {
  return NextResponse.next();   // ← passthrough, no protection
}
```

**No route protection exists.** Every page is accessible to unauthenticated users. The comment in `CLAUDE.md` that says "middleware.ts guards protected routes" is aspirational, not actual.

### Password Reset — Status: ✅ Implemented

All password reset screens make real API calls:

| Page | API Call | Status |
|---|---|---|
| `/forgot-password` | `POST /forgot-password` | ✅ Real call |
| `/reset-password` | `POST /reset-password` | ✅ Real call |
| `/confirm-password` | `POST /confirm-password` | ✅ Real call |
| `/verify-email` | `POST /email/verification-notification` | ✅ Real call |

### Registration — `app/register/page.tsx`

A multi-step form with the following structure:

| Step | Component | Fields | Status |
|---|---|---|---|
| Step 1 | `StepOneForm.tsx` | name, email, password, password_confirmation | ✅ Implemented |
| Step 2 | `StepThreeForm.tsx` | great_at (3 tags), can_help_with (3 tags), industry | ✅ Implemented |

**Missing:** The form is named `StepThreeForm` which implies a `StepTwoForm` was planned but never built. Based on the user model fields, Step 2 was likely meant to collect company-specific data (`company_name`, `company_description`, `number_of_employees`, `years_of_operation`) for Company users.

The final registration submission does make a real API call via `networkValidation.ts` service.

### HTTP Client — `lib/axios-config.ts`

```typescript
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

CSRF token is fetched from `/sanctum/csrf-cookie` before any POST/PUT/PATCH/DELETE request. This is correct for Laravel Sanctum session-based auth. **But this only works if the user has an actual session**, which they never do because login is stubbed.

---

## 4. API Integrations

### Backend Architecture

There are **two separate backends**:

| Backend | URL | Purpose |
|---|---|---|
| Laravel | `http://localhost:8000` (default) | Auth, users, connections, messages, notifications, payments |
| FastAPI (Python) | `http://127.0.0.1:3100` | Smart matching algorithm |

The FastAPI backend is **not proxied through Next.js**. Calls go direct to `127.0.0.1:3100`. The Laravel backend is proxied via `next.config.ts` rewrites.

### Why All APIs Are Returning 500 / ECONNREFUSED

There are two root causes:

1. **Backend not running** — `ECONNREFUSED` errors on ports 8000 and 3100 mean the Laravel and/or FastAPI servers are not started.
2. **AuthContext sends `userId = 0`** — Because `AuthContext` is hardcoded to a guest user with `id: 0`, every call to the smart match API includes `userId: 0`. The FastAPI backend likely rejects or errors on invalid user IDs. The notification and activity tracker also send requests as an unauthenticated user, which Laravel rejects with a 500 (since there's no valid session).

### Proxy Rewrites — `next.config.ts`

All Laravel routes are proxied through Next.js:

```
/api/*                         → {API_URL}/api/*
/login                         → {API_URL}/login
/logout                        → {API_URL}/logout
/register                      → {API_URL}/register
/forgot-password               → {API_URL}/forgot-password
/reset-password                → {API_URL}/reset-password
/confirm-password              → {API_URL}/confirm-password
/profile/*                     → {API_URL}/profile/*
/email/*                       → {API_URL}/email/*
/connections/*                 → {API_URL}/connections/*
/messages/*                    → {API_URL}/messages/*
/saved-users/*                 → {API_URL}/saved-users/*
/users/*                       → {API_URL}/users/*
/payment/*                     → {API_URL}/payment/*
/sanctum/*                     → {API_URL}/sanctum/*
```

**Environment variable:** Only one is used — `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`). No `.env.example` file exists in the repo.

### API Call Inventory — By Feature

#### Authentication
| Endpoint | Method | File | Status |
|---|---|---|---|
| `/login` | POST | `app/login/page.tsx` | ❌ Never called |
| `/logout` | POST | `components/app-sidebar.tsx` | ✅ Called on logout confirm |
| `/register` | POST | `services/networkValidation.ts` | ✅ Called |
| `/forgot-password` | POST | `app/forgot-password/page.tsx` | ✅ Called |
| `/reset-password` | POST | `app/reset-password/page.tsx` | ✅ Called |
| `/confirm-password` | POST | `app/confirm-password/page.tsx` | ✅ Called |
| `/email/verification-notification` | POST | `app/verify-email/page.tsx` | ✅ Called |
| `/api/me` | GET | Intended for `AuthContext` | ❌ Never called |

#### Smart Match (FastAPI — `http://127.0.0.1:3100`)
| Endpoint | Method | Service method | Status |
|---|---|---|---|
| `/api/smart-match/matches/{userId}` | GET | `getMatches()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/preferences/{userId}` | GET | `getPreferences()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/preferences/{userId}` | POST | `savePreference()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/preferences/{userId}/all` | POST | `saveAllPreferences()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/preferences/{userId}` | DELETE | `clearPreferences()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/match/{userId}` | POST | `matchWithUser()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/compatibility` | POST | `getCompatibility()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/recent-network/{userId}` | GET | `getRecentNetwork()` | ⚠️ Requires FastAPI running |
| `/api/smart-match/send` | POST | `sendSmartMatch()` | ⚠️ Requires FastAPI running |

**Note:** All smart match calls pass `userId` which will be `0` until AuthContext is fixed.

#### Notifications (Laravel)
| Endpoint | Method | Service method | Status |
|---|---|---|---|
| `/api/notifications` | GET | `getNotifications()` | ⚠️ Requires backend + auth |
| `/api/notifications/grouped` | GET | `getGroupedNotifications()` | ⚠️ Requires backend + auth |
| `/api/notifications/unread-count` | GET | `getUnreadCount()` | ⚠️ Requires backend + auth |
| `/api/notifications/stats` | GET | `getStats()` | ⚠️ Requires backend + auth |
| `/api/notifications/{id}/read` | POST | `markAsRead()` | ⚠️ Requires backend + auth |
| `/api/notifications/mark-multiple-read` | POST | `markMultipleAsRead()` | ⚠️ Requires backend + auth |
| `/api/notifications/mark-all-read` | POST | `markAllAsRead()` | ⚠️ Requires backend + auth |
| `/api/notifications/{id}` | DELETE | `deleteNotification()` | ⚠️ Requires backend + auth |
| `/api/notifications/clear-all` | DELETE | `clearAll()` | ⚠️ Requires backend + auth |

Also uses **Laravel Echo WebSocket** on `user.{userId}.notifications` channel (real-time). Echo setup is referenced in `hooks/useNotifications.ts` but `window.Echo` is never initialized anywhere in the frontend — it would need to be set up via a `laravel-echo` + `pusher-js` configuration.

#### Messaging (Laravel)
| Endpoint | Method | File | Status |
|---|---|---|---|
| `/messages/start` | POST | `app/message/page.tsx` | ⚠️ Requires backend + auth |
| `/api/active-conversations` | GET | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}` | GET | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}/messages` | POST | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}/mark-read` | POST | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}/messages/{msgId}` | PATCH | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}/messages/{msgId}` | DELETE | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/messages/{id}` | DELETE | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/api/search/conversations` | GET | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/api/search/messages/{id}` | GET | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |
| `/api/connections/list` | GET | `app/message/single/page.tsx` | ⚠️ Requires backend + auth |

#### Connections & Directory (Laravel)
| Endpoint | Method | File | Status |
|---|---|---|---|
| `/connections/send` | POST | `app/directory/page.tsx` | ⚠️ Requires backend + auth |
| `/api/search/users` | POST | `app/directory/page.tsx` | ⚠️ Requires backend + auth |
| `/saved-users/save` | POST | `app/directory/page.tsx` | ⚠️ Requires backend + auth |
| `/saved-users/remove` | POST | `app/directory/page.tsx` | ⚠️ Requires backend + auth |

#### Activity Tracking (Laravel)
| Endpoint | Method | File | Status |
|---|---|---|---|
| `/api/user-activity` | POST | `hooks/useUserActivityTracker.ts` | ❌ Returns 500 (no auth session) |

#### User Profile (Laravel)
| Endpoint | Method | Notes | Status |
|---|---|---|---|
| `/api/user/{id}` | GET | `components/chart/BasicAreaChart.tsx` | ⚠️ Requires backend + auth |
| `/api/user` | GET | Fallback for own user chart | ⚠️ Requires backend + auth |

---

## 5. Page Implementation Status

### Implemented Pages

| Route | Lines | Description |
|---|---|---|
| `/` | 125 | Landing page — Company / Agent choice |
| `/login` | 174 | Login form (UI only, no API call) |
| `/register` | 219 | 2-step registration (API call via networkValidation) |
| `/verify-email` | 100 | Email verification resend |
| `/forgot-password` | 117 | Forgot password form |
| `/reset-password` | 142 | Reset password with token |
| `/confirm-password` | 89 | Confirm password (secure area gate) |
| `/auth-error` | 35 | Auth error display |
| `/dashboard` | 950 | Main dashboard with charts, matches, tabs |
| `/referrals` | 354 | Smart match slider + preference setup |
| `/directory` | 1254 | User directory + search + connections |
| `/message` | 886 | Conversations list |
| `/message/single` | 6847 | Full real-time chat thread |

### Stubbed Pages (return null)

These files exist but contain only `export default function Page() { return null }`:

| Route | Original content on `main` branch |
|---|---|
| `/profile` | Full profile page |
| `/chats` | Chat list |
| `/leads` | Leads management |
| `/dealcard` | Deal card creation |
| `/dealcard/view` | Deal card view |
| `/connected-users` | Connected users list |
| `/settings/profile` | Profile settings |
| `/settings/password` | Password settings |
| `/settings/appearance` | Appearance settings |
| `/settings/blocked-users` | Blocked users |
| `/settings/subscription` | Subscription management |
| `/payment` | Payment flow |
| `/subscription-required` | Subscription gate |
| `/admin/activities` | Admin activity log |

**Restoring any stubbed page:** `git checkout main -- app/<route>/page.tsx`

---

## 6. Folder Structure

```
base23/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout (AuthProvider)
│   ├── page.tsx                   # Landing page
│   ├── login/
│   │   └── page.tsx               # Login (UI only)
│   ├── register/
│   │   ├── page.tsx               # Multi-step registration
│   │   └── stepForms/
│   │       ├── StepOneForm.tsx    # Account info
│   │       └── StepThreeForm.tsx  # Skills / industry
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard (950 lines)
│   ├── referrals/
│   │   └── page.tsx               # Smart match view (354 lines)
│   ├── directory/
│   │   └── page.tsx               # User directory (1254 lines)
│   ├── message/
│   │   ├── page.tsx               # Conversations list (886 lines)
│   │   └── single/
│   │       └── page.tsx           # Chat thread (6847 lines)
│   ├── leads/page.tsx             # STUBBED
│   ├── profile/page.tsx           # STUBBED
│   ├── chats/page.tsx             # STUBBED
│   ├── dealcard/page.tsx          # STUBBED
│   │   └── view/page.tsx          # STUBBED
│   ├── connected-users/page.tsx   # STUBBED
│   ├── settings/
│   │   ├── profile/page.tsx       # STUBBED
│   │   ├── password/page.tsx      # STUBBED
│   │   ├── appearance/page.tsx    # STUBBED
│   │   ├── blocked-users/page.tsx # STUBBED
│   │   └── subscription/page.tsx  # STUBBED
│   ├── payment/page.tsx           # STUBBED
│   ├── subscription-required/page.tsx  # STUBBED
│   ├── admin/activities/page.tsx  # STUBBED
│   ├── verify-email/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── confirm-password/page.tsx
│   └── auth-error/page.tsx
│
├── components/
│   ├── ui/                        # shadcn/Radix UI primitives (20+ files)
│   │   ├── button.tsx, card.tsx, dialog.tsx, dropdown-menu.tsx
│   │   ├── input.tsx, label.tsx, select.tsx, tabs.tsx, tooltip.tsx
│   │   ├── sidebar.tsx, navigation-menu.tsx, avatar.tsx, badge.tsx
│   │   ├── logout-confirmation-modal.tsx
│   │   ├── notification-card.tsx
│   │   └── smart-match-preview-popup.tsx
│   ├── auths/                     # Auth screen layout components (5 files)
│   ├── cards/
│   │   ├── UserCard.tsx
│   │   ├── messages/              # 6 message card components
│   │   └── directory/             # 6 directory-related components
│   ├── chart/
│   │   ├── BasicAreaChart.tsx     # ApexCharts area chart (activity)
│   │   ├── ActivityBarChart.tsx   # Visx bar chart
│   │   └── ActivityChartCard.tsx  # Mobile chart card wrapper
│   ├── sidebars/
│   │   ├── dashbord-filter.tsx    # Dashboard filter panel
│   │   └── user-show-sidebar.tsx  # User profile slide-out
│   ├── modals/
│   │   ├── dashboard-steps-modal.tsx  # Onboarding steps
│   │   └── (other modals)
│   ├── referral/
│   │   ├── desktop-smatch-slider.tsx  # Main smart match card slider
│   │   ├── profile-history-graph.tsx  # Recharts matching history
│   │   ├── referral-smart-matches.tsx # Smart match preview block
│   │   ├── referral-smart-matches-card.tsx
│   │   ├── referral-tutorial.tsx
│   │   └── (3 more referral components)
│   ├── leads/
│   │   ├── leads-mobile-sidebar.tsx
│   │   └── leads-sidebar.tsx
│   ├── app-sidebar.tsx            # Main navigation sidebar (630 lines)
│   ├── app-shell.tsx              # SidebarProvider wrapper
│   ├── app-content.tsx            # Main content <main> wrapper
│   ├── OnboardingContext.tsx
│   ├── OnboardingActivator.tsx
│   ├── DealCardPopup.tsx
│   └── sidebar-context.tsx
│
├── context/
│   └── AuthContext.tsx            # useAuth hook — HARDCODED guest user
│
├── hooks/
│   ├── useSmartMatch.ts           # Smart match data + mutations (289 lines)
│   ├── useNotifications.ts        # Notification data + WebSocket (244 lines)
│   ├── useUserActivityTracker.ts  # Periodic activity ping
│   ├── useCounter.tsx             # Animated counter
│   ├── use-mobile.tsx             # Viewport detection
│   ├── use-toast.tsx              # Toast wrapper
│   ├── use-initials.tsx           # Avatar initials helper
│   ├── use-mobile-navigation.ts
│   └── use-click-outside-toggle.tsx
│
├── layouts/
│   ├── app-layout.tsx             # Wraps AppLayoutTemplate + activity + renewal
│   ├── auth-layout.tsx            # Wraps AuthLayoutTemplate
│   └── app/
│       └── app-sidebar-layout.tsx # AppLayoutTemplate (OnboardingProvider + AppShell)
│   └── auth/
│       ├── auth-simple-layout.tsx
│       ├── auth-card-layout.tsx
│       └── auth-split-layout.tsx
│
├── services/
│   ├── smart-match-service.ts     # FastAPI client (295 lines)
│   ├── notification-service.ts    # Laravel notifications client (306 lines)
│   ├── networkValidation.ts       # Registration + retry logic (396 lines)
│   └── smart-match-api.ts         # Stub (1 line)
│
├── lib/
│   ├── axios-config.ts            # Axios defaults + CSRF interceptor
│   ├── utils.ts                   # cn() Tailwind merge helper
│   └── stripe-errors.ts           # Stripe error messages
│
├── types/
│   ├── index.d.ts                 # User, Auth, SharedData, PageProps (71 lines)
│   ├── smart-match.ts             # Preferences, Match, Response types (265 lines)
│   └── css-modules.d.ts
│
├── constants/
│   ├── dummy-data.ts              # 50 dummy match records (fallback data)
│   ├── formSchema.ts              # Zod schemas for registration
│   ├── industries.ts              # Industry list
│   └── image.ts                  # All image path constants (~200 entries)
│
├── utils/
│   ├── csrf.ts                    # CSRF token helpers
│   ├── chatDebug.ts
│   ├── companyDescriptionTemplates.ts
│   ├── format-character.ts
│   ├── imageOptimizer.ts
│   ├── messageFormatter.tsx
│   └── notifications.ts
│
├── dummyDatas/
│   ├── connection.ts
│   ├── leads.ts
│   ├── messageDummy.ts
│   └── users.ts
│
├── docs/
│   └── audit.md                   # This file
│
├── public/assets/                 # All image assets
├── fonts/                         # GT Walsheim local font files
├── middleware.ts                  # NO-OP passthrough (no route protection)
├── next.config.ts                 # Proxy rewrites to Laravel backend
├── tailwind.config.ts             # Tailwind v4 configuration
└── CLAUDE.md / AGENTS.md          # Developer instructions
```

---

## 7. Component Inventory

### Smart Match / Referrals

| Component | Purpose | Used In |
|---|---|---|
| `desktop-smatch-slider.tsx` | Card-stack drag slider | `/dashboard`, `/referrals` |
| `profile-history-graph.tsx` | Recharts matching history | `/referrals` |
| `referral-smart-matches.tsx` | Smart match stats block | `/referrals` |
| `referral-tutorial.tsx` | Onboarding guide overlay | `/referrals` |
| `smart-match-preview-popup.tsx` | Compatibility detail popup | Slider |

### Charts

| Component | Library | Purpose |
|---|---|---|
| `BasicAreaChart.tsx` | ApexCharts | Activity over time (profile card) |
| `ActivityBarChart.tsx` | Visx (`@visx/group`, `@visx/scale`) | Weekly activity bars |
| `ActivityChartCard.tsx` | Wraps ActivityBarChart | Mobile chart with range selector |

### Navigation & Layout

| Component | Purpose |
|---|---|
| `app-sidebar.tsx` | Desktop sidebar + mobile top bar + mobile drawer |
| `app-shell.tsx` | `SidebarProvider` context wrapper |
| `app-content.tsx` | `<main>` wrapper with flex layout |
| `app-layout.tsx` | Activity tracking + subscription renewal modal |

### Modals

| Component | Purpose |
|---|---|
| `dashboard-steps-modal.tsx` | Onboarding step checklist |
| `logout-confirmation-modal.tsx` | Confirm logout dialog |
| `DealCardPopup.tsx` | Received deal card notification popup |
| `notification-card.tsx` | Notification panel slide-out |

---

## 8. Services & Hooks Layer

### Smart Match Service — `services/smart-match-service.ts`

Connects to a **separate Python FastAPI backend** at `http://127.0.0.1:3100`.

Key methods:
- `getMatches(userId)` — fetch AI-ranked matches
- `matchWithUser(userId, targetId)` — send match request
- `saveAllPreferences(userId, prefs)` — save matching preferences
- `sendSmartMatch(data)` — notify a matched user (sends through Laravel `/api/smart-match/send`)

The service reads the user ID from DOM `data-user-id` attributes or meta tags as a fallback when the React context `userId` is not passed correctly.

### Notification Service — `services/notification-service.ts`

Connects to Laravel via the standard proxied `/api/notifications` routes. Fully implemented with CRUD operations for notifications.

**WebSocket**: `hooks/useNotifications.ts` references `window.Echo.private('user.{userId}.notifications')` for real-time updates. However, `window.Echo` (Laravel Echo) **is never initialized** in the app. You would need to install `laravel-echo` + `pusher-js` and initialize Echo in a provider or layout component.

### Network Validation — `services/networkValidation.ts`

Used only in the registration flow. Provides retry logic with exponential backoff for unreliable connections. Wraps the final registration `POST /register` call.

---

## 9. Critical Gaps & Action Items

The following items need to be addressed before the application can function end-to-end.

### Priority 1 — Authentication (Blocking Everything Else)

These three changes together will make all API calls work:

1. **Fix `app/login/page.tsx`** — replace the `router.push('/dashboard')` stub with a real `axios.post('/login', { email, password })` call. On success, set the session (Laravel Sanctum handles this via cookie) and then redirect.

2. **Fix `context/AuthContext.tsx`** — replace the hardcoded `guestUser` with a real `GET /api/me` call inside `useEffect`. This will populate the user across all components. The `refresh()` function should also call `/api/me`.

3. **Fix `middleware.ts`** — add actual route protection. Check for the `laravel_session` cookie; if absent on a protected route, redirect to `/login`.

### Priority 2 — User Roles (Company vs Agent)

4. **Backend**: Add `account_type` (or `role`) column to the users table in Laravel. Return it in the `/api/me` response.

5. **`types/index.d.ts`**: Add `account_type: 'company' | 'agent'` to the `User` interface.

6. **`app/page.tsx`**: Pass the user's choice forward to `/register?type=company` or `/register?type=agent`.

7. **`app/register/page.tsx`**: Read the `type` query param and include it in the registration payload. Add the missing Step 2 form for company details (branch on `type === 'company'` to show company fields).

8. **`components/app-sidebar.tsx`**: Read `user.account_type` from `useAuth()` and conditionally show/hide nav items (e.g., agents might not see a "Post a Job" link; companies might not see "My Applications").

### Priority 3 — Smart Match Backend

9. **FastAPI**: Ensure the service at `http://127.0.0.1:3100` is running when developing. After Priority 1 is done, `userId` will be a real value and smart match calls will work.

10. **`smart-match-service.ts`**: The direct `http://127.0.0.1:3100` URL should be environment-configurable. Add `NEXT_PUBLIC_SMART_MATCH_URL` to env and update the service.

### Priority 4 — Real-time (WebSocket)

11. **Initialize Laravel Echo**: Install `laravel-echo` and `pusher-js`. Create an `EchoProvider` component that initializes `window.Echo` with the Pusher credentials. Wrap the app in it (or initialize in `app/layout.tsx`). Until this is done, real-time notifications will never fire.

### Priority 5 — Restore Stubbed Pages

12. **Restore in order**: `profile` → `settings/profile` → `settings/subscription` → `payment` → `leads` → `dealcard`. Use:
    ```bash
    git checkout main -- app/<route>/page.tsx
    ```
    Then fix any `window`/`localStorage` usage in render paths (move to `useEffect`).

### Priority 6 — Environment

13. **Create `.env.local`** with at minimum:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_SMART_MATCH_URL=http://127.0.0.1:3100
    ```
    Add an `.env.example` to the repo so other developers know what variables are required.

---

*End of audit. All file paths are relative to `/Users/elijahobominuru/Desktop/stuff/base23/`.*
