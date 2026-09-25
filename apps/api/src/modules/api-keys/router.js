import { Router } from 'express';
import * as service from './service.js';
import * as validators from './validators.js';
import { success, error as errorResponse } from '../../lib/api-response.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.createApiKeySchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const apiKey = await service.createApiKey(organizationId, value);
    return res.status(201).json(success(apiKey));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.get('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.listApiKeysSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const apiKeys = await service.listApiKeys(organizationId, value);
    return res.json(success(apiKeys));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:keyId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const apiKey = await service.getApiKey(req.params.keyId, organizationId);
    return res.json(success(apiKey));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.delete('/:keyId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    await service.revokeApiKey(req.params.keyId, organizationId);
    return res.json(success({ revoked: true }));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
