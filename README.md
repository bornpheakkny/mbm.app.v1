# mbm.app.v1 — Monthly Budget Management Web App

Frontend for the Monthly Budget Management System.
**Stack:** React 19 · TypeScript · Vite · React Router · Axios · Recharts · ESLint
**Hosting:** Vercel · **API:** [mbm.api.v1](../mbm.api.v1) on Render

## Features

- **Auth** — register / log in with JWT (stored in `localStorage`, sent as a Bearer token); protected routes; auto-logout on 401.
- **Dashboard** — total income, total expenses, left over, share of income spent; budget-vs-actual chart; 6-month trend; Income (Budgeted / Actual / Difference) and Expenses (Budgeted / Actual / Remaining) tables with usage bars.
- **Income & Expenses** — monthly list with search, category filter, totals; add / edit / delete in a modal ("Add another" for quick entry).
- **Budget plan** — set budgeted amounts per category for a month; planned left over; copy from last month.
- **Categories** — add, rename, recolor, archive, delete.
- **My account** — edit name and currency, change password, email verification status, two-step verification (authenticator app or email code, backup codes).
- **Account recovery** — verify-email link, "Forgot password?" → emailed reset link → choose a new password.
- **Two-step login** — after the password, enter the app / email code or a backup code.
- **User accounts** (admins only) — list, search and filter accounts; add users, edit details and role, enable / disable, reset password, delete. Every account has its own private budget.
- **Month picker** — shared by every page (‹ › or pick any month).
- Responsive down to phone width.

## Project structure

```
src/
  assets/       Images, icons, fonts (logo.svg)
  components/   Reusable UI: MonthPicker, ui/ (Alert, CategoryBadge, Empty, Modal, StatCard, UsageBar)
  pages/        Page-level components: Login, Register, Dashboard, Transactions (income + expenses),
                Budget, Categories, Account, Users (admin)
  layouts/      AppLayout (sidebar + top bar), AuthLayout (login / register card)
  hooks/        useAsync (load data, ignore stale responses, reload)
  context/      AuthContext, MonthContext
  services/     apiClient (axios, token, errors) + one service per API area (auth, categories,
                budgets, transactions, summary, admin)
  utils/        Money / date formatting, category color lookup
  constants/    API config, currencies, category colors, navigation items
  routes/       AppRoutes (route table), RouteGuards (Protected, Guest, Admin)
  styles/       index.css (CSS variables, no UI framework)
  types/        Shared TypeScript types for API data
  App.tsx       Root component (router + providers)
  main.tsx      Entry point
```

## Local development

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm start                # http://localhost:5173 (same as npm run dev)
```

Run the API locally first (see `mbm.api.v1`). Demo login after seeding: `demo@mbm.app` / `demo12345`.

Scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run preview`.

## Deploy to Vercel

1. Push this repo to GitHub as `mbm.app.v1`.
2. Vercel → **Add New → Project** → import the repo (framework: Vite, detected automatically).
3. Environment variable: `VITE_API_URL=https://<your-api>.onrender.com/api`
4. Deploy. `vercel.json` rewrites all paths to `index.html` so deep links like `/budget` work.
5. Add the Vercel URL to the API's `CORS_ORIGIN` on Render.
