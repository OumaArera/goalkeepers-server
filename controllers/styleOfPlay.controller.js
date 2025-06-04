const { body, validationResult } = require('express-validator');
const { StyleOfPlay } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class StyleOfPlayController {
  static validationRules() {
    return [
      body('goalkeeperId')
        .isUUID()
        .withMessage('Valid goalkeeperId is required'),
      body('style')
        .isString()
        .notEmpty()
        .withMessage('Style description is required'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createStyleOfPlay(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { goalkeeperId, style } = req.body;

      const record = await StyleOfPlay.create({
        goalkeeperId,
        style,
      });

      return res.status(201).json(record);
    } catch (error) {
      console.error('Create StyleOfPlay Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getStylesOfPlay(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = StyleOfPlayController.buildFilters(req.query);

      const { rows, count } = await StyleOfPlay.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get StylesOfPlay Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getStyleOfPlayById(req, res) {
    try {
      const { id } = req.params;
      const record = await StyleOfPlay.findByPk(id);

      if (!record) {
        return res.status(404).json({ message: 'Style of Play not found' });
      }

      return res.json(record);
    } catch (error) {
      console.error('Get StyleOfPlay by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateStyleOfPlay(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { style } = req.body;

      if (!style) {
        return res.status(400).json({ message: 'Style is required for update' });
      }

      const [updated] = await StyleOfPlay.update({ style }, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Style of Play not found' });
      }

      const updatedRecord = await StyleOfPlay.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update StyleOfPlay Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = StyleOfPlayController;
