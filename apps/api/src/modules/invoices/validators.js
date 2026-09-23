import Joi from 'joi';

export const createInvoiceSchema = Joi.object({
  customerId: Joi.string().required(),
  number: Joi.string().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  periodStart: Joi.date().iso().required(),
  periodEnd: Joi.date().iso().required(),
  dueAt: Joi.date().iso().allow(null),
  lines: Joi.array().items(Joi.object({
    description: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unitAmountMinor: Joi.number().integer().required(),
    metadata: Joi.object().allow(null)
  })).min(1).required()
});

export const updateInvoiceSchema = Joi.object({
  status: Joi.string().valid('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'),
  dueAt: Joi.date().iso().allow(null),
  issuedAt: Joi.date().iso().allow(null)
}).min(1);

export const listInvoicesSchema = Joi.object({
  customerId: Joi.string(),
  status: Joi.string().valid('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
