const crypto = require('crypto');
const { Token } = require('../models');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = Number(process.env.IV_LENGTH);

const TokenService = {
  encrypt(token) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  },

  decrypt(encryptedToken) {
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },

  async saveToken(userId=null, customerId=null, token, expiresAt) {
    const newToken = await Token.create({ userId, customerId,  token, expiresAt });
    return newToken;
  },

  async invalidateAllUserTokens(userId) {
    await Token.destroy({ where: { userId } });
  },

  async invalidateToken(token) {
    await Token.destroy({ where: { token } });
  },

  async isTokenValid(token) {
    const record = await Token.findOne({ where: { token } });
    return !!record;
  }
};

module.exports = TokenService;
