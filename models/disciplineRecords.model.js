const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DisciplineRecords = sequelize.define('DisciplineRecords', {
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
  yellowCards: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'yellow_cards',
  },
  redCards: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'red_cards',
  },
  fouls: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'discipline_records',
  timestamps: true,
  underscored: true,
});

module.exports = DisciplineRecords;
