import { z } from 'zod';

const KNOWN_EVENTS = [
  'invoice.created',
  'invoice.paid',
  'invoice.voided',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.canceled',
  'credit.applied',
  'refund.issued',
  'alert.fired',
];

export const createEndpointSchema = z.object({
  url: z
    .string()
    .url()
    .refine((v) => v.startsWith('https://'), { message: 'URL must use HTTPS' }),
  events: z.array(z.enum(KNOWN_EVENTS)).min(1),
  secret: z.string().optional(),
});

export const updateEndpointSchema = z.object({
  url: z
    .string()
    .url()
    .refine((v) => v.startsWith('https://'), { message: 'URL must use HTTPS' })
    .optional(),
  events: z.array(z.enum(KNOWN_EVENTS)).min(1).optional(),
  active: z.boolean().optional(),
});

export const endpointIdSchema = z.object({
  id: z.string().cuid(),
});

export const deliveryIdSchema = z.object({
  id: z.string().cuid(),
});

export const listDeliveriesQuerySchema = z.object({
  endpointId: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
