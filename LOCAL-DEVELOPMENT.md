# Local Development

1. Install Node.js 22+ and npm.
2. Copy `apps/api/.env.example` to `apps/api/.env` and insert your Neon pooled PostgreSQL `DATABASE_URL` plus strong JWT secrets.
3. Run `npm install` from repository root.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:migrate` to create the development schema in Neon (use a development branch/database, not production).
6. Run API: `npm run dev:api`.
7. Run web: `npm run dev:web`.
8. Run mobile when needed: `npm run dev:mobile`.

The initial API is intentionally only partially implemented. Scaffolded routes return 501 until their module is active in the build sequence.
