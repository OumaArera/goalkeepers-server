const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Item = sequelize.define('Item', {
   id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  category: {
    type: DataTypes.ENUM('jersey', 'gloves', 'accessory', 'ticket'),
    allowNull: false,
  },
  price: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
    validate: { isUrl: true },
  },
  brand: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    defaultValue: null 
  },
  size: { 
    type: DataTypes.JSONB, 
    allowNull: true, 
    defaultValue: [] 
  },
  color: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    defaultValue: null 
  },
  material: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    defaultValue: null 
  },
  team: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    defaultValue: null 
  },
  playerName: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    field: 'player_name', 
    defaultValue: null 
  },
  playerNumber: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    field: 'player_number', 
    defaultValue: null 
  },
  discount: { 
    type: DataTypes.FLOAT, 
    allowNull: true, 
    defaultValue: 0 
  },
  available: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true 
  },
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true,
});

// Define associations method to be called after all models are loaded
Item.associate = (models) => {
  Item.belongsTo(models.User, {
    foreignKey: {
      name: 'promoterId',
      allowNull: true,
    },
    as: 'promoter',
    onDelete: 'SET NULL',
  });
};

module.exports = Item;