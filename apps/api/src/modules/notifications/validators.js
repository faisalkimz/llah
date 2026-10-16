import { z } from 'zod';

const notifTypes = [
  'INVOICE_CREATED',
  'INVOICE_PAID',
  'INVOICE_OVERDUE',
  'PAYMENT_FAILED',
  'SUBSCRIPTION_CANCELED',
  'SUBSCRIPTION_RENEWED',
  'ALERT_FIRED',
  'CREDIT_APPLIED',
  'REFUND_ISSUED',
  'SYSTEM',
];

export const createNotificationSchema = z.object({
  userId: z.string().cuid().optional(),
  type: z.enum(notifTypes),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const listNotificationsQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  read: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  type: z.enum(notifTypes).optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const notifIdSchema = z.object({
  id: z.string().cuid(),
});
