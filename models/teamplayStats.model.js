const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TeamplayStats = sequelize.define('TeamplayStats', {
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
  goals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  assists: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  passes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  passesPerMatch: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
    field: 'passes_per_match',
  },
  accurateLongBalls: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'accurate_long_balls',
  },
}, {
  tableName: 'teamplay_stats',
  timestamps: true,
  underscored: true,
});

module.exports = TeamplayStats;
