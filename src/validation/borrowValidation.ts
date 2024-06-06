import Joi from 'joi';

export const borrowSchema = Joi.object({
  bookId: Joi.number().integer().required(),
  dueDate: Joi.date().required(),
});

export const returnSchema = Joi.object({
  bookId: Joi.number().integer().required(),
});
