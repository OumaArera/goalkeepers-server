const { validationResult } = require('express-validator');
const { TicketRepo, TicketCategory } = require('../models');
const { uploadFilesToDrive } = require('../services/googleDrive.service');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const TicketRepoFilters = require('../filters/ticketRepoFilters');

class TicketController {
  
  static async createTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ticketData = { ...req.body };

      // Handle image upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      // Prepare final ticket data
      const newTicketData = {
        ...ticketData,
        imageUrl,
      };

      const ticket = await TicketRepo.create(newTicketData);
      return res.status(201).json({ 
        message: 'Ticket created successfully', 
        ticketId: ticket.id 
      });
    } catch (error) {
      console.error('Create Ticket Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getTicketById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const ticket = await TicketRepo.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
          model: TicketCategory,
          as: 'categories',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        }],
    });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const camelCaseTicket = keysToCamel(ticket.toJSON());
      return res.status(200).json({ data: camelCaseTicket });
    } catch (error) {
      console.error('Get Ticket by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllTickets(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = TicketRepoFilters.buildFilters(req.query);
      const sortOptions = TicketRepoFilters.buildSortOptions(req.query);

      const { rows, count } = await TicketRepo.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
          model: TicketCategory,
          as: 'categories',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        }],
      });

      const formatted = rows.map(ticket => keysToCamel(ticket.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Tickets Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Handle image upload if new image is provided
      const file = req.file;
      if (file) {
        const imageUrls = await uploadFilesToDrive([file]);
        updateData.imageUrl = imageUrls[0];
      }

      const [updated] = await TicketRepo.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const updatedTicket = await TicketRepo.findByPk(id);
      const camelCaseTicket = keysToCamel(updatedTicket.toJSON());
      
      return res.status(200).json({
        message: 'Ticket updated successfully',
        data: camelCaseTicket
      });
    } catch (error) {
      console.error('Update Ticket Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await TicketRepo.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Delete Ticket Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = TicketController;