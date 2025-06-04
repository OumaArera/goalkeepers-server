const { body, validationResult } = require('express-validator');
const { DefensiveStats } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class DefensiveStatsController {
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('cleanSheets').isInt({ min: 0 }).withMessage('Clean sheets must be a non-negative integer'),
      body('goalsConceded').isInt({ min: 0 }).withMessage('Goals conceded must be a non-negative integer'),
      body('errorsLeadingToGoal').isInt({ min: 0 }).withMessage('Errors leading to goal must be a non-negative integer'),
      body('ownGoals').isInt({ min: 0 }).withMessage('Own goals must be a non-negative integer'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createStats(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const record = await DefensiveStats.create(req.body);
      return res.status(201).json(record);
    } catch (error) {
      console.error('Create DefensiveStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getStats(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = DefensiveStatsController.buildFilters(req.query);

      const { rows, count } = await DefensiveStats.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return res.json(getPagingData(rows, count, page, limit));
    } catch (error) {
      console.error('Get DefensiveStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getStatsById(req, res) {
    try {
      const { id } = req.params;
      const record = await DefensiveStats.findByPk(id);
      if (!record) return res.status(404).json({ message: 'Defensive stats not found' });
      return res.json(record);
    } catch (error) {
      console.error('Get DefensiveStats by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateStats(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const [updated] = await DefensiveStats.update(req.body, { where: { id } });

      if (!updated) return res.status(404).json({ message: 'Defensive stats not found' });

      const updatedRecord = await DefensiveStats.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update DefensiveStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = DefensiveStatsController;