import Joi from 'joi';

export const createPlanSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  active: Joi.boolean().default(true),
  items: Joi.array().items(Joi.object({
    priceId: Joi.string().required(),
    sortOrder: Joi.number().integer().min(0).default(0)
  })).min(1).required()
});

export const updatePlanSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('', null),
  active: Joi.boolean()
}).min(1);

export const addPlanItemSchema = Joi.object({
  priceId: Joi.string().required(),
  sortOrder: Joi.number().integer().min(0).default(0)
});

export const listPlansSchema = Joi.object({
  active: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});
