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

    const { error, value } = validators.createCreditGrantSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const grant = await service.createCreditGrant(organizationId, value);
    return res.status(201).json(success(grant));
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

    const { error, value } = validators.listCreditGrantsSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const grants = await service.listCreditGrants(organizationId, value);
    return res.json(success(grants));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:grantId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const grant = await service.getCreditGrant(req.params.grantId, organizationId);
    return res.json(success(grant));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
