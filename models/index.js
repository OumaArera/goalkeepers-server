const sequelize = require('../config/sequelize');
const User = require('./user.model');
const Item = require('./item.model');
const Customer = require('./customer.model');

// Ensure associations are applied
Item.belongsTo(User, { foreignKey: 'promoterId', as: 'promoter' });
User.hasMany(Item, { foreignKey: 'promoterId', as: 'promotedItems' });

module.exports = {
  sequelize,
  User,
  Item,
  Customer
};
