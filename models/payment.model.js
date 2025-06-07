const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'order_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status',
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'transaction_id',
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
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  statusMessage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'status_message',
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phoneNumber',
  },
  // cardNumber: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   field: 'card_number',
  // },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  validate: {
    phoneOrCardProvided() {
      if (!this.phoneNumber && !this.cardNumber) {
        throw new Error('Either phoneNumber or cardNumber must be provided');
      }
    },
  },
});

module.exports = Payment;