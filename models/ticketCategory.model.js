const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TicketCategory = sequelize.define('TicketCategory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ticketRepoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ticket_repos',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  category: {
    type: DataTypes.ENUM('VIP', 'VVIP', 'Regular'),
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'ticket_categories',
  timestamps: true,
  underscored: true,
});

TicketCategory.associate = (models) => {
  TicketCategory.belongsTo(models.TicketRepo, {
    foreignKey: 'ticketRepoId',
    as: 'event',
    onDelete: 'CASCADE',
  });
};

module.exports = TicketCategory;
