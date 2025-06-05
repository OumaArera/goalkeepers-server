const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const League = sequelize.define('League', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sex: {
    type: DataTypes.ENUM('male', 'female', 'both'),
    allowNull: false,
  },
  regulator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'leagues',
  timestamps: true,
  underscored: true,
});

module.exports = League;
