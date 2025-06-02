const { DataTypes, Op } = require('sequelize');
const Joi = require('joi');
const sequelize = require('../config/sequelize');
const { validate: isUuid } = require('uuid');
const User = require('./user.model');

const Item = sequelize.define('Item', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM('jersey', 'gloves', 'accessory', 'ticket'),
    allowNull: false,
  },
  price: { type: DataTypes.FLOAT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
    validate: { isUrl: true },
  },
  brand: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  size: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
  color: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  material: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  team: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  playerName: { type: DataTypes.STRING, allowNull: true, field: 'player_name', defaultValue: null },
  playerNumber: { type: DataTypes.STRING, allowNull: true, field: 'player_number', defaultValue: null },
  discount: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true,
});


// Relational Mapping
Item.belongsTo(User, {
  foreignKey: {
    name: 'promoterId',
    allowNull: true,
  },
  as: 'promoter',
  onDelete: 'SET NULL',
});

User.hasMany(Item, {
  foreignKey: 'promoterId',
  as: 'promotedItems',
});


const baseItemSchema = {
  name: Joi.string(),
  description: Joi.string(),
  category: Joi.string().valid('jersey', 'gloves', 'accessory', 'ticket'),
  price: Joi.number().positive(),
  quantity: Joi.number().integer().min(0),
  imageUrl: Joi.string().uri(),
  brand: Joi.string().allow(null, ''),
  size: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        qty: Joi.number().integer().required(),
      })
    ),
    Joi.array().length(0),
    Joi.string().allow(null, '')
  ).default([]),
  color: Joi.string().allow(null, ''),
  material: Joi.string().allow(null, ''),
  team: Joi.string().allow(null, ''),
  playerName: Joi.string().allow(null, ''),
  playerNumber: Joi.string().allow(null, ''),
  discount: Joi.number().min(0).default(0),
  available: Joi.boolean().default(true),
  promoterId: Joi.string().uuid().allow(null, ''),
};

const itemSchema = Joi.object({
  ...baseItemSchema,
  name: baseItemSchema.name.required(),
  description: baseItemSchema.description.required(),
  category: baseItemSchema.category.required(),
  price: baseItemSchema.price.required(),
  quantity: baseItemSchema.quantity.required(),
  imageUrl: baseItemSchema.imageUrl.required(),
  // Optional fields below
  brand: baseItemSchema.brand,
  size: baseItemSchema.size,
  color: baseItemSchema.color,
  material: baseItemSchema.material,
  team: baseItemSchema.team,
  playerName: baseItemSchema.playerName,
  playerNumber: baseItemSchema.playerNumber,
  discount: baseItemSchema.discount,
  available: baseItemSchema.available,
});

const partialItemSchema = Joi.object(baseItemSchema);

Item.validateItem = async (itemData) => {
  const { error } = itemSchema.validate(itemData, { abortEarly: false });
  if (error) throw new Error(`Validation Error: ${error.message}`);
};

Item.validatePartialItem = async (partialData) => {
  const { error } = partialItemSchema.validate(partialData, { abortEarly: false });
  if (error) throw new Error(`Validation Error: ${error.message}`);
};


// Create Item
Item.createItem = async (itemData) => {
  await Item.validateItem(itemData);
  const newItem = await Item.create(itemData);
  return newItem.toJSON();
};

// Read Item By ID
Item.findItemById = async (id) => {
  const item = await Item.findByPk(id, {
    include: [{ model: User, as: 'promoter', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    raw: true,
    nest: true,
  });
  if (!item) throw new Error('Item not found');
  return item;
};

// Update Item
Item.updateItemById = async (id, updateData) => {
  const item = await Item.findByPk(id);
  if (!item) throw new Error('Item not found');

  await Item.validatePartialItem(updateData);
  await item.update(updateData);
  return item.toJSON();
};


Item.findAllWithFilters = async (filters = {}, pagination = {}) => {
  const where = {};

  if (filters.name) {
    where.name = { [Op.iLike]: `%${filters.name}%` };
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.brand) {
    where.brand = { [Op.iLike]: `%${filters.brand}%` };
  }

  if (filters.available !== undefined) {
    where.available = filters.available;
  }

  // Handle promoterId gracefully
  if (filters.promoterId !== undefined) {
    if (filters.promoterId === null) {
      where.promoterId = null;
    } else if (isUuid(filters.promoterId)) {
      where.promoterId = filters.promoterId;
    } else {
      // Invalid UUID, so ignore the promoterId filter
      console.warn('Invalid promoterId provided, skipping filter.');
    }
  }

  const { limit = 20, offset = 0 } = pagination;

  const { rows: items, count: totalItems } = await Item.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'promoter',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    raw: true,
    nest: true,
  });

  return { items, totalItems };
};


// Safe Output (Sanitizer)
Item.sanitize = (item) => {
  if (!item) return null;
  const { ...safeItem } = item;
  return safeItem;
};

module.exports = Item;
