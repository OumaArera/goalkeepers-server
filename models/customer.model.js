const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const validateInternationalPhone = require('../utils/validatePhone');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
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
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW,
  },
  modifiedAt: {
    type: DataTypes.DATE,
    field: 'modified_at',
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'customers',
  timestamps: false,
  hooks: {
    beforeCreate: async (customer) => {
      await Customer.validateCustomer(customer);
      customer.password = await bcrypt.hash(customer.password, 10);
    },
    beforeUpdate: async (customer) => {
      customer.modifiedAt = new Date();
    },
  },
});

const customerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required().custom((value, helpers) => {
    if (!validateInternationalPhone(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Invalid phone number format.',
    'string.empty': 'Phone number is required.',
  }),
  email: Joi.string().email().allow(null, ''),
  password: Joi.string().min(8).required(),
});

// Customer.validateCustomer = async (customer) => {
//   const { error } = customerSchema.validate(customer);
//   if (error) throw new Error(`Validation Error: ${error.message}`);
// };

Customer.validateCustomer = async (customer) => {
  const { error, value } = customerSchema.validate(customer, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) throw new Error(`Validation Error: ${error.message}`);

  Object.assign(customer, value);
};


Customer.validateCustomerPartial = async (partialCustomer) => {
  const { error } = customerSchema.fork(Object.keys(customerSchema.describe().keys), field => field.optional()).validate(partialCustomer);
  if (error) throw new Error(`Validation Error: ${error.message}`);
};

Customer.prototype.toSafeObject = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

Customer.sanitize = (customer) => {
  if (!customer) return null;
  const { password, ...safeCustomer } = customer;
  return safeCustomer;
};

Customer.createCustomer = async (customerData) => {
  await Customer.validateCustomer(customerData);
  const newCustomer = await Customer.create(customerData);
  return newCustomer.toJSON();
};

Customer.findByPhoneNumber = async (phoneNumber) => {
  return await Customer.findOne({ where: { phoneNumber }, raw: true });
};

Customer.findActiveByPhoneNumber = async (phoneNumber) => {
  return await Customer.findOne({ where: { phoneNumber, status: 'active' }, raw: true });
};

Customer.validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

Customer.updateById = async (customerId, updateData) => {
  if (!customerId) throw new Error('Customer ID is required');
  const customer = await Customer.findByPk(customerId);
  if (!customer) throw new Error('Customer not found');

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  await Customer.validateCustomerPartial(updateData);
  await customer.update(updateData);

  return customer.toSafeObject();
};

Customer.findById = async (id) => {
  if (!id) throw new Error('Customer ID is required');
  const customer = await Customer.findByPk(id, {
    attributes: { exclude: ['password'] },
    raw: true,
  });
  return customer || null;
};

Customer.findAllWithFilters = async (filters = {}, pagination = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.phoneNumber) where.phoneNumber = { [Op.iLike]: `%${filters.phoneNumber}%` };
  if (filters.name) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${filters.name}%` } },
      { lastName: { [Op.iLike]: `%${filters.name}%` } },
    ];
  }
  if (filters.email) where.email = { [Op.iLike]: `%${filters.email}%` };

  const { limit = 20, offset = 0 } = pagination;

  const { count: totalItems, rows: customers } = await Customer.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    raw: true,
  });

  return { totalItems, customers };
};

module.exports = Customer;
