const { Ticket } = require('../models');
const crypto = require('crypto');

class TicketNumberGenerator {
  static async generate() {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');

    let ticketNumber;

    while (true) {
      const randomPart = nanoid();
      ticketNumber = `TKT${datePart}${randomPart}`;
      const exists = await Ticket.findOne({ where: { ticketNumber } });
      if (!exists) break;
    }
    return ticketNumber;
  }

  static generateSecurityHash(ticketData) {
    const { ticketNumber, eventId, category, amount, phoneNumber, fullName } = ticketData;
    const dataToHash = `${ticketNumber}${eventId}${category}${amount}${phoneNumber}${fullName}`;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  static async generateQRCode(ticketData) {
    const QRCode = require('qrcode');
    
    const qrData = {
      ticketNumber: ticketData.ticketNumber,
      eventId: ticketData.eventId,
      category: ticketData.category,
      fullName: ticketData.fullName,
      amount: ticketData.amount,
      status: ticketData.status,
      hash: ticketData.securityHash
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static verifyTicketHash(ticketData, providedHash) {
    const calculatedHash = this.generateSecurityHash(ticketData);
    return calculatedHash === providedHash;
  }
}

module.exports = TicketNumberGenerator;