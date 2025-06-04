const { body, validationResult } = require('express-validator');
const { GoalkeepingStats } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class GoalkeepingStatsController {
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('saves').optional().isInt({ min: 0 }).withMessage('Saves must be a non-negative integer'),
      body('penaltiesSaved').optional().isInt({ min: 0 }).withMessage('Penalties saved must be a non-negative integer'),
      body('punches').optional().isInt({ min: 0 }).withMessage('Punches must be a non-negative integer'),
      body('highClaims').optional().isInt({ min: 0 }).withMessage('High claims must be a non-negative integer'),
      body('catches').optional().isInt({ min: 0 }).withMessage('Catches must be a non-negative integer'),
      body('sweeperClearances').optional().isInt({ min: 0 }).withMessage('Sweeper clearances must be a non-negative integer'),
      body('throwOuts').optional().isInt({ min: 0 }).withMessage('Throw outs must be a non-negative integer'),
      body('goalKicks').optional().isInt({ min: 0 }).withMessage('Goal kicks must be a non-negative integer'),
    ];
  }

  static buildFilters(query) {
    const filters = {};
    if (query.goalkeeperId) filters.goalkeeperId = query.goalkeeperId;
    return filters;
  }

  static async createGoalkeepingStats(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        goalkeeperId,
        saves = 0,
        penaltiesSaved = 0,
        punches = 0,
        highClaims = 0,
        catches = 0,
        sweeperClearances = 0,
        throwOuts = 0,
        goalKicks = 0,
      } = req.body;

      const record = await GoalkeepingStats.create({
        goalkeeperId,
        saves,
        penaltiesSaved,
        punches,
        highClaims,
        catches,
        sweeperClearances,
        throwOuts,
        goalKicks,
      });

      return res.status(201).json(record);
    } catch (error) {
      console.error('Create Goalkeeping Stats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getGoalkeepingStats(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = GoalkeepingStatsController.buildFilters(req.query);

      const { rows, count } = await GoalkeepingStats.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get Goalkeeping Stats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getGoalkeepingStatsById(req, res) {
    try {
      const { id } = req.params;
      const record = await GoalkeepingStats.findByPk(id);
      if (!record) return res.status(404).json({ message: 'Goalkeeping Stats not found' });
      return res.json(record);
    } catch (error) {
      console.error('Get Goalkeeping Stats by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateGoalkeepingStats(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        saves,
        penaltiesSaved,
        punches,
        highClaims,
        catches,
        sweeperClearances,
        throwOuts,
        goalKicks,
      } = req.body;

      const payload = {};
      if (saves !== undefined) payload.saves = saves;
      if (penaltiesSaved !== undefined) payload.penaltiesSaved = penaltiesSaved;
      if (punches !== undefined) payload.punches = punches;
      if (highClaims !== undefined) payload.highClaims = highClaims;
      if (catches !== undefined) payload.catches = catches;
      if (sweeperClearances !== undefined) payload.sweeperClearances = sweeperClearances;
      if (throwOuts !== undefined) payload.throwOuts = throwOuts;
      if (goalKicks !== undefined) payload.goalKicks = goalKicks;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
      }

      const [updated] = await GoalkeepingStats.update(payload, { where: { id } });
      if (!updated) return res.status(404).json({ message: 'Goalkeeping Stats not found' });

      const updatedRecord = await GoalkeepingStats.findByPk(id);
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Update Goalkeeping Stats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = GoalkeepingStatsController;
