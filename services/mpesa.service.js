// mpesa/MpesaPayment.js
const axios = require('axios');
const { check } = require('express-validator');
const moment = require('moment');

class MpesaPayment {
  static baseUrl = process.env.MPESA_BASE_URL; 

  /**
   * Generate access token using consumer key & secret from env
   * @returns {Promise<string>} accessToken
   */
  static async generateAccessToken() {
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing CONSUMER_KEY or CONSUMER_SECRET in environment');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      console.log("Access Token: ", response.data.access_token)
      return response.data.access_token;
    } catch (err) {
      console.error('Access token error:', err.response?.data || err.message);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate password and timestamp for STK push
   * @returns {{ timestamp: string, password: string }}
   */
  static generatePassword() {
    const shortCode = process.env.SHORTCODE;
    const passkey = process.env.PASS_KEY;

    if (!shortCode || !passkey) {
      throw new Error('Missing SHORTCODE or PASS_KEY in environment');
    }

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    return { timestamp, password };
  }

  /**
   * Initiate STK Push to user's phone
   * @param {Object} params - phoneNumber, amount, accountReference?, transactionDesc?
   * @returns {Promise<Object>}
   */
  static async initiateSTKPush({ phoneNumber, amount, accountReference = 'Test', transactionDesc = 'Payment' }) {
    const shortCode = process.env.SHORTCODE;
    const callbackBaseUrl = process.env.CALLBACK_URL;
    const callbackToken = process.env.MPESA_CALLBACK_TOKEN;

    const callbackUrl = `${callbackBaseUrl}?token=${encodeURIComponent(callbackToken)}`;

    if (!shortCode || !callbackUrl) {
      throw new Error('Missing SHORTCODE or CALLBACK_URL in environment');
    }

    try {
      const accessToken = await this.generateAccessToken();
      const { timestamp, password } = this.generatePassword();

      const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };
      console.log("Payload: ", payload);
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

      return { success: true, data: response.data };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestID - The CheckoutRequestID from the initial STK push
   * @returns {Promise<Object>}
   */
  static async querySTKPushStatus(checkoutRequestID) {
    const shortCode = process.env.SHORTCODE;

    if (!shortCode) {
      throw new Error('Missing SHORTCODE in environment');
    }

    try {
      const accessToken = await this.generateAccessToken();
      const { timestamp, password } = this.generatePassword();

      const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Query Response: ", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('STK Push query error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Poll transaction status until completion or timeout
   * @param {string} checkoutRequestID - The CheckoutRequestID from the initial STK push
   * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
   * @param {number} intervalMs - Interval between polls in milliseconds (default: 2000)
   * @returns {Promise<Object>}
   */
  static async pollTransactionStatus(checkoutRequestID, maxAttempts = 30, intervalMs = 2000) {
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts} for CheckoutRequestID: ${checkoutRequestID}`);

        const queryResult = await this.querySTKPushStatus(checkoutRequestID);
        
        if (!queryResult.success) {
          throw new Error(queryResult.error);
        }

        const { ResultCode, ResultDesc } = queryResult.data;

        // Transaction completed successfully
        if (ResultCode === "0") {
          return {
            success: true,
            status: 'completed',
            data: queryResult.data,
            message: 'Transaction completed successfully'
          };
        }

        // Transaction failed/cancelled
        if (ResultCode && ResultCode !== "0") {
          return {
            success: false,
            status: 'failed',
            data: queryResult.data,
            resultCode: ResultCode,
            message: ResultDesc || 'Transaction failed'
          };
        }

        // Still pending, continue polling if we haven't reached max attempts
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          return poll();
        }

        // Max attempts reached
        return {
          success: false,
          status: 'timeout',
          message: 'Transaction status check timed out',
          attempts
        };

      } catch (error) {
        console.error(`Polling error on attempt ${attempts}:`, error.message);
        
        // If we haven't reached max attempts, try again
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          return poll();
        }

        return {
          success: false,
          status: 'error',
          message: error.message,
          attempts
        };
      }
    };

    return poll();
  }

  /**
   * Handle callback received from M-Pesa API
   * @param {Object} callbackData
   * @returns {Object}
   */
  static handleCallback(callbackData) {
    const stkCallback = callbackData?.Body?.stkCallback;

    if (!stkCallback) {
      return { success: false, message: 'Invalid callback structure' };
    }

    if (Number(stkCallback.ResultCode) === 0) {
      // Payment success
      const metadata = stkCallback.CallbackMetadata?.Item || [];
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
          metadata,
          checkoutRequestId: stkCallback.CheckoutRequestID,
          merchantRequestID: stkCallback.MerchantRequestID,
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