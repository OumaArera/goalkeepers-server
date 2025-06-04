const { body, validationResult } = require('express-validator');
const { FormerClub } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class FormerClubController {
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('name').isString().notEmpty().withMessage('Club name is required'),
      body('country').isString().notEmpty().withMessage('Country is required'),
      body('league').isString().notEmpty().withMessage('League is required'),
      body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
      body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createFormerClub(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { goalkeeperId, name, country, league, startDate, endDate } = req.body;

      const club = await FormerClub.create({
        goalkeeperId,
        name,
        country,
        league,
        startDate,
        endDate,
      });

      return res.status(201).json(club);
    } catch (error) {
      console.error('Create FormerClub Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getFormerClubs(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = FormerClubController.buildFilters(req.query);

      const { rows, count } = await FormerClub.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['startDate', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get FormerClubs Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getFormerClubById(req, res) {
    try {
      const { id } = req.params;
      const club = await FormerClub.findByPk(id);

      if (!club) {
        return res.status(404).json({ message: 'Former club not found' });
      }

      return res.json(club);
    } catch (error) {
      console.error('Get FormerClub by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateFormerClub(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;

      const [updated] = await FormerClub.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Former club not found' });
      }

      const updatedClub = await FormerClub.findByPk(id);
      return res.json(updatedClub);
    } catch (error) {
      console.error('Update FormerClub Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = FormerClubController;