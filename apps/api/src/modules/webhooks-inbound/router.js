import { Router } from 'express';
import * as service from './service.js';

const router = Router();

/**
 * Stripe webhook endpoint.
 * The raw request body is needed for HMAC signature verification.
 * express.raw() must be mounted before express.json() for this route,
 * or the app must expose the raw body on req.rawBody.
 *
 * The router itself works with both:
 *   - req.rawBody (string) if the app attaches it
 *   - JSON.stringify(req.body) as a fallback (loses raw bytes but works in dev)
 */
router.post('/stripe', async (req, res) => {
  try {
    // Require the raw body captured by express.raw(); fail closed if absent
    if (typeof req.rawBody !== 'string') {
      return res.status(400).json({ error: { code: 'SIGNATURE_INVALID', message: 'Raw body unavailable — cannot verify signature' } });
    }
    const rawBody = req.rawBody;

    const signature = req.headers['stripe-signature'];
    const result = await service.handleStripeWebhook(rawBody, signature);
    return res.json({ data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 400 ? 'SIGNATURE_INVALID' : 'INTERNAL_ERROR', message: err.message } });
  }
});

/**
 * PayPal webhook endpoint.
 */
router.post('/paypal', async (req, res) => {
  try {
    // Require the raw body captured by express.raw(); fail closed if absent
    if (typeof req.rawBody !== 'string') {
      return res.status(400).json({ error: { code: 'SIGNATURE_INVALID', message: 'Raw body unavailable — cannot verify signature' } });
    }
    const rawBody = req.rawBody;

    const result = await service.handlePayPalWebhook(rawBody, req.headers);
    return res.json({ data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 400 ? 'SIGNATURE_INVALID' : 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
