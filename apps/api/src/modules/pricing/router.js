import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res, next) => {
  try {
    const data = validators.createPriceSchema.parse(req.body);
    const price = await service.createPrice(req.organizationId, data);
    res.status(201).json({data: price});
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listPricesQuerySchema.parse(req.query);
    const result = await service.listPrices(req.organizationId, params);
    res.json({data: result});
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    const price = await service.getPriceById(id, req.organizationId);
    res.json({data: price});
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    const data = validators.updatePriceSchema.parse(req.body);
    const price = await service.updatePrice(id, req.organizationId, data);
    res.json({data: price});
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const {id} = validators.priceIdSchema.parse(req.params);
    await service.deletePrice(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
