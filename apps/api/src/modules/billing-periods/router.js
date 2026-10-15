import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.get('/', async (req, res) => {
  try {
    const result = validators.listBillingPeriodsSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const periods = await service.listBillingPeriods(req.organizationId, result.data);
    return res.json({ data: periods });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST /:id/close — close a billing period and generate an invoice
router.post('/:id/close', async (req, res) => {
  try {
    const invoice = await service.closeBillingPeriod(req.organizationId, req.params.id);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 422 ? 'INVALID_STATE' : 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
