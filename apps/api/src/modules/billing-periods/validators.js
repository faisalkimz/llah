import Joi from 'joi';

export const listBillingPeriodsSchema = Joi.object({
  customerId: Joi.string(),
  subscriptionId: Joi.string(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
