import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createLedgerEntrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const entry = await service.createLedgerEntry(req.organizationId, result.data);
    return res.status(201).json({ data: entry });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listLedgerEntriesSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const entries = await service.listLedgerEntries(req.organizationId, result.data);
    return res.json({ data: entries });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:entryId', async (req, res) => {
  try {
    const entry = await service.getLedgerEntry(req.params.entryId, req.organizationId);
    return res.json({ data: entry });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
