# Engineering Rules

1. Modular monolith first. Clear module boundaries, one deployable API.
2. Controllers/routes stay thin; business logic lives in services.
3. Data access lives in repositories or explicit query helpers.
4. Validate every external input with Zod.
5. Organization/workspace scoping is mandatory for tenant data.
6. RBAC checks must happen server-side.
7. No secrets in logs or API responses.
8. Idempotency for all externally retryable financial/event operations.
9. Ledger records are append-only; corrections are compensating entries.
10. Money is never represented with JS floating point.
11. Pagination on list endpoints.
12. Audit meaningful security and financial actions.
13. Build for observability: request id, logs, metrics hooks, health endpoints.
14. Fail safely and return consistent API errors.
15. Tests cover business rules, permissions and failure cases—not only happy paths.
