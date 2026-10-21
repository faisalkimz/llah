import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  // Comma-separated list of emails that have platform-wide super-admin access
  // e.g. SUPER_ADMIN_EMAILS=admin@llah.io,ops@llah.io
  SUPER_ADMIN_EMAILS: z.string().optional(),
  // Optional: Stripe webhook verification
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  // Optional: PayPal webhook verification
  PAYPAL_WEBHOOK_ID: z.string().optional()
});

export const env = schema.parse(process.env);
