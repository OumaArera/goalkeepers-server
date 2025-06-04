const { Op } = require('sequelize');
const { validationResult, body } = require('express-validator');
const sequelize = require('../config/sequelize');
const {
  Goalkeeper,
  TeamplayStats,
  KplRecord,
  GoalkeepingStats,
  Experience,
  StyleOfPlay,
  HonorsAndAwards,
  DefensiveStats,
  FormerClub,
  DisciplineRecords,
  User
} = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { uploadFilesToDrive } = require('../services/googleDrive.service');

class GoalkeeperController {
  static validationRules() {
    return [
      body('userId').isUUID().withMessage('Valid userId is required'),
      body('height').optional().isDecimal(),
      body('weight').optional().isDecimal(),
      body('favoriteFoot').optional().isIn(['Right', 'Left', 'Both']),
      body('jersey').optional().isInt(),
      body('internationalCaps').optional().isInt(),
      body('imageUrl').optional().isURL(),
    ];
  }

  static async createGoalkeeper(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, height, weight, favoriteFoot, jersey, internationalCaps } = req.body;

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      const payload = {
        userId,
        height,
        weight,
        favoriteFoot,
        jersey,
        internationalCaps,
        imageUrl,
      };

      const goalkeeper = await Goalkeeper.create(payload);
      return res.status(201).json(goalkeeper);
    } catch (error) {
      console.error('Create Goalkeeper Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getGoalkeepers(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = GoalkeeperController.buildFilters(req.query);

      const { rows, count } = await Goalkeeper.findAndCountAll({
        where: filters,
        include: [
          { 
            model: TeamplayStats, 
            as: 'teamplayStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] },
          },
          { 
            model: KplRecord, 
            as: 'kplRecords',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: GoalkeepingStats, 
            as: 'goalkeepingStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: Experience, as: 
            'experiences',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: StyleOfPlay, 
            as: 'stylesOfPlay',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: HonorsAndAwards, 
            as: 'honorsAndAwards',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: DefensiveStats, 
            as: 'defensiveStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: FormerClub, 
            as: 'formerClubs',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: DisciplineRecords, 
            as: 'disciplineRecords',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password', 'id', 'role', 'department', 'status', 'avatar', 'createdAt', 'modifiedAt'] },
            required: false
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'ASC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get Goalkeepers Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }


  static async getGoalkeeperById(req, res) {
    try {
      const { id } = req.params;
      const goalkeeper = await Goalkeeper.findByPk(id, {
        include: [
          { 
            model: TeamplayStats, 
            as: 'teamplayStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] },
          },
          { 
            model: KplRecord, 
            as: 'kplRecords',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: GoalkeepingStats, 
            as: 'goalkeepingStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: Experience, as: 
            'experiences',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: StyleOfPlay, 
            as: 'stylesOfPlay',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: HonorsAndAwards, 
            as: 'honorsAndAwards',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: DefensiveStats, 
            as: 'defensiveStats',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: FormerClub, 
            as: 'formerClubs',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          { 
            model: DisciplineRecords, 
            as: 'disciplineRecords',
            attributes: { exclude: ['goalkeeperId', 'createdAt', 'updatedAt'] }, 
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password', 'id', 'role', 'department', 'status', 'avatar', 'createdAt', 'modifiedAt'] },
            required: false
          }
        ]
      });

      if (!goalkeeper) return res.status(404).json({ message: 'Goalkeeper not found' });

      return res.json(goalkeeper);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateGoalkeeper(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        userId,
        height,
        weight,
        favoriteFoot,
        jersey,
        internationalCaps,
      } = req.body;

      const file = req.file;
      let imageUrl;

      // Upload image if provided
      if (file) {
        const imageUrls = await uploadFilesToDrive([file]);
        imageUrl = imageUrls[0];
      }

      // Build dynamic update payload
      const payload = {};
      if (userId) payload.userId = userId;
      if (height) payload.height = height;
      if (weight) payload.weight = weight;
      if (favoriteFoot) payload.favoriteFoot = favoriteFoot;
      if (jersey) payload.jersey = jersey;
      if (internationalCaps) payload.internationalCaps = internationalCaps;
      if (imageUrl) payload.imageUrl = imageUrl;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
      }

      const [updated] = await Goalkeeper.update(payload, { where: { id } });

      if (!updated) return res.status(404).json({ message: 'Goalkeeper not found' });

      const updatedGoalkeeper = await Goalkeeper.findByPk(id);
      return res.json(updatedGoalkeeper);
    } catch (error) {
      console.error('Update Goalkeeper Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }


  static buildFilters(query) {
    const filters = {};

    if (query.favoriteFoot) filters.favoriteFoot = query.favoriteFoot;
    if (query.height) filters.height = query.height;
    if (query.weight) filters.weight = query.weight;
    if (query.jersey) filters.jersey = query.jersey;
    if (query.internationalCaps) filters.internationalCaps = query.internationalCaps;

    return filters;
  }
}

module.exports = GoalkeeperController;
