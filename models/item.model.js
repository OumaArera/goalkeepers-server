const { DataTypes, Op } = require('sequelize');
const Joi = require('joi');
const sequelize = require('../config/sequelize');
const User = require('./user.model');

const Item = sequelize.define('Item', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM('jersey', 'gloves', 'accessory'),
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
  brand: { type: DataTypes.STRING, allowNull: false },
  size: { type: DataTypes.JSONB, allowNull: false },
  color: { type: DataTypes.STRING, allowNull: false },
  material: { type: DataTypes.STRING, allowNull: false },
  team: { type: DataTypes.STRING, allowNull: true },
  playerName: { type: DataTypes.STRING, allowNull: false, field: 'player_name' },
  playerNumber: { type: DataTypes.STRING, allowNull: false, field: 'player_number' },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
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


// Joi Schema for Validation
const itemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid('jersey', 'gloves', 'accessory').required(),
  price: Joi.number().positive().required(),
  quantity: Joi.number().integer().min(0).required(),
  imageUrl: Joi.string().uri().required(),
  brand: Joi.string().required(),
  size: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        qty: Joi.number().integer().required(),
      })
    )
  ),
  color: Joi.string().required(),
  material: Joi.string().required(),
  team: Joi.string().allow(null, ''),
  playerName: Joi.string().required(),
  playerNumber: Joi.string().required(),
  discount: Joi.number().min(0).default(0),
  available: Joi.boolean().default(true),
  promoterId: Joi.string().uuid().allow(null, '').default(null),
});

// Validation Methods
Item.validateItem = async (itemData) => {
  const { error } = itemSchema.validate(itemData);
  if (error) throw new Error(`Validation Error: ${error.message}`);
};

Item.validatePartialItem = async (partialData) => {
  const { error } = itemSchema.validate(partialData, { presence: 'optional' });
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

// Search / Filter Items
Item.findAllWithFilters = async (filters = {}, pagination = {}) => {
  const where = {};

  if (filters.name) where.name = { [Op.iLike]: `%${filters.name}%` };
  if (filters.category) where.category = filters.category;
  if (filters.brand) where.brand = { [Op.iLike]: `%${filters.brand}%` };
  if (filters.available !== undefined) where.available = filters.available;
  if (filters.promoterId) where.promoterId = filters.promoterId;

  const { limit = 20, offset = 0 } = pagination;

  const { rows: items, count: totalItems } = await Item.findAndCountAll({
    where,
    include: [
      { model: User, as: 'promoter', attributes: ['id', 'firstName', 'lastName'] },
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
