# AGENT START HERE — LLAH

You are acting as a senior software engineer on Llah.

## 1. Read before changing code
Read these files in order:
1. README.md
2. STACK-LOCK.md
3. DESIGN-RULES.md
4. ENGINEERING-RULES.md
5. BUILD-ORDER.md
6. PRODUCT-MAP.md
7. prisma/schema.prisma
8. apps/api/src/modules/*/README.md for the module you are implementing

## 2. Absolute technology rules
- JavaScript only. Do not add TypeScript.
- Never create `.ts` or `.tsx` files.
- Web uses React + Vite + Tailwind CSS.
- API uses Express on Node.js.
- Database is Neon PostgreSQL through Prisma.
- Mobile uses Expo React Native + NativeWind.
- Do not replace Tailwind with Material UI, Chakra, Ant, Bootstrap or a generated component system.
- Small focused libraries are acceptable when they solve a real need.

## 3. Development rule: one module at a time
Do NOT attempt to implement the whole platform in one pass.
The full product structure is already mapped so later modules have stable places to live.
Implement only the current module in `BUILD-ORDER.md`.

For every module:
1. inspect dependencies from earlier modules;
2. define/adjust Prisma models and migration;
3. implement repository/data access;
4. implement service/business logic;
5. implement validators;
6. implement Express routes/controllers;
7. add authorization checks;
8. add frontend API client and screens;
9. add mobile surface only when the module requires it;
10. add tests;
11. run lint/test/build;
12. update module README with what became real;
13. stop. Do not continue to the next module unless explicitly instructed.

## 4. UI rule
Llah must NOT look AI-generated.
Keep screens calm, text-first, compact and predictable. Use spacing, typography, borders, tables and information hierarchy rather than visual effects. Avoid gradients, glows, glass, excessive shadows, oversized hero cards and random colors.

## 5. Financial correctness
Usage, ledger, invoice, credit, refund and payment code requires deterministic arithmetic, idempotency and auditable history. Never use floating point arithmetic for money. Store money in integer minor units or Prisma Decimal where appropriate. Ledger history is append-only.

## 6. No fake completion
A module is not complete because routes/screens exist. It is complete only when the acceptance gate in its README and `MODULE-DEFINITION-OF-DONE.md` passes.
