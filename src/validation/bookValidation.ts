import Joi from 'joi';

export const bookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  ISBN: Joi.string().required(),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
  quantity: Joi.number().integer().min(1).required(),
  status: Joi.string().valid('available', 'borrowed').default('available'),
});
