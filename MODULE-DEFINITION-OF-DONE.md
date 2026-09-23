# Module Definition of Done

A module is done only when all applicable checks pass:
- schema/migration complete and reviewed
- authorization and tenant boundaries enforced
- Zod validation for request payloads/query params
- repository and service separation
- stable REST routes with consistent response envelopes
- frontend states: loading, empty, error, success, permission denied
- responsive Tailwind UI matching design rules
- mobile support where specified
- unit/integration tests for core rules and failures
- no TypeScript files introduced
- no TODO that hides critical behavior
- lint/test/build pass
- API/module README reflects implemented behavior
- security/privacy implications considered
