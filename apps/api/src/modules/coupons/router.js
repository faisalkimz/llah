import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import { createCouponSchema, applyCouponSchema } from './validators.js';

const router = Router();
router.use(requireOrg);

// POST /v1/coupons — create a coupon
router.post('/', async (req, res) => {
  try {
    const result = createCouponSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const coupon = await service.createCoupon(req.organizationId, result.data);
    return res.status(201).json({ data: coupon });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// GET /v1/coupons — list all coupons for the org
router.get('/', async (req, res) => {
  try {
    const coupons = await service.listCoupons(req.organizationId);
    return res.json({ data: coupons });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST /v1/coupons/apply — apply a coupon to an invoice
// Must be declared BEFORE /:id to avoid route shadowing
router.post('/apply', async (req, res) => {
  try {
    const result = applyCouponSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const { code, invoiceId } = result.data;
    const invoice = await service.applyCouponToInvoice(code, invoiceId, req.organizationId);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// GET /v1/coupons/:id — get a single coupon
router.get('/:id', async (req, res) => {
  try {
    const coupon = await service.getCoupon(req.organizationId, req.params.id);
    return res.json({ data: coupon });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// DELETE /v1/coupons/:id — deactivate a coupon
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await service.deactivateCoupon(req.organizationId, req.params.id);
    return res.json({ data: coupon });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
