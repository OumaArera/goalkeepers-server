// mpesa/MpesaPayment.js
const axios = require('axios');
const moment = require('moment');

class MpesaPayment {
  constructor({ consumerKey, consumerSecret, shortCode, passkey, callbackUrl }) {
    // Basic credentials from Daraja portal
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;

    // Business shortcode (e.g. 174379 for sandbox)
    this.shortCode = shortCode;

    // Lipa na Mpesa passkey (from app settings on Daraja)
    this.passkey = passkey;

    // HTTPS callback URL that Safaricom will post payment result to
    this.callbackUrl = callbackUrl;

    // Daraja base URLs
    this.baseUrl = 'https://sandbox.safaricom.co.ke'; 
  }

  /**
   * Generate an OAuth access token from Daraja API.
   * Required for all authenticated endpoints.
   */
  async generateAccessToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (err) {
      console.error('Token error:', err.response?.data || err.message);
      throw new Error('Failed to generate access token.');
    }
  }

  /**
   * Generate a timestamp and encode password for STK Push.
   */
  generatePassword() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(this.shortCode + this.passkey + timestamp).toString('base64');
    return { timestamp, password };
  }

  /**
   * Send an STK Push request to initiate payment.
   * @param {Object} paymentDetails
   *   - phoneNumber: Customer phone (e.g. 2547XXXXXXXX)
   *   - amount: Amount to charge
   *   - accountReference: Reference showing in customer’s M-Pesa message
   *   - transactionDesc: Description of the transaction
   */
  async initiateSTKPush({ phoneNumber, amount, accountReference = 'SafeStack', transactionDesc = 'Payment' }) {
    try {
      const accessToken = await this.generateAccessToken();
      const { timestamp, password } = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Static method to handle the callback from Safaricom after STK push.
   * Should be placed on your /api/mpesa/callback POST route.
   * @param {Object} callbackData — The raw JSON body posted by Safaricom.
   * @returns {Object} Parsed transaction result.
   */
  static handleCallback(callbackData) {
    const stkCallback = callbackData?.Body?.stkCallback;

    if (!stkCallback) {
      return { success: false, message: 'Invalid callback format.' };
    }

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata?.Item;
      const parsed = {};
      metadata.forEach(item => {
        parsed[item.Name] = item.Value;
      });

      return {
        success: true,
        transaction: {
          amount: parsed.Amount,
          receipt: parsed.MpesaReceiptNumber,
          phone: parsed.PhoneNumber,
          date: parsed.TransactionDate,
        },
      };
    }

    // Payment failed or cancelled
    return {
      success: false,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    };
  }
}

module.exports = MpesaPayment;
