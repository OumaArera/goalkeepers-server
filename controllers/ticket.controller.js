const { validationResult } = require('express-validator');
const sequelize = require('../config/sequelize');
const { Ticket, TicketRepo } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const TicketFilters = require('../filters/ticketFilters');
const TicketNumberGenerator = require('../utils/ticketNumberGenerator');
const MpesaPayment = require('../services/mpesa.service');

class TicketController {

  static async createTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();

    try {
      const { eventId, category, amount, phoneNumber, fullName, status = 'unpaid' } = req.body;

      // Generate ticket number
      const ticketNumber = await TicketNumberGenerator.generate();
      
      // Prepare ticket data
      const ticketData = {
        eventId,
        category,
        ticketNumber,
        amount,
        phoneNumber,
        fullName,
        status
      };

      // Generate security hash
      const securityHash = TicketNumberGenerator.generateSecurityHash(ticketData);
      ticketData.securityHash = securityHash;

      // Create ticket record
      const ticket = await Ticket.create(ticketData, { transaction });

      // Generate QR code
      const qrCode = await TicketNumberGenerator.generateQRCode({
        ...ticketData,
        id: ticket.id
      });

      // Update ticket with QR code
      await ticket.update({ qrCode }, { transaction });


      // Initiate M-Pesa STK Push
      const mpesaResponse = await MpesaPayment.initiateSTKPush({
        phoneNumber,
        amount,
        accountReference: ticketNumber
      });

      if (!mpesaResponse.success) {
        // M-Pesa initiation failed
        await ticket.update({
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
      
      await ticket.update({
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
        const updatedTicket = await Ticket.findByPk(ticket.id, { transaction: finalTransaction });

        if (pollResult.success && pollResult.status === 'completed') {
          // Transaction completed successfully
          await updatedTicket.update({
            paymentStatus: 'completed',
            status: "paid",
            merchantRequestID: pollResult.data.MerchantRequestID,
            statusMessage: pollResult.message
          }, { transaction: finalTransaction });

          await finalTransaction.commit();

          return res.status(201).json({
            message: 'Payment completed successfully',
            data: keysToCamel(updatedTicket.toJSON())
          });

        } else {
          // Transaction failed, cancelled, or timed out
          const failureReason = pollResult.status === 'timeout' 
            ? 'Transaction timed out' 
            : pollResult.message || 'Transaction failed';

          await updatedTicket.update({
            paymentStatus: 'failed',
            statusMessage: failureReason
          }, { transaction: finalTransaction });

          await finalTransaction.commit();

          return res.status(400).json({
            message: 'Payment failed',
            data: keysToCamel(updatedTicket.toJSON()),
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
      console.error('Create Ticket Error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Ticket number already exists',
          field: 'ticketNumber'
        });
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getTicketById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const ticket = await Ticket.findByPk(id, {
        include: [{ 
          model: TicketRepo, 
          as: 'event', 
          attributes: ['id', 'match', 'venue', 'date'] 
        }]
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({ data: camelCaseTicket });
    } catch (error) {
      console.error('Get Ticket by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getTicketByNumber(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { ticketNumber } = req.params;
      const ticket = await Ticket.findOne({ 
        where: { ticketNumber }, 
        include: [{ 
          model: TicketRepo, 
          as: 'event', 
          attributes: ['id', 'match', 'venue', 'date'] 
        }] } );

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({ data: camelCaseTicket });
    } catch (error) {
      console.error('Get Ticket by Number Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getAllTickets(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = TicketFilters.buildFilters(req.query);
      const sortOptions = TicketFilters.buildSortOptions(req.query);

      const { rows, count } = await Ticket.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
        include: [{
          model: TicketRepo,
          as: 'event',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        }],
      });

      const formatted = rows.map(ticket => keysToCamel(ticket.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Tickets Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async updateTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Fields that should not be manually updated
    delete updateData.id;
    delete updateData.eventId;
    delete updateData.ticketNumber;
    delete updateData.securityHash;
    delete updateData.qrCode;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const transaction = await sequelize.transaction();

    try {
      // Fetch the current ticket
      const existingTicket = await Ticket.findByPk(id, { transaction });
      if (!existingTicket) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Update ticket
      const [updated] = await Ticket.update(updateData, { where: { id }, transaction });
      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not updated' });
      }

      const updatedTicket = await Ticket.findByPk(id, { transaction });
      
      // If critical data changed, regenerate hash and QR code
      const criticalFields = ['category', 'amount', 'phoneNumber', 'fullName', 'status'];
      const criticalDataChanged = criticalFields.some(field => 
        updateData.hasOwnProperty(field) && updateData[field] !== existingTicket[field]
      );

      if (criticalDataChanged) {
        const newHash = TicketNumberGenerator.generateSecurityHash(updatedTicket.toJSON());
        const newQrCode = await TicketNumberGenerator.generateQRCode({
          ...updatedTicket.toJSON(),
          securityHash: newHash
        });

        await updatedTicket.update({
          securityHash: newHash,
          qrCode: newQrCode
        }, { transaction });
      }

      await transaction.commit();

      const camelCaseTicket = keysToCamel(updatedTicket.toJSON());
      return res.status(200).json({
        message: 'Ticket updated successfully',
        data: camelCaseTicket
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Update Ticket Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async deleteTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await Ticket.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Delete Ticket Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async verifyTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { ticketNumber, securityHash } = req.body;
      
      const ticket = await Ticket.findOne({
        where: { ticketNumber },
        include: [{
          model: TicketRepo,
          as: 'event',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        }],
      });

      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found',
          valid: false 
        });
      }

      if (securityHash){
        const isValid = TicketNumberGenerator.verifyTicketHash(ticket.toJSON(), securityHash);
        if (!isValid) {
          return res.status(400).json({ 
            message: 'Invalid ticket hash',
            valid: false 
          });
        }
      }

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({
        message: 'Ticket verified successfully',
        valid: true,
        data: camelCaseTicket
      });

    } catch (error) {
      console.error('Verify Ticket Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async scanTicket(req, res) {
    try {
      const { qrData } = req.body;
      
      if (!qrData) {
        return res.status(400).json({ message: 'QR data is required' });
      }

      let ticketData;
      try {
        ticketData = JSON.parse(qrData);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid QR code format' });
      }

      const { ticketNumber, hash } = ticketData;

      if (!ticketNumber || !hash) {
        return res.status(400).json({ message: 'Invalid QR code data' });
      }

      const ticket = await Ticket.findOne({ where: { ticketNumber } });

      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found',
          valid: false 
        });
      }

      const isValid = TicketNumberGenerator.verifyTicketHash(ticket.toJSON(), hash);

      if (!isValid) {
        return res.status(400).json({ 
          message: 'Invalid ticket - security verification failed',
          valid: false 
        });
      }

      // Check if ticket can be used
      if (ticket.status === 'used') {
        return res.status(400).json({ 
          message: 'Ticket has already been used',
          valid: true,
          used: true,
          data: keysToCamel(ticket.toJSON())
        });
      }

      if (ticket.status === 'revoked') {
        return res.status(400).json({ 
          message: 'Ticket has been revoked',
          valid: true,
          revoked: true,
          data: keysToCamel(ticket.toJSON())
        });
      }

      if (ticket.status !== 'active') {
        return res.status(400).json({ 
          message: `Ticket is not active (status: ${ticket.status})`,
          valid: true,
          active: false,
          data: keysToCamel(ticket.toJSON())
        });
      }

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({
        message: 'Ticket is valid and ready to use',
        valid: true,
        active: true,
        data: camelCaseTicket
      });

    } catch (error) {
      console.error('Scan Ticket Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async useTicket(req, res) {
    const { id } = req.params;

    const transaction = await sequelize.transaction();

    try {
      const ticket = await Ticket.findByPk(id, { transaction });

      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.status !== 'active') {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Cannot use ticket with status: ${ticket.status}`,
          currentStatus: ticket.status
        });
      }

      await ticket.update({ status: 'used' }, { transaction });
      await transaction.commit();

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({
        message: 'Ticket marked as used successfully',
        data: camelCaseTicket
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Use Ticket Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = TicketController;