import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireAuth);
router.use(requireOrg);

router.post('/', async (req, res, next) => {
  try {
    const data = validators.createProductSchema.parse(req.body);
    const product = await service.createProduct(req.organizationId, data);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listProductsQuerySchema.parse(req.query);
    const result = await service.listProducts(req.organizationId, params);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.productIdSchema.parse(req.params);
    const product = await service.getProductById(id, req.organizationId);
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.productIdSchema.parse(req.params);
    const data = validators.updateProductSchema.parse(req.body);
    const product = await service.updateProduct(id, req.organizationId, data);
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.productIdSchema.parse(req.params);
    await service.deleteProduct(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
