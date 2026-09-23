import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const data = validators.createPriceSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'}});
    }

    const price = await service.createPrice(organizationId, data);
    res.status(201).json({data: price});
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'}});
    }

    const params = validators.listPricesQuerySchema.parse(req.query);
    const result = await service.listPrices(organizationId, params);
    res.json({data: result});
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'}});
    }

    const price = await service.getPriceById(id, organizationId);
    res.json({data: price});
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    const data = validators.updatePriceSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'}});
    }

    const price = await service.updatePrice(id, organizationId, data);
    res.json({data: price});
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'}});
    }

    await service.deletePrice(id, organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
