const { Payment } = require('../models');

class ReferenceNumberGenerator {
  static async generate() {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    console.log("Date: ", datePart);

    let reference;

    while (true){
      const randomPart = nanoid();
      reference = `${datePart}${randomPart}`;
      const exists = await Payment.findOne({ where: { reference } });
      if (!exists) break;
    }
    return reference;
  }
}

module.exports = ReferenceNumberGenerator;
