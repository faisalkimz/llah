import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  invoiceId: Joi.string().allow(null),
  provider: Joi.string().required(),
  providerPaymentId: Joi.string().allow('', null),
  currency: Joi.string().length(3).uppercase().default('USD'),
  amountMinor: Joi.number().integer().positive().required()
});

export const updatePaymentSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED'),
  providerPaymentId: Joi.string().allow('', null)
}).min(1);

export const listPaymentsSchema = Joi.object({
  invoiceId: Joi.string(),
  status: Joi.string().valid('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
