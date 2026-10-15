import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createCreditGrantSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const grant = await service.createCreditGrant(req.organizationId, result.data);
    return res.status(201).json({ data: grant });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listCreditGrantsSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const grants = await service.listCreditGrants(req.organizationId, result.data);
    return res.json({ data: grants });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:grantId', async (req, res) => {
  try {
    const grant = await service.getCreditGrant(req.params.grantId, req.organizationId);
    return res.json({ data: grant });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
