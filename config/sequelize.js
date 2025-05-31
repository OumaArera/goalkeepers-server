const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load SSL CA Certificate
const sslCa = fs.readFileSync(
  path.resolve(__dirname, '..', process.env.DB_SSL_CA_PATH)
).toString();

// Configure Sequelize with SSL and env credentials
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: sslCa,
      },
    },
  }
);

module.exports = sequelize;