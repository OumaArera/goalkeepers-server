const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const GoalkeepingStats = sequelize.define('GoalkeepingStats', {
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
  saves: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  penaltiesSaved: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'penalties_saved',
  },
  punches: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  highClaims: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'high_claims',
  },
  catches: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sweeperClearances: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sweeper_clearances',
  },
  throwOuts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'throw_outs',
  },
  goalKicks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'goal_kicks',
  },
}, {
  tableName: 'goalkeeping_stats',
  timestamps: true,
  underscored: true,
});

module.exports = GoalkeepingStats;
