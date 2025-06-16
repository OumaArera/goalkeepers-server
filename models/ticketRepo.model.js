const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TicketRepo = sequelize.define('TicketRepo', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  match: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
    validate: {
      isUrl: true,
    },
  },
  available: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true 
  },
}, {
  tableName: 'ticket_repos',
  timestamps: true,
  underscored: true,
});

module.exports = TicketRepo;
