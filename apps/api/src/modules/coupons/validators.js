import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1).max(64),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().int().positive(),
  maxRedemptions: z.number().int().positive().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
  invoiceId: z.string().min(1),
});
