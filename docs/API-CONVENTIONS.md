# API conventions
- Prefix all public API routes with `/v1`.
- JSON success shape: `{ "data": ... }` and optional `meta` for pagination.
- Error shape: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`.
- Pagination uses stable cursors for large event/ledger lists when possible.
- All tenant resources are scoped by organization server-side; never trust an organization id from the client without membership validation.
- Public ingestion endpoints use API key authentication and idempotency keys.
- Payment/webhook endpoints verify provider signatures before parsing business actions.
