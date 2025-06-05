const { validationResult } = require('express-validator');
const { League } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const LeagueFilters = require('../filters/leagueFilters');

class LeagueController {
  
  static async createLeague(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const leagueData = { ...req.body };

      const newLeague = await League.create(leagueData);
      return res.status(201).json({ 
        message: 'League created successfully', 
        leagueId: newLeague.id 
      });
    } catch (error) {
      console.error('Create League Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'League with this name already exists in this country',
          field: 'name'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getLeagueById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const league = await League.findByPk(id);

      if (!league) {
        return res.status(404).json({ message: 'League not found' });
      }

      const camelCaseLeague = keysToCamel(league.toJSON());
      return res.status(200).json({ data: camelCaseLeague });
    } catch (error) {
      console.error('Get League by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllLeagues(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = LeagueFilters.buildFilters(req.query);
      const sortOptions = LeagueFilters.buildSortOptions(req.query);

      const { rows, count } = await League.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
      });

      const formatted = rows.map(league => keysToCamel(league.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Leagues Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateLeague(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const [updated] = await League.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'League not found' });
      }

      const updatedLeague = await League.findByPk(id);
      const camelCaseLeague = keysToCamel(updatedLeague.toJSON());
      
      return res.status(200).json({
        message: 'League updated successfully',
        data: camelCaseLeague
      });
    } catch (error) {
      console.error('Update League Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'League with this name already exists in this country',
          field: 'name'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteLeague(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await League.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'League not found' });
      }

      return res.status(200).json({ message: 'League deleted successfully' });
    } catch (error) {
      console.error('Delete League Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = LeagueController;