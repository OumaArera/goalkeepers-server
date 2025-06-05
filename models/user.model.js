const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
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
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Instance method to exclude password from JSON output
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Static method for password validation
User.validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = User;