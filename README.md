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
- **Change email** — fix a mistyped address from the banner or My account; the new address is confirmed by link.
- **Account recovery** — verify-email link, "Forgot password?" → emailed reset link → choose a new password.
- **Two-step login** — after the password, enter the app / email code or a backup code.
- **User accounts** (admins only) — list, search and filter accounts; add users, edit details and role, enable / disable, reset password, delete. Every account has its own private budget.
- **Month picker** — shared by every page (‹ › or pick any month).
- Responsive down to phone width.

## Project structure

```
src/
  index.tsx / index.css / App.tsx  Entry, global style imports, root component (providers + router)
  api-config/        @api        api-service/api-configuration/api-client (axios) + api-request/<area>-request
  asset-config/      @asset      asset-services/asset-inventory/image/logo.svg
  component-config/  @component  component-service/<group>/<name>/{css,ts}
                                 groups: button, card, confirmation, fallback, header, info, input, modals
                                 (bigger ones split ts/main + ts/private, e.g. card/two-step-settings)
  context-config/    @context    context-services/context-provider/{auth,confirm,month,theme}-provider
  layout-config/     @layout     layout-services/{left-sidebar, header, outlet (app + auth), footer (bottom nav)}
  page-config/       @page       auth-services/authentication/<page>
                                 user-services/<feature>/<page>
                                 root-services/user/<page>   (root admin only)
                                 each page: css/main, ts/main (the page), ts/private (its parts)
  route-config/      @route      route-services/{route-configuration (routes), route-protect (guards)}
  style-config/                  style-service/{global-token, global-base, global-primitive}
  type-config/       @type       type-service/type/{type-model (shared types), type-global (vite-env.d.ts)}
  util-config/       @util       util-service/{util-constant, util-consumption (cx, variant, format, colors), util-hook}
```

Folders are `kebab-case`, files `PascalCase` (hooks `useX`). Each root has a path alias (see `tsconfig.app.json` / `vite.config.ts`), so imports look like `@component/input/select-field/ts/Select`.

**Class names:** every CSS class starts with **`pheakkornyMbm`**, then the component (file) name, then the part, in camelCase, so any class you see in DevTools tells you which file it lives in:

| Where | Example | File |
|---|---|---|
| Global primitives | `pheakkornyMbmBtn`, `pheakkornyMbmBtnPrimary`, `pheakkornyMbmCard`, `pheakkornyMbmCardHead` | `style-config/.../global-primitive/css/Primitives.css` |
| Component module | `pheakkornyMbmSelectTrigger`, `pheakkornyMbmModalFoot` | `component-config/.../select-field/css/Select.module.css` |
| Page module | `pheakkornyMbmBudgetPageSaveBar` | `page-config/.../budget-plan/css/main/BudgetPage.module.css` |

CSS Modules keep these names as written (`generateScopedName: '[local]'`), with no hash. In TSX use `styles.pheakkornyMbmSelectTrigger`, global classes as plain strings, `cx()` to combine, and `variant(styles, 'pheakkornyMbmAlert', tone)` to pick a class by prop value (`tone='error'` → `pheakkornyMbmAlertError`).

**Dropdowns:** use `<Select>` from `@component/input/select-field/ts/Select` instead of a native `<select>`. Native option lists can't be styled, so `Select` renders its own list (colored dots, icons, descriptions, keyboard support) and a bottom sheet on phones.

**Responsive layout:** fixed sidebar ≥1024px · slide-in drawer below that · bottom tab bar, stacked table cards and bottom-sheet dialogs on phones (≤640px). Icons come from [lucide-react](https://lucide.dev).

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
