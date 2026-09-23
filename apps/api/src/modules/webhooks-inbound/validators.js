import Joi from 'joi';

export const handleWebhookSchema = Joi.object({
  provider: Joi.string().required(),
  eventType: Joi.string().required(),
  payload: Joi.object().required()
});
