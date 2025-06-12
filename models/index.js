const sequelize = require('../config/sequelize');
const User = require('./user.model');
const Item = require('./item.model');
const Customer = require('./customer.model');
const Goalkeeper = require('./goalkeeper.model');
const FormerClub = require('./formerClub.model');
const StyleOfPlay = require('./styleOfPlay.model');
const Experience = require('./experience.model');
const KplRecord = require('./kplRecord.model');
const HonorsAndAwards = require('./honorsAndAwards.model');
const GoalkeepingStats = require('./goalkeepingStats.model');
const DisciplineRecords = require('./disciplineRecords.model');
const DefensiveStats = require('./defensiveStats.model');
const TeamplayStats = require('./teamplayStats.model');
const NewRequest = require('./newRequest.model');
const League = require('./league.model');
const Partner = require('./partner.model');
const Order = require('./order.model');
const Payment = require('./payment.model');
const Token = require('./token.model');
const Cart = require('./cart.model');

Item.belongsTo(User, { foreignKey: 'promoterId', as: 'promoter_' });
User.hasMany(Item, { foreignKey: 'promoterId', as: 'promotedItems_' });

Goalkeeper.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Goalkeeper, { foreignKey: 'userId', as: 'goalkeeperProfile' });

Goalkeeper.hasMany(FormerClub, { foreignKey: 'goalkeeperId', as: 'formerClubs' });
FormerClub.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasMany(StyleOfPlay, { foreignKey: 'goalkeeperId', as: 'stylesOfPlay' });
StyleOfPlay.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasMany(Experience, { foreignKey: 'goalkeeperId', as: 'experiences' });
Experience.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasMany(KplRecord, { foreignKey: 'goalkeeperId', as: 'kplRecords' });
KplRecord.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasMany(HonorsAndAwards, { foreignKey: 'goalkeeperId', as: 'honorsAndAwards' });
HonorsAndAwards.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasOne(GoalkeepingStats, { foreignKey: 'goalkeeperId', as: 'goalkeepingStats' });
GoalkeepingStats.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasOne(DisciplineRecords, { foreignKey: 'goalkeeperId', as: 'disciplineRecords' });
DisciplineRecords.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasOne(DefensiveStats, { foreignKey: 'goalkeeperId', as: 'defensiveStats' });
DefensiveStats.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Goalkeeper.hasOne(TeamplayStats, { foreignKey: 'goalkeeperId', as: 'teamplayStats' });
TeamplayStats.belongsTo(Goalkeeper, { foreignKey: 'goalkeeperId', as: 'goalkeeper' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
// Item.hasMany(Order, { foreignKey: 'itemId', as: 'items' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Token, { foreignKey: 'userId', as: 'tokens' });
Token.belongsTo(User, { foreignKey: 'userId', as: 'users' });
Customer.hasMany(Token, { foreignKey: 'customerId', as: 'tokens' });
Token.belongsTo(Customer, { foreignKey: 'customerId', as: 'customers' });

// Customer ↔ Cart (One-to-Many)
Customer.hasMany(Cart, { foreignKey: 'customerId', as: 'carts' });
Cart.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Item ↔ Cart (One-to-Many)
Item.hasMany(Cart, { foreignKey: 'itemId', as: 'carts' });
Cart.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });


module.exports = {
  sequelize,
  User,
  Item,
  Customer,
  Goalkeeper,
  FormerClub,
  StyleOfPlay,
  Experience,
  KplRecord,
  HonorsAndAwards,
  GoalkeepingStats,
  DisciplineRecords,
  DefensiveStats,
  TeamplayStats,
  NewRequest,
  League,
  Partner,
  Order,
  Payment,
  Token,
  Cart
};
