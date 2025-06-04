const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StyleOfPlay = sequelize.define('StyleOfPlay', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  goalkeeperId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'goalkeeper_id',
    references: {
      model: 'goalkeepers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  style: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'styles_of_play',
  timestamps: true,
  underscored: true,
});

module.exports = StyleOfPlay;
