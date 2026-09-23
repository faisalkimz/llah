import Joi from 'joi';

export const createSubscriptionSchema = Joi.object({
  customerId: Joi.string().required(),
  planId: Joi.string().required(),
  currentPeriodStart: Joi.date().iso().required(),
  currentPeriodEnd: Joi.date().iso().required()
});

export const updateSubscriptionSchema = Joi.object({
  planId: Joi.string(),
  status: Joi.string().valid('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED'),
  currentPeriodStart: Joi.date().iso(),
  currentPeriodEnd: Joi.date().iso(),
  cancelAtPeriodEnd: Joi.boolean()
}).min(1);

export const listSubscriptionsSchema = Joi.object({
  customerId: Joi.string(),
  status: Joi.string().valid('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
