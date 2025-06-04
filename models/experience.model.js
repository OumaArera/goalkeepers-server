const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Experience = sequelize.define('Experience', {
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
  leagueName: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'league_name',
  },
  appearances: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'experiences',
  timestamps: true,
  underscored: true,
});

module.exports = Experience;
