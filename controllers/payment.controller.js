const { validationResult } = require('express-validator');
const sequelize = require('../config/sequelize');
const { Payment, Order, Item } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const PaymentFilters = require('../filters/paymentFilters');
const ReferenceNumberGenerator = require('../utils/transactionNumber');
const MpesaPayment = require('../services/mpesa.service');

class PaymentController {

  static async createPayment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();

    try {
      const { orderId, amount, phoneNumber } = req.body;

      // Verify the order exists
      const order = await Order.findByPk(orderId, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Order not found' });
      }

      // Generate reference number
      const reference = await ReferenceNumberGenerator.generate();
      // Create payment record
      const paymentData = {
        orderId,
        amount,
        phoneNumber,
        reference: order.orderNumber,
        paymentStatus: 'pending'
      };

      const payment = await Payment.create(paymentData, { transaction });

      // Initiate M-Pesa STK Push
      const mpesaResponse = await MpesaPayment.initiateSTKPush({
        phoneNumber,
        amount,
        accountReference: reference
      });

      if (!mpesaResponse.success) {
        // M-Pesa initiation failed
        await payment.update({
          paymentStatus: 'failed',
          statusMessage: JSON.stringify(mpesaResponse.error)
        }, { transaction });

        await transaction.commit();

        return res.status(400).json({
          message: 'Payment initiation failed',
          data: keysToCamel(payment.toJSON()),
          error: mpesaResponse.error
        });
      }

      // Update payment with M-Pesa response
      const statusMessage = mpesaResponse.data.CustomerMessage;
      const checkoutRequestID = mpesaResponse.data.CheckoutRequestID;
      
      await payment.update({
        statusMessage: JSON.stringify(statusMessage),
        checkoutRequestId: checkoutRequestID,
      }, { transaction });

      await transaction.commit();

      // Start polling for transaction status
      // console.log('Starting transaction status polling...');
      const pollResult = await MpesaPayment.pollTransactionStatus(checkoutRequestID);

      // Start a new transaction for updating the final status
      const finalTransaction = await sequelize.transaction();

      try {
        // Refresh payment instance
        const updatedPayment = await Payment.findByPk(payment.id, { transaction: finalTransaction });

        if (pollResult.success && pollResult.status === 'completed') {
          // Transaction completed successfully
          await updatedPayment.update({
            paymentStatus: 'completed',
            merchantRequestID: pollResult.data.MerchantRequestID,
            statusMessage: pollResult.message
          }, { transaction: finalTransaction });

          await finalTransaction.commit();

          return res.status(201).json({
            message: 'Payment completed successfully',
            data: keysToCamel(updatedPayment.toJSON())
          });

        } else {
          // Transaction failed, cancelled, or timed out
          const failureReason = pollResult.status === 'timeout' 
            ? 'Transaction timed out' 
            : pollResult.message || 'Transaction failed';

          await updatedPayment.update({
            paymentStatus: 'failed',
            statusMessage: failureReason
          }, { transaction: finalTransaction });

          await finalTransaction.commit();

          return res.status(400).json({
            message: 'Payment failed',
            data: keysToCamel(updatedPayment.toJSON()),
            error: failureReason,
            status: pollResult.status
          });
        }

      } catch (finalError) {
        await finalTransaction.rollback();
        console.error('Final transaction update error:', finalError);
        
        return res.status(500).json({
          message: 'Payment status uncertain - please check with support',
          error: finalError.message,
          paymentId: payment.id
        });
      }

    } catch (error) {
      await transaction.rollback();
      console.error('Create Payment Error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Reference number already exists',
          field: 'reference'
        });
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }


  static async getPaymentById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id, {
        include: [{
          model: Order,
          as: 'order'
        }]
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      const camelCasePayment = keysToCamel(payment.toJSON());
      return res.status(200).json({ data: camelCasePayment });
    } catch (error) {
      console.error('Get Payment by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllPayments(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = PaymentFilters.buildFilters(req.query);
      const sortOptions = PaymentFilters.buildSortOptions(req.query);

      const { rows, count } = await Payment.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
        include: [{
          model: Order,
          as: 'order'
        }]
      });

      const formatted = rows.map(payment => keysToCamel(payment.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Payments Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updatePayment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Fields that should not be manually updated
    delete updateData.id;
    delete updateData.orderId;
    delete updateData.reference;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const transaction = await sequelize.transaction();

    try {
      // Fetch the current payment
      const existingPayment = await Payment.findByPk(id, { transaction });
      if (!existingPayment) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Update payment
      const [updated] = await Payment.update(updateData, { where: { id }, transaction });
      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Payment not updated' });
      }

      const updatedPayment = await Payment.findByPk(id, { 
        transaction,
        include: [{
          model: Order,
          as: 'order'
        }]
      });
      await transaction.commit();

      const camelCasePayment = keysToCamel(updatedPayment.toJSON());
      return res.status(200).json({
        message: 'Payment updated successfully',
        data: camelCasePayment
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Update Payment Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deletePayment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await Payment.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      return res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
      console.error('Delete Payment Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

   static async handleMpesaCallback(req, res) {
    try {
      const callbackData = req.body;
      const result = MpesaPayment.handleCallback(callbackData);

      if (result.success) {
        // Find payment by phone number and update
        const payment = await Payment.findOne({
          where: {
            phoneNumber: result.transaction.phone,
            amount: result.transaction.amount,
            checkoutRequestId: result.transaction.checkoutRequestID || null,
            merchantRequestID: result.transaction.merchantRequestID || null,
          },
          order: [['createdAt', 'DESC']]
        });

        if (payment) {
          await payment.update({
            transactionId: result.transaction.receipt,
            statusMessage: 'Payment completed successfully',
            metadata: {
              ...payment.metadata,
              callback: result.transaction
            }
          });
        }

        return res.status(200).json({ message: 'Callback processed successfully' });
      } else {
        // Handle failed payment
        return res.status(200).json({ message: 'Payment failed', result });
      }
    } catch (error) {
      console.error('M-Pesa Callback Error:', error);
      return res.status(500).json({ message: 'Callback processing failed', error });
    }
  }

}

module.exports = PaymentController;