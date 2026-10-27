import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';
import { broadcast } from '../../lib/ws.js';

const router = Router();
router.use(requireAuth);
router.use(requireOrg);

router.post('/', async (req, res, next) => {
  try {
    const data = validators.ingestEventSchema.parse(req.body);
    const result = await service.ingestEvent(req.organizationId, data);

    // Broadcast to real-time feed
    if (result.wasCreated) {
      broadcast('usage_event', {
        id: result.event.id,
        customerId: result.event.customerId,
        meterId: result.event.meterId,
        quantity: result.event.quantity,
        eventAt: result.event.eventAt,
      }, req.organizationId);
    }

    res.status(result.wasCreated ? 201 : 200).json({
      data: result.event,
      meta: { wasCreated: result.wasCreated },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listEventsQuerySchema.parse(req.query);
    const result = await service.listEvents(req.organizationId, params);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.eventIdSchema.parse(req.params);
    const event = await service.getEventById(id, req.organizationId);
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
});

export default router;
