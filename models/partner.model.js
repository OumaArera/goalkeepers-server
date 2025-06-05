const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Partner = sequelize.define('Partner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slogan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
  },
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'website_url',
    validate: {
      isUrl: true,
    },
  },
}, {
  tableName: 'partners',
  timestamps: true,
  underscored: true,
});

module.exports = Partner;
