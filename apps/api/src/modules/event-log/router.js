import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// GET /stats must be before /:id
router.get('/stats', async (req, res, next) => {
  try {
    const params = validators.eventStatsQuerySchema.parse(req.query);
    const stats = await service.getEventStats(req.organizationId, params);
    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listEventsQuerySchema.parse(req.query);
    const events = await service.listEvents(req.organizationId, params);
    res.json({ data: events });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.eventIdSchema.parse(req.params);
    const event = await service.getEvent(id, req.organizationId);
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = validators.logEventSchema.parse(req.body);
    const event = await service.logEvent(req.organizationId, req.user?.id, data);
    res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
});

export default router;
