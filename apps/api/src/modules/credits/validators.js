import Joi from 'joi';

export const createCreditGrantSchema = Joi.object({
  customerId: Joi.string().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  amountMinor: Joi.number().integer().positive().required(),
  reason: Joi.string().allow('', null),
  expiresAt: Joi.date().iso().allow(null)
});

export const listCreditGrantsSchema = Joi.object({
  customerId: Joi.string(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
