const { body, validationResult } = require('express-validator');
const { HonorsAndAwards } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class HonorsAndAwardsController {
  static validationRules() {
    return [
      body('goalkeeperId')
        .isUUID()
        .withMessage('Valid goalkeeperId is required'),
      body('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required'),
      body('monthAwarded')
        .isString()
        .notEmpty()
        .withMessage('Month awarded is required'),
      body('season')
        .isString()
        .notEmpty()
        .withMessage('Season is required'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    if (query.season) filters.season = query.season;
    return filters;
  }

  static async createHonor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { goalkeeperId, title, monthAwarded, season } = req.body;

      const honor = await HonorsAndAwards.create({
        goalkeeperId,
        title,
        monthAwarded,
        season,
      });

      return res.status(201).json(honor);
    } catch (error) {
      console.error('Create Honor Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getHonors(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = HonorsAndAwardsController.buildFilters(req.query);

      const { rows, count } = await HonorsAndAwards.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const result = getPagingData(rows, count, page, limit);
      return res.json(result);
    } catch (error) {
      console.error('Get Honors Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getHonorById(req, res) {
    try {
      const { id } = req.params;
      const honor = await HonorsAndAwards.findByPk(id);

      if (!honor) {
        return res.status(404).json({ message: 'Honor not found' });
      }

      return res.json(honor);
    } catch (error) {
      console.error('Get Honor By ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateHonor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, monthAwarded, season } = req.body;

      const [updated] = await HonorsAndAwards.update(
        { title, monthAwarded, season },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Honor not found' });
      }

      const updatedHonor = await HonorsAndAwards.findByPk(id);
      return res.json(updatedHonor);
    } catch (error) {
      console.error('Update Honor Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteHonor(req, res) {
    try {
      const { id } = req.params;

      const deleted = await HonorsAndAwards.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Honor not found' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Delete Honor Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = HonorsAndAwardsController;
