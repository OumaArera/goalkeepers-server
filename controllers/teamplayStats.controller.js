const { body, validationResult } = require('express-validator');
const { TeamplayStats } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

class TeamplayStatsController {
  // Validation rules for creating or updating stats
  static validationRules() {
    return [
      body('goalkeeperId').isUUID().withMessage('Valid goalkeeperId is required'),
      body('goals').optional().isInt({ min: 0 }),
      body('assists').optional().isInt({ min: 0 }),
      body('passes').optional().isInt({ min: 0 }),
      body('passesPerMatch').optional().isDecimal(),
      body('accurateLongBalls').optional().isInt({ min: 0 }),
    ];
  }

  // Create new TeamplayStats record
  static async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        goalkeeperId,
        goals,
        assists,
        passes,
        passesPerMatch,
        accurateLongBalls,
      } = req.body;

      const stats = await TeamplayStats.create({
        goalkeeperId,
        goals,
        assists,
        passes,
        passesPerMatch,
        accurateLongBalls,
      });

      return res.status(201).json(stats);
    } catch (error) {
      console.error('Create TeamplayStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  // Get all TeamplayStats (paginated, filtered by goalkeeperId optionally)
  static async getAll(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = {};

      if (req.query.goalkeeperId) {
        filters.goalkeeperId = req.query.goalkeeperId;
      }

      const { rows, count } = await TeamplayStats.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get All TeamplayStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  // Get a single TeamplayStats by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const stats = await TeamplayStats.findByPk(id);
      if (!stats) {
        return res.status(404).json({ message: 'TeamplayStats not found' });
      }

      return res.json(stats);
    } catch (error) {
      console.error('Get TeamplayStats By ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  // Update TeamplayStats by ID
  static async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        goals,
        assists,
        passes,
        passesPerMatch,
        accurateLongBalls,
      } = req.body;

      const payload = {};
      if (goals !== undefined) payload.goals = goals;
      if (assists !== undefined) payload.assists = assists;
      if (passes !== undefined) payload.passes = passes;
      if (passesPerMatch !== undefined) payload.passesPerMatch = passesPerMatch;
      if (accurateLongBalls !== undefined) payload.accurateLongBalls = accurateLongBalls;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
      }

      const [updated] = await TeamplayStats.update(payload, {
        where: { id },
      });

      if (!updated) {
        return res.status(404).json({ message: 'TeamplayStats not found' });
      }

      const updatedStats = await TeamplayStats.findByPk(id);
      return res.json(updatedStats);
    } catch (error) {
      console.error('Update TeamplayStats Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = TeamplayStatsController;
