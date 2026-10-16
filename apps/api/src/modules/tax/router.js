import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

router.get('/', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.active !== undefined) {
      filters.active = req.query.active === 'true';
    }
    if (req.query.country) {
      filters.country = req.query.country;
    }
    const data = await service.listTaxRates(req.organizationId, filters);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = validators.createTaxRateSchema.parse(req.body);
    const data = await service.createTaxRate(req.organizationId, body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/calculate', async (req, res, next) => {
  try {
    const body = validators.calculateTaxSchema.parse(req.body);
    const data = await service.calculateTax(req.organizationId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.taxRateIdSchema.parse(req.params);
    const data = await service.getTaxRate(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.taxRateIdSchema.parse(req.params);
    const body = validators.updateTaxRateSchema.parse(req.body);
    const data = await service.updateTaxRate(id, req.organizationId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.taxRateIdSchema.parse(req.params);
    await service.deleteTaxRate(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/invoices/:invoiceId/apply', async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const body = validators.applyTaxSchema.parse(req.body);
    const data = await service.applyTaxToInvoice(invoiceId, req.organizationId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
