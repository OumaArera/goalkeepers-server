const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const FormerClub = sequelize.define('FormerClub', {
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
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  country: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  league: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date',
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date',
  },
}, {
  tableName: 'former_clubs',
  timestamps: true,
  underscored: true,
});

module.exports = FormerClub;
