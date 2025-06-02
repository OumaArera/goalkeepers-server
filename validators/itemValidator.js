const Joi = require('joi');

/**
 * Joi schema for validating item creation requests.
 */
const itemSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required.',
    'string.empty': 'Name cannot be empty.',
  }),

  description: Joi.string().trim().required().messages({
    'any.required': 'Description is required.',
    'string.empty': 'Description cannot be empty.',
  }),

  category: Joi.string().valid('jersey', 'gloves', 'accessory', 'ticket').required().messages({
    'any.required': 'Category is required.',
    'string.empty': 'Category cannot be empty.',
    'any.only': 'Category must be one of jersey, gloves, or accessory.',
  }),

  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required.',
    'number.base': 'Price must be a number.',
    'number.positive': 'Price must be a positive number.',
  }),

  quantity: Joi.number().integer().positive().required().messages({
    'any.required': 'Quantity is required.',
    'number.base': 'Quantity must be a number.',
    'number.integer': 'Quantity must be an integer.',
    'number.positive': 'Quantity must be a positive number.',
  }),

  size: Joi.alternatives().try(
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) || typeof parsed === 'object') {
          return value;
        }
        return helpers.error('any.invalid');
      } catch {
        return helpers.error('any.invalid');
      }
    }).messages({
      'any.invalid': 'Size must be a valid JSON string (object or array).',
    }),
    Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        qty: Joi.number().integer().min(0).required(),
      })
    ),
    Joi.object().pattern(Joi.string(), Joi.number().integer().min(0))
  )
  .optional()
  .default([])
  .messages({
    'any.required': 'Size is required.',
  }),

  brand: Joi.string().allow(null, '').optional().default(null).messages({
    'string.empty': 'Brand cannot be empty.',
  }),

  color: Joi.string().allow(null, '').optional().default(null),

  material: Joi.string().allow(null, '').optional().default(null),

  team: Joi.string().allow(null, '').optional().default(null),

  playerName: Joi.string().allow(null, '').optional().default(null),

  playerNumber: Joi.string().allow(null, '').optional().default(null),

  discount: Joi.number().min(0).optional().default(0).messages({
    'number.min': 'Discount must be zero or more.',
  }),

  available: Joi.boolean().optional().default(true),

  promoterId: Joi.string().allow(null, '').optional().default(null),
});

module.exports = {
  itemSchema,
};
