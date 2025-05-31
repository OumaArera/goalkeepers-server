const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const validateInternationalPhone = require('../utils/validatePhone');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name',
  },
  middleNames: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'middle_names',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name',
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_of_birth',
  },
  nationalIdOrPassportNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'national_id_or_passport_no',
  },
  role: {
    type: DataTypes.ENUM('superuser', 'manager', 'player', 'junior', 'director'),
    allowNull: false,
  },
  department: {
    type: DataTypes.ENUM('Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management'),
    allowNull: false,
  },
  phonenumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'phone_number',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
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
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: true },
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
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      await User.validateUser(user);
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      user.modifiedAt = new Date();
    },
  },
});

const userSchema = Joi.object({
  firstName: Joi.string(),
  middleNames: Joi.string().allow(null, ''),
  lastName: Joi.string(),
  dateOfBirth: Joi.date(),
  nationalIdOrPassportNo: Joi.string(),
  role: Joi.string().valid('superuser', 'manager', 'player', 'junior', 'director'),
  department: Joi.string().valid('Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management'),
  phonenumber: Joi.string().custom((value, helpers) => {
    if (!validateInternationalPhone(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Invalid phone number format.',
    'string.empty': 'Phone number is required.',
  }),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  status: Joi.string().valid('active', 'blocked', 'suspended', 'deleted'),
  avatar: Joi.string().uri().allow(null, ''),
});


User.validateUser = async (user) => {
  const fullSchema = userSchema.fork(Object.keys(userSchema.describe().keys), (schema) => schema.required());
  const { error } = fullSchema.validate(user);
  if (error) throw new Error(`Validation Error: ${error.message}`);
};

User.validateUserPartial = async (partialUser) => {
  const { error } = userSchema.validate(partialUser);
  if (error) throw new Error(`Validation Error: ${error.message}`);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

User.sanitize = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};


User.findActiveByEmail = async (email) => {
  return await User.findOne({ where: { email, status: 'active' }, raw: true, });
};


User.findByEmailRegardlessOfStatus = async (email) => {
  return await User.findOne({ where: { email }, raw: true });
};

User.validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

User.findSafeById = async (id) => {
  if (!id) throw new Error('User ID is required');

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    raw: true,
  });

  if (!user) throw new Error('User not found');
  return user;
};

User.updateById = async (userId, updateData) => {
  if (!userId) throw new Error('User ID is required');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const dataToUpdate = { ...updateData };

  if (dataToUpdate.password) {
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
  }

  await User.validateUserPartial(dataToUpdate);

  await user.update(dataToUpdate);

  return user.toJSON();
};


User.unblockUserById = async (id) => {
  return await User.updateById(id, { status: 'active' });
};

User.blockUserById = async (id) => {
  return await User.updateById(id, { status: 'blocked' });
};

User.findAllWithFilters = async (filters = {}) => {
  const where = {};
  if (filters.firstName) where.firstName = { [Op.iLike]: `%${filters.firstName}%` };
  if (filters.lastName) where.lastName = { [Op.iLike]: `%${filters.lastName}%` };
  if (filters.email) where.email = { [Op.iLike]: `%${filters.email}%` };
  if (filters.role) where.role = filters.role;
  if (filters.department) where.department = filters.department;
  if (filters.status) where.status = filters.status;

  return await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'ASC']],
    raw: true,
  });
};

module.exports = User;
