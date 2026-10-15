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
    // Prefer a raw string body; fall back to re-serialized JSON
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req.rawBody)
        ? req.rawBody.toString('utf8')
        : JSON.stringify(req.body ?? '');

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
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req.rawBody)
        ? req.rawBody.toString('utf8')
        : JSON.stringify(req.body ?? '');

    const result = await service.handlePayPalWebhook(rawBody, req.headers);
    return res.json({ data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 400 ? 'SIGNATURE_INVALID' : 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
