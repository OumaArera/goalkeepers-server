const { validationResult } = require('express-validator');
const { TicketCategory, TicketRepo } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const TicketCategoryFilters = require('../filters/ticketCategoryFilters');

class TicketCategoryController {
  
  static async createTicketCategory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const categoryData = { ...req.body };

      // Verify that the TicketRepo exists
      const ticketRepo = await TicketRepo.findByPk(categoryData.ticketRepoId);
      if (!ticketRepo) {
        return res.status(404).json({ message: 'Ticket repository not found' });
      }

      // Check if category already exists for this ticket repo
      const existingCategory = await TicketCategory.findOne({
        where: {
          ticketRepoId: categoryData.ticketRepoId,
          category: categoryData.category
        }
      });

      if (existingCategory) {
        return res.status(409).json({ 
          message: `Category '${categoryData.category}' already exists for this event` 
        });
      }

      const ticketCategory = await TicketCategory.create(categoryData);
      return res.status(201).json({ 
        message: 'Ticket category created successfully', 
        ticketCategoryId: ticketCategory.id 
      });
    } catch (error) {
      console.error('Create Ticket Category Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getTicketCategoryById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const ticketCategory = await TicketCategory.findByPk(id, {
        include: [{ 
          model: TicketRepo, 
          as: 'event', 
          attributes: ['id', 'match', 'venue', 'date'] 
        }]
      });

      if (!ticketCategory) {
        return res.status(404).json({ message: 'Ticket category not found' });
      }

      const camelCaseCategory = keysToCamel(ticketCategory.toJSON());
      return res.status(200).json({ data: camelCaseCategory });
    } catch (error) {
      console.error('Get Ticket Category by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllTicketCategories(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = TicketCategoryFilters.buildFilters(req.query);
      const sortOptions = TicketCategoryFilters.buildSortOptions(req.query);

      const { rows, count } = await TicketCategory.findAndCountAll({
        where: filters,
        include: [
          {
            model: TicketRepo,
            as: 'event',
            attributes: ['id', 'match', 'venue', 'date'],
          },
        ],
        limit,
        offset,
        order: sortOptions,
      });

      const formatted = rows.map(category => keysToCamel(category.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Ticket Categories Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }


  static async updateTicketCategory(req, res) {
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

      // If updating ticketRepoId, verify it exists
      if (updateData.ticketRepoId) {
        const ticketRepo = await TicketRepo.findByPk(updateData.ticketRepoId);
        if (!ticketRepo) {
          return res.status(404).json({ message: 'Ticket repository not found' });
        }
      }

      // If updating category, check for duplicates
      if (updateData.category) {
        const currentCategory = await TicketCategory.findByPk(id);
        if (!currentCategory) {
          return res.status(404).json({ message: 'Ticket category not found' });
        }

        const ticketRepoId = updateData.ticketRepoId || currentCategory.ticketRepoId;
        const existingCategory = await TicketCategory.findOne({
          where: {
            ticketRepoId,
            category: updateData.category,
            id: { [require('sequelize').Op.ne]: id }
          }
        });

        if (existingCategory) {
          return res.status(409).json({ 
            message: `Category '${updateData.category}' already exists for this event` 
          });
        }
      }

      const [updated] = await TicketCategory.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Ticket category not found' });
      }

      const updatedCategory = await TicketCategory.findByPk(id, {
        include: [{ 
          model: TicketRepo, 
          as: 'event', 
          attributes: ['id', 'match', 'venue', 'date'] 
        }]
      });

      const camelCaseCategory = keysToCamel(updatedCategory.toJSON());
      return res.status(200).json({
        message: 'Ticket category updated successfully',
        data: camelCaseCategory
      });
    } catch (error) {
      console.error('Update Ticket Category Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteTicketCategory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await TicketCategory.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Ticket category not found' });
      }

      return res.status(200).json({ message: 'Ticket category deleted successfully' });
    } catch (error) {
      console.error('Delete Ticket Category Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

}

module.exports = TicketCategoryController;