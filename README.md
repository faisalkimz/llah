# Llah

Metered billing and revenue infrastructure for SaaS, API, AI, and cloud businesses.

## What it is

Llah handles the full billing lifecycle: usage metering, pricing, subscriptions, invoices, payments, credits, refunds, coupons, tax, revenue analytics, webhooks, notifications, and audit logging — all in one platform.

## Stack

| Layer | Tech |
|---|---|
| API | Node.js + Express (ESM) |
| Database | PostgreSQL via Prisma ORM |
| Web | React 19 + Vite + Tailwind CSS |
| Mobile | React Native + Expo (planned) |
| Validation | Zod |
| Tests | Vitest |
| Packages | npm workspaces |

## Project structure

```
llah/
├── apps/
│   ├── api/          # Express REST API (35 modules)
│   └── web/          # React dashboard
├── prisma/           # Schema + migrations
├── docs/             # Reference documentation
└── README.md
```

## Quick start

**Prerequisites:** Node 18+, PostgreSQL running locally.

```bash
# Install dependencies
npm install

# Set up the API environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database credentials

# Run migrations
cd apps/api
npx prisma migrate deploy --schema=../../prisma/schema.prisma

# Start both servers (run in separate terminals)
npm run dev -w @llah/api
npm run dev -w @llah/web
```

API runs on `http://localhost:4000`, web on `http://localhost:5173`.

## API modules

35 implemented modules across:

- **Auth** — register, login, sessions, email verification, password reset
- **Organizations** — multi-tenant, role-based membership (OWNER / ADMIN / BILLING / DEVELOPER / ANALYST / VIEWER)
- **Billing core** — customers, meters, usage events, usage aggregation, products, pricing, plans, subscriptions
- **Financial ops** — billing periods, ledger, invoices, payments, credits, adjustments, refunds, coupons, tax
- **Analytics** — revenue (MRR/ARR/churn), reports, alerts
- **Platform** — notifications, webhooks (inbound + outbound), audit log, event log, feature flags, settings, jobs, observability, developer tools, admin

See [`docs/API-CONVENTIONS.md`](docs/API-CONVENTIONS.md) for request/response shapes and auth patterns.

## Environment variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/llah
DIRECT_URL=postgresql://user:pass@localhost:5432/llah
JWT_ACCESS_SECRET=<32+ random chars>
JWT_REFRESH_SECRET=<32+ random chars>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30

# Optional — platform super-admin access for /admin routes
# SUPER_ADMIN_EMAILS=admin@yourcompany.com
```

```bash
# apps/web/.env
VITE_API_URL=http://localhost:4000/v1
```

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/API-CONVENTIONS.md`](docs/API-CONVENTIONS.md) | API request/response patterns, auth headers |
| [`docs/STACK-LOCK.md`](docs/STACK-LOCK.md) | Locked tech choices and why |
| [`docs/DESIGN-RULES.md`](docs/DESIGN-RULES.md) | UI/UX design system rules |
| [`docs/ENGINEERING-RULES.md`](docs/ENGINEERING-RULES.md) | Code standards and patterns |
| [`docs/PRODUCT-MAP.md`](docs/PRODUCT-MAP.md) | Full product feature map |
| [`docs/SECURITY-CHECKLIST.md`](docs/SECURITY-CHECKLIST.md) | Security requirements |
| [`docs/SETUP-GUIDE.md`](docs/SETUP-GUIDE.md) | Detailed setup instructions |
| [`docs/LOCAL-DEVELOPMENT.md`](docs/LOCAL-DEVELOPMENT.md) | Local dev workflow |

## Tests

```bash
npm test -w @llah/api   # 63 tests, all passing
```

Tests require a live PostgreSQL connection.

## License

[MIT](LICENSE) — open source, free to use, modify, and distribute.
