// models/Item.js
const { DataTypes } = require('sequelize');
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
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  size: {
    type: DataTypes.JSONB, 
    allowNull: false,
  },
  color: { type: DataTypes.STRING, allowNull: false },
  material: { type: DataTypes.STRING, allowNull: false },
  team: { type: DataTypes.STRING, allowNull: true },
  playerName: { type: DataTypes.STRING, allowNull: false },
  playerNumber: { type: DataTypes.STRING, allowNull: false },
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

module.exports = Item;
