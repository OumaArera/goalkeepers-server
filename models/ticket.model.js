const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ticket_repos',
      key: 'id',
    },
    onDelete: 'CASCADE',
    field: 'event_id',
  },
  category: {
    type: DataTypes.ENUM('VIP', 'VVIP', 'Regular'),
    allowNull: false,
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'ticket_number',
  },
  checkoutRequestId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'checkout_request_id',
  },
  merchantRequestID: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'merchant_request_id',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status',
  },
  statusMessage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'status_message',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'phone_number',
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name',
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'qr_code',
  },
  securityHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'security_hash',
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'active', 'used', 'revoked'),
    allowNull: false,
    defaultValue: 'unpaid',
  },
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
});

module.exports = Ticket;
