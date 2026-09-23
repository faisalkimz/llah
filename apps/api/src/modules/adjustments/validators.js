import Joi from 'joi';

export const createAdjustmentSchema = Joi.object({
  customerId: Joi.string().required(),
  type: Joi.string().valid('DEBIT', 'CREDIT').required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  amountMinor: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  referenceType: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null)
});

export const listAdjustmentsSchema = Joi.object({
  customerId: Joi.string(),
  type: Joi.string().valid('DEBIT', 'CREDIT'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
