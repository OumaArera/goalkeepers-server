const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const NewRequest = sequelize.define('NewRequest', {
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
  lastNames: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_names',
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_of_birth',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
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
    validate: { isEmail: true },
  },
  clubsPlayedFor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'clubs_played_for',
  },
  recentClub: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'recent_club',
  },
  yearsOfGoalkeeping: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'years_of_goalkeeping',
  },
  requestDetails: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'request_details',
  },
  nextOfKinEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'next_of_kin_email',
    validate: { isEmail: true },
  },
  nextOfKinName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'next_of_kin_name',
  },
  nextOfKinPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'next_of_kin_phone_number',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'new_requests',
  timestamps: true,
  underscored: true,
});

module.exports = NewRequest;
