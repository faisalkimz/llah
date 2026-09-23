import { Router } from 'express';
import * as service from './service.js';
import { success, error as errorResponse } from '../../lib/api-response.js';

const router = Router();

router.post('/stripe', async (req, res) => {
  try {
    const result = await service.handleStripeWebhook(req.body, req.headers);
    return res.json(success(result));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.post('/paypal', async (req, res) => {
  try {
    const result = await service.handlePayPalWebhook(req.body, req.headers);
    return res.json(success(result));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
