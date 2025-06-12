// services/TokenService.js
const crypto = require('crypto');
const { Token } = require('../models');
require('dotenv').config();

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
const IV_LENGTH = parseInt(process.env.IV_LENGTH); 

const TokenService = {
  encrypt(token) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Concatenate IV, authTag, and ciphertext for transport
    const payload = Buffer.concat([iv, authTag, encrypted]).toString('base64');
    return payload;
  },

  decrypt(payload) {
    const data = Buffer.from(payload, 'base64');
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16); 
    const encrypted = data.subarray(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  },


  async saveToken(userId = null, customerId = null, token, expiresAt) {
    const newToken = await Token.create({ userId, customerId, token, expiresAt });
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
