const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Token = sequelize.define('Token', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      }
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'tokens',
    timestamps: true,
    underscored: true,
  });


module.exports = Token;