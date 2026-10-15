import { z } from 'zod';

export const handleWebhookSchema = z.object({
  provider: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.unknown()),
});
