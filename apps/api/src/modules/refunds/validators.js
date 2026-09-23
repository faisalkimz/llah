import Joi from 'joi';

export const createRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amountMinor: Joi.number().integer().positive().required(),
  reason: Joi.string().allow('', null),
  providerRefundId: Joi.string().allow('', null)
});

export const listRefundsSchema = Joi.object({
  paymentId: Joi.string(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
