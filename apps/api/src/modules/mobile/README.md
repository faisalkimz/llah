# Executive mobile app

This module is intentionally scaffolded but not falsely marked complete. Implement it only when its turn arrives in `BUILD-ORDER.md`.

The `/mobile` route is currently **unregistered** in `src/routes.js` (the router import and `apiRouter.use('/mobile', ...)` mount were removed) so clients receive a clean 404 instead of a misleading 501. The module files remain in place for future implementation (module 37). Do not re-register the route until the module is implemented.

Required structure: validation -> repository -> service -> route/controller -> authorization -> tests -> web/mobile integration.
