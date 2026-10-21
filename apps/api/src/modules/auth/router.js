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

// GET /auth/me — returns current user info including super-admin status
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { env } = await import('../../config/env.js');
    const prisma = (await import('../../lib/prisma.js')).default;

    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      select: { id: true, email: true, name: true, emailVerified: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });

    let isSuperAdmin = false;
    if (env.SUPER_ADMIN_EMAILS) {
      const superAdminEmails = new Set(
        env.SUPER_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
      );
      isSuperAdmin = superAdminEmails.has(user.email.toLowerCase());
    } else if (env.NODE_ENV !== 'production') {
      // Dev bypass: treat all users as super-admin when env var not set
      isSuperAdmin = true;
    }

    res.json({ data: { ...user, isSuperAdmin } });
  } catch (e) {
    next(e);
  }
});

export default router;
