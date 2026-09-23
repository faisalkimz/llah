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

    const { error, value } = validators.createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const payment = await service.createPayment(organizationId, value);
    return res.status(201).json(success(payment));
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

    const { error, value } = validators.listPaymentsSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const payments = await service.listPayments(organizationId, value);
    return res.json(success(payments));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:paymentId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const payment = await service.getPayment(req.params.paymentId, organizationId);
    return res.json(success(payment));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.put('/:paymentId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.updatePaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const payment = await service.updatePayment(req.params.paymentId, organizationId, value);
    return res.json(success(payment));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
