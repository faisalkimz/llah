import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * POST /meters
 * Create a new meter
 */
router.post('/', async (req, res, next) => {
  try {
    const data = validators.createMeterSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const meter = await service.createMeter(organizationId, data);
    
    res.status(201).json({ data: meter });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /meters
 * List meters with pagination and search
 */
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const params = validators.listMetersQuerySchema.parse(req.query);
    const result = await service.listMeters(organizationId, params);
    
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /meters/:id
 * Get a specific meter by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const meter = await service.getMeterWithStats(id, organizationId);
    
    res.json({ data: meter });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /meters/:id
 * Update a meter
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    const data = validators.updateMeterSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const meter = await service.updateMeter(id, organizationId, data);
    
    res.json({ data: meter });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /meters/:id
 * Delete a meter
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    await service.deleteMeter(id, organizationId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
