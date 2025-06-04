const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Goalkeeper = sequelize.define('Goalkeeper', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  height: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  weight: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  favoriteFoot: {
    type: DataTypes.ENUM('Right', 'Left', 'Both'),
    allowNull: true,
  },
  jersey: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  internationalCaps: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
}, {
  tableName: 'goalkeepers',
  timestamps: true,
  underscored: true,
});

module.exports = Goalkeeper;
