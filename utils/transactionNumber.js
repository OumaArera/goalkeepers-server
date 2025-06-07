const { customAlphabet } = require('nanoid');

class TransactionIDGenerator {
  constructor() {
    this.nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
  }
  generate() {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = this.nanoid();
    return `${datePart}${randomPart}`;
  }
}

module.exports = TransactionIDGenerator;
