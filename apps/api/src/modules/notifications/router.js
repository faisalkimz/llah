import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// Static routes before /:id
router.get('/unread-count', async (req, res, next) => {
  try {
    const userId = req.query.userId ?? null;
    const count = await service.getUnreadCount(req.organizationId, userId);
    res.json({ data: { count } });
  } catch (error) {
    next(error);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    const userId = req.query.userId ?? null;
    await service.markAllAsRead(req.organizationId, userId);
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filters = validators.listNotificationsQuerySchema.parse(req.query);
    const data = await service.listNotifications(req.organizationId, filters);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = validators.createNotificationSchema.parse(req.body);
    const data = await service.createNotification(req.organizationId, body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.notifIdSchema.parse(req.params);
    const data = await service.getNotification(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = validators.notifIdSchema.parse(req.params);
    const data = await service.markAsRead(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.notifIdSchema.parse(req.params);
    await service.deleteNotification(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
