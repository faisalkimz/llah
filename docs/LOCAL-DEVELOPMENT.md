# Local Development

1. Install Node.js 22+ and npm.
2. Install PostgreSQL locally (or use Docker: `docker run -d --name llah-postgres -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=llah postgres:16`).
3. Copy `apps/api/.env.example` to `apps/api/.env` and set your local PostgreSQL `DATABASE_URL` plus strong JWT secrets.
4. Run `npm install` from repository root.
5. Run `npm run prisma:generate`.
6. Run `npx prisma db push --schema prisma/schema.prisma` to create the development schema locally.
7. Run API: `npm run dev:api`.
8. Run web: `npm run dev:web`.
9. Run mobile when needed: `npm run dev:mobile`.

The initial API is intentionally only partially implemented. Scaffolded routes return 501 until their module is active in the build sequence.
