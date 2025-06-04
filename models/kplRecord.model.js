const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const KplRecord = sequelize.define('KplRecord', {
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
  club: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  position: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  appearances: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  cleanSheets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'clean_sheets',
    defaultValue: 0,
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
}, {
  tableName: 'kpl_records',
  timestamps: true,
  underscored: true,
});

module.exports = KplRecord;
