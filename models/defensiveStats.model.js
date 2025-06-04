const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DefensiveStats = sequelize.define('DefensiveStats', {
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
  cleanSheets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'clean_sheets',
  },
  goalsConceded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'goals_conceded',
  },
  errorsLeadingToGoal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'errors_leading_to_goal',
  },
  ownGoals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'own_goals',
  },
}, {
  tableName: 'defensive_stats',
  timestamps: true,
  underscored: true,
});

module.exports = DefensiveStats;
