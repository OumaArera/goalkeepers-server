const { body, validationResult } = require('express-validator');
const { KplRecord } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class KplRecordController {
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('club').notEmpty().withMessage('Club is required'),
      body('position').notEmpty().withMessage('Position is required'),
      body('appearances').optional().isInt({ min: 0 }).withMessage('Appearances must be a non-negative integer'),
      body('cleanSheets').optional().isInt({ min: 0 }).withMessage('Clean sheets must be a non-negative integer'),
      body('goals').optional().isInt({ min: 0 }).withMessage('Goals must be a non-negative integer'),
      body('assists').optional().isInt({ min: 0 }).withMessage('Assists must be a non-negative integer'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    if (query.club) filters.club = query.club;
    if (query.position) filters.position = query.position;
    return filters;
  }

  static async createKplRecord(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        goalkeeperId,
        club,
        position,
        appearances = 0,
        cleanSheets = 0,
        goals = 0,
        assists = 0,
      } = req.body;

      const record = await KplRecord.create({
        goalkeeperId,
        club,
        position,
        appearances,
        cleanSheets,
        goals,
        assists,
      });

      return res.status(201).json(record);
    } catch (error) {
      console.error('Create KPL Record Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getKplRecords(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = KplRecordController.buildFilters(req.query);

      const { rows, count } = await KplRecord.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get KPL Records Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getKplRecordById(req, res) {
    try {
      const { id } = req.params;
      const record = await KplRecord.findByPk(id);
      if (!record) return res.status(404).json({ message: 'KPL Record not found' });
      return res.json(record);
    } catch (error) {
      console.error('Get KPL Record by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateKplRecord(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        club,
        position,
        appearances,
        cleanSheets,
        goals,
        assists,
      } = req.body;

      const payload = {};
      if (club) payload.club = club;
      if (position) payload.position = position;
      if (appearances !== undefined) payload.appearances = appearances;
      if (cleanSheets !== undefined) payload.cleanSheets = cleanSheets;
      if (goals !== undefined) payload.goals = goals;
      if (assists !== undefined) payload.assists = assists;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
      }

      const [updated] = await KplRecord.update(payload, { where: { id } });
      if (!updated) return res.status(404).json({ message: 'KPL Record not found' });

      const updatedRecord = await KplRecord.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update KPL Record Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = KplRecordController;
