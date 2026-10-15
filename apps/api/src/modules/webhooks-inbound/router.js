import { Router } from 'express';
import * as service from './service.js';

const router = Router();

router.post('/stripe', async (req, res) => {
  try {
    const result = await service.handleStripeWebhook(req.body, req.headers);
    return res.json({ data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/paypal', async (req, res) => {
  try {
    const result = await service.handlePayPalWebhook(req.body, req.headers);
    return res.json({ data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
