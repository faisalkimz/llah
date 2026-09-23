import Joi from 'joi';

export const createLedgerEntrySchema = Joi.object({
  customerId: Joi.string().allow(null),
  type: Joi.string().valid('CHARGE', 'PAYMENT', 'CREDIT', 'REFUND', 'ADJUSTMENT').required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  amountMinor: Joi.number().integer().required(),
  referenceType: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null),
  description: Joi.string().allow('', null)
});

export const listLedgerEntriesSchema = Joi.object({
  customerId: Joi.string(),
  type: Joi.string().valid('CHARGE', 'PAYMENT', 'CREDIT', 'REFUND', 'ADJUSTMENT'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
