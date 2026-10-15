import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createApiKeySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const apiKey = await service.createApiKey(req.organizationId, result.data);
    return res.status(201).json({ data: apiKey });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listApiKeysSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const apiKeys = await service.listApiKeys(req.organizationId, result.data);
    return res.json({ data: apiKeys });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:keyId', async (req, res) => {
  try {
    const apiKey = await service.getApiKey(req.params.keyId, req.organizationId);
    return res.json({ data: apiKey });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.delete('/:keyId', async (req, res) => {
  try {
    await service.revokeApiKey(req.params.keyId, req.organizationId);
    return res.json({ data: { revoked: true } });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
