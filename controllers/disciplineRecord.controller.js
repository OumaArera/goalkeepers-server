const { body, validationResult } = require('express-validator');
const { DisciplineRecords } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class DisciplineRecordsController {
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('yellowCards').isInt({ min: 0 }).withMessage('yellowCards must be a non-negative integer'),
      body('redCards').isInt({ min: 0 }).withMessage('redCards must be a non-negative integer'),
      body('fouls').isInt({ min: 0 }).withMessage('fouls must be a non-negative integer'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createRecord(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { goalkeeperId, yellowCards, redCards, fouls } = req.body;
      const record = await DisciplineRecords.create({ goalkeeperId, yellowCards, redCards, fouls });
      return res.status(201).json(record);
    } catch (error) {
      console.error('Create DisciplineRecord Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getRecords(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = DisciplineRecordsController.buildFilters(req.query);

      const { rows, count } = await DisciplineRecords.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get DisciplineRecords Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getRecordById(req, res) {
    try {
      const { id } = req.params;
      const record = await DisciplineRecords.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: 'Discipline Record not found' });
      }
      return res.json(record);
    } catch (error) {
      console.error('Get DisciplineRecord by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateRecord(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { yellowCards, redCards, fouls } = req.body;

      const [updated] = await DisciplineRecords.update({ yellowCards, redCards, fouls }, { where: { id } });
      if (!updated) {
        return res.status(404).json({ message: 'Discipline Record not found' });
      }
      const updatedRecord = await DisciplineRecords.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update DisciplineRecord Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = DisciplineRecordsController;