import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireAuth);

/**
 * POST /usage-events
 * Ingest usage event (idempotent)
 */
router.post('/', async (req, res, next) => {
  try {
    const data = validators.ingestEventSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({
        error: { code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required' },
      });
    }

    const result = await service.ingestEvent(organizationId, data);

    res.status(result.wasCreated ? 201 : 200).json({
      data: result.event,
      meta: { wasCreated: result.wasCreated },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /usage-events
 * List usage events with filters
 */
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({
        error: { code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required' },
      });
    }

    const params = validators.listEventsQuerySchema.parse(req.query);
    const result = await service.listEvents(organizationId, params);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /usage-events/:id
 * Get single usage event
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.eventIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({
        error: { code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required' },
      });
    }

    const event = await service.getEventById(id, organizationId);
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
});

export default router;
