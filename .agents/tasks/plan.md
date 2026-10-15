# Implementation Plan

## Phase 1 — Three Blockers

- [ ] 1. Create `apps/api/.env` with dev-safe defaults and add `DIRECT_URL` to the Zod env schema.

      The `.env.example` has no `DIRECT_URL`, but Prisma requires it for direct connections when using
      connection-pooled URLs (e.g. Neon/PgBouncer). The current `env.js` Zod schema does not declare
      it, so if Prisma ever reads it from the validated env the parse would fail.

      **Create** `apps/api/.env` with exactly these values:
      ```
      NODE_ENV=development
      PORT=4000
      WEB_URL=http://localhost:5173
      DATABASE_URL=postgresql://localhost:5432/llah_dev
      DIRECT_URL=postgresql://localhost:5432/llah_dev
      JWT_ACCESS_SECRET=dev_access_secret_change_in_production_aaaa
      JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production_bbbb
      ACCESS_TOKEN_TTL=15m
      REFRESH_TOKEN_TTL_DAYS=30
      ```
      (Both secrets are exactly 44 chars, satisfying `min(32)`.)

      **Modify** `apps/api/src/config/env.js` — add `DIRECT_URL: z.string().min(1).optional()` to the
      Zod schema (optional so the app still boots on Neon where it may come through prisma.config.ts
      rather than this file).

      **Create** `apps/web/.env.example`:
      ```
      VITE_API_URL=http://localhost:4000/v1
      ```

      Files: `apps/api/.env` (new), `apps/api/src/config/env.js`, `apps/web/.env.example` (new)
      Verify: `cd apps/api && node -e "import('./src/config/env.js').then(m=>console.log('env ok',m.env.PORT))"` — prints `env ok 4000`.

- [ ] 2. Fix the `requireOrgAccess` double-wrap bug in `apps/api/src/middleware/rbac.js`.

      The current code is:
      ```js
      export function requireOrgAccess(req, res, next) {
        return async (req, res, next) => { ... };
      }
      ```
      This is a function that *returns* an async middleware instead of being one. Express never calls
      the inner function, so the org check is silently skipped on every route that uses
      `requireOrgAccess`. The fix is to remove the outer wrapper so `requireOrgAccess` is a direct
      `async (req, res, next)` — matching the pattern already used by `requireRole` and
      `requireMinRole`.

      **Modify** `apps/api/src/middleware/rbac.js`:
      - Change `export function requireOrgAccess(req, res, next) { return async (req, res, next) => { … }; }`
        to `export async function requireOrgAccess(req, res, next) { … }` (promote the inner body).

      Files: `apps/api/src/middleware/rbac.js`
      Verify: `npm run test -w @llah/api` — all existing tests pass (or at minimum no new failures).

- [ ] 3. Remove MUI from `apps/web/package.json` (no source imports exist).

      Grep confirmed zero `@mui` imports in `apps/web/src`. The deps `@mui/material`, `@mui/icons-material`,
      `@emotion/react`, and `@emotion/styled` are dead weight (~4 MB of node_modules) that conflict with
      the project's Tailwind-only rule from AGENT-START-HERE.md.

      **Modify** `apps/web/package.json` — remove from `dependencies`:
      - `@mui/material`
      - `@mui/icons-material`
      - `@emotion/react`
      - `@emotion/styled`

      Then run `npm install` from the repo root to update `node_modules` and `package-lock.json`.

      Files: `apps/web/package.json`
      Verify: `npm run build -w @llah/web` — build completes without errors.

---

## Phase 2 — Dashboard

- [ ] 4. Replace `apps/web/src/pages/Dashboard.jsx` with a real, data-driven dashboard.

      ### Design decisions (grounded in codebase)

      **API calls to make** (all via `import { api } from '../lib/api'`; `api()` auto-injects
      `Authorization` and `x-organization-id` headers):
      | Widget | Endpoint | Query params |
      |---|---|---|
      | Active subscriptions count | `GET /subscriptions` | `status=ACTIVE&limit=1` → read `total` |
      | Recent invoices (last 5) | `GET /invoices` | `limit=5&offset=0` |
      | Recent customers (last 5) | `GET /customers` | `limit=5&offset=0` |
      | Usage aggregates summary | `GET /usage-aggregation` | `limit=5&offset=0` |

      Revenue (`/revenue`) returns 501 today — skip it; the dashboard will show a "coming soon" badge
      in that slot instead of calling a broken endpoint.

      **Layout** — four summary stat cards in a `grid grid-cols-2 gap-4 mb-6`, then two side-by-side
      `llah-card` sections (recent invoices table + recent customers table) in a `grid grid-cols-2 gap-4`.
      Matches the text-first, table-first approach from Customers.jsx/Subscriptions.jsx.

      **State pattern** — replicate exactly what Customers.jsx does:
      - `useState` for data, `loading`, `error`
      - `useEffect` reads `localStorage.getItem('current_organization_id')`; if none, shows a link to `/organizations`
      - individual async fetch functions per section, called in parallel with `Promise.all`
      - `import { api } from '../lib/api'` (not `useAuth().api`)

      **Stat card component** — inline, no new file needed:
      ```jsx
      function StatCard({ label, value, sub }) {
        return (
          <div className="llah-card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-semibold text-ink">{value}</div>
            {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
          </div>
        );
      }
      ```

      **Invoice status badge** — same inline badge pattern from Subscriptions.jsx:
      ```jsx
      const STATUS_STYLES = {
        DRAFT:  'bg-neutral-100 text-muted',
        OPEN:   'bg-blue-100 text-blue-700',
        PAID:   'bg-success/10 text-success',
        VOID:   'bg-neutral-100 text-muted',
        UNCOLLECTIBLE: 'bg-danger/10 text-danger',
      };
      ```

      **Loading / error / no-org states** — match Customers.jsx:
      - loading: `<div className="p-8 text-center text-muted">Loading dashboard...</div>`
      - error: `<div className="text-destructive mb-2">Error: {error}</div>` with retry button
      - no org: redirect prompt with `<Link to="/organizations" className="btn-primary">`

      **org guard** — check `organizationId` before any fetch; show the "select organization" prompt
      if missing. This matches Customers.jsx line-for-line in behavior.

      ### Exact component structure
      ```
      Dashboard
        └─ PageHeader title="Dashboard" description="Your billing activity at a glance"
        └─ (no org) → org prompt card
        └─ (loading) → centered loading text
        └─ (error) → error card with retry
        └─ grid grid-cols-2 gap-4 mb-6
            └─ StatCard "Active Subscriptions"
            └─ StatCard "Open Invoices"
            └─ StatCard "Total Customers"
            └─ StatCard "Revenue Analytics" value="—" sub="Coming soon"
        └─ grid grid-cols-2 gap-4
            └─ llah-card: "Recent Invoices" table (5 rows: #number, customer-id truncated, status badge, amount, date)
            └─ llah-card: "Recent Customers" table (5 rows: name, email, created date)
      ```

      **Amount formatting** — invoices store `totalAmountMinor` (integer cents). Display as
      `(totalAmountMinor / 100).toFixed(2)` with currency prefix. Never use floats for storage;
      only format at display time.

      Files: `apps/web/src/pages/Dashboard.jsx`
      Verify: `npm run build -w @llah/web` — build passes with no errors. Manually open
      `http://localhost:5173/dashboard` after starting `npm run dev:web`; confirm four stat cards
      render without console errors when an org is selected.
