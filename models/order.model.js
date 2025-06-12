const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'customer_id',
  },
  itemsPurchased: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'items_purchased',
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'order_number',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'cancelled', 'delivered'),
    defaultValue: 'pending',
    allowNull: false,
  },
  deliveryMethod: {
    type: DataTypes.ENUM('pickup', 'delivery'),
    allowNull: false,
    field: 'delivery_method',
    defaultValue: 'pickup',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'shipping_fee',
    defaultValue: 0.0,
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'grand_total',
  },
  paymentMethod: {
    type: DataTypes.ENUM('Mpesa', 'Debit/Credit Card', 'PayPal', 'Airtel Money', 'T-Cash'),
    allowNull: true,
    field: 'payment_method',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    defaultValue: 'unpaid',
    allowNull: false,
    field: 'payment_status',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
});

module.exports = Order;
