const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name',
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'phone_number',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked', 'suspended', 'deleted'),
    defaultValue: 'active',
  },
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        customer.password = await bcrypt.hash(customer.password, 10);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password') && customer.password) {
        customer.password = await bcrypt.hash(customer.password, 10);
      }
    },
  },
});

// Instance method to exclude password from JSON output
Customer.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Static method for password validation
Customer.validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = Customer;