const Joi = require('joi');

/**
 * Joi schema for validating item creation requests.
 */
const itemSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required.',
    'string.empty': 'Name cannot be empty.'
  }),

  description: Joi.string().trim().required().messages({
    'any.required': 'Description is required.',
    'string.empty': 'Description cannot be empty.'
  }),

  category: Joi.string().trim().required().messages({
    'any.required': 'Category is required.',
    'string.empty': 'Category cannot be empty.'
  }),

  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required.',
    'number.base': 'Price must be a number.',
    'number.positive': 'Price must be a positive number.'
  }),

  quantity: Joi.number().integer().positive().required().messages({
    'any.required': 'Quantity is required.',
    'number.base': 'Quantity must be a number.',
    'number.integer': 'Quantity must be an integer.',
    'number.positive': 'Quantity must be a positive number.'
  }),

  size: Joi.alternatives().try(
    Joi.string().custom((value, helpers) => {
      try {
        JSON.parse(value);
        return value;
      } catch (err) {
        return helpers.error('any.invalid');
      }
    }).messages({
      'any.invalid': 'Size must be a valid JSON string.'
    }),
    Joi.object().pattern(
      Joi.string(),
      Joi.number().integer().min(0)
    )
  ).required().messages({
    'any.required': 'Size is required.'
  }),

  brand: Joi.string().trim().required().messages({
    'any.required': 'Brand is required.',
    'string.empty': 'Brand cannot be empty.'
  }),

  color: Joi.string().trim().optional(),

  material: Joi.string().trim().optional(),

  team: Joi.string().allow(null, '').optional(),

  playerName: Joi.string().trim().optional(),

  playerNumber: Joi.string().trim().optional(),

  discount: Joi.number().min(0).optional().messages({
    'number.min': 'Discount must be zero or more.'
  }),

  available: Joi.boolean().optional(),

  promoterId: Joi.string().trim().allow(null, '').optional(),
});

module.exports = {
  itemSchema,
};
