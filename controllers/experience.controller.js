const { body, validationResult } = require('express-validator');
const { Experience } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class ExperienceController {
  static validationRules() {
    return [
      body('goalkeeperId')
        .isUUID()
        .withMessage('Valid goalkeeperId is required'),
      body('leagueName')
        .isString()
        .notEmpty()
        .withMessage('League name is required'),
      body('appearances')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Appearances must be a non-negative integer'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createExperience(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { goalkeeperId, leagueName, appearances = 0 } = req.body;

      const record = await Experience.create({
        goalkeeperId,
        leagueName,
        appearances,
      });

      return res.status(201).json(record);
    } catch (error) {
      console.error('Create Experience Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getExperiences(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = ExperienceController.buildFilters(req.query);

      const { rows, count } = await Experience.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get Experiences Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getExperienceById(req, res) {
    try {
      const { id } = req.params;
      const record = await Experience.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      return res.json(record);
    } catch (error) {
      console.error('Get Experience by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateExperience(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { leagueName, appearances } = req.body;

      const payload = {};
      if (leagueName !== undefined) payload.leagueName = leagueName;
      if (appearances !== undefined) payload.appearances = appearances;

      if (Object.keys(payload).length === 0) {
        return res
          .status(400)
          .json({ message: 'No valid fields provided for update.' });
      }

      const [updated] = await Experience.update(payload, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      const updatedRecord = await Experience.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update Experience Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = ExperienceController;
