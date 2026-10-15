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
    const data = validators.createCustomerSchema.parse(req.body);
    const customer = await service.createCustomer(req.organizationId, data);
    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listCustomersQuerySchema.parse(req.query);
    const result = await service.listCustomers(req.organizationId, params);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    const customer = await service.getCustomerWithStats(id, req.organizationId);
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    const data = validators.updateCustomerSchema.parse(req.body);
    const customer = await service.updateCustomer(id, req.organizationId, data);
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    await service.deleteCustomer(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
