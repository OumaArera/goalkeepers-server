const { Order } = require('../models');

class OrderNumberGenerator {
  static async generateOrderNumber() {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

    let orderNumber;

    while (true) {
      orderNumber = nanoid();
      const exists = await Order.findOne({ where: { orderNumber } });
      if (!exists) break;
    }

    return orderNumber;
  }
}

module.exports = OrderNumberGenerator;
