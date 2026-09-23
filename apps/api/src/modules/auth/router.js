import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} from './validators.js';
import * as service from './service.js';

const router = Router();

// Public routes
router.post('/register', async (req, res, next) => {
  try {
    const result = await service.register(registerSchema.parse(req.body));
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await service.login(loginSchema.parse(req.body));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const result = await service.refresh(refreshSchema.parse(req.body));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const result = await service.verifyEmail(verifyEmailSchema.parse(req.body));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const result = await service.requestPasswordReset(requestPasswordResetSchema.parse(req.body));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const result = await service.resetPassword(resetPasswordSchema.parse(req.body));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// Protected routes
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const { refreshToken } = logoutSchema.parse(req.body);
    const result = await service.logout(req.auth.sub, refreshToken);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.get('/sessions', requireAuth, async (req, res, next) => {
  try {
    const sessions = await service.getSessions(req.auth.sub);
    res.json({ data: sessions });
  } catch (e) {
    next(e);
  }
});

router.delete('/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await service.revokeSession(req.auth.sub, req.params.id);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post('/verify-email/request', requireAuth, async (req, res, next) => {
  try {
    const result = await service.requestEmailVerification(req.auth.sub);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

export default router;
