const fs = require('fs');
const path = require('path');
require('dotenv').config();

// const sslCa = fs.readFileSync(path.resolve(__dirname, '..', process.env.DB_SSL_CA_PATH)).toString();
const sslCa = process.env.CA_CERT;

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: sslCa,
      },
    },
  },
  test: {
    // Add test DB config if needed
  },
  production: {
    // Add production DB config if needed
  },
};
