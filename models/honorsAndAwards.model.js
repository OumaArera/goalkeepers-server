const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const HonorsAndAwards = sequelize.define('HonorsAndAwards', {
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
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  monthAwarded: {
    type: DataTypes.TEXT,
    field: 'month_awarded',
    allowNull: false,
  },
  season: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'honors_and_awards',
  timestamps: true,
  underscored: true,
});

module.exports = HonorsAndAwards;
