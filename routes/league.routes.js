const express = require('express');
const LeagueController = require('../controllers/league.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const LeagueValidation = require('../validators/leagueValidations');

const router = express.Router();

// Public GET endpoints
router.get(
  '/',
  LeagueValidation.getLeaguesRules(),
  LeagueController.getAllLeagues
);

router.get(
  '/:id',
  LeagueValidation.getLeagueByIdRules(),
  LeagueController.getLeagueById
);

// Protect write routes
router.use(authenticateToken);

// POST - Create new league
router.post(
  '/',
  LeagueValidation.validationRules(),
  allowRoles('MANAGEMENT'),
  LeagueController.createLeague
);

// PUT - Update league by ID
router.put(
  '/:id',
  LeagueValidation.updateRules(),
  allowRoles('MANAGEMENT'),
  LeagueController.updateLeague
);

// DELETE - Remove league by ID
router.delete(
  '/:id',
  LeagueValidation.deleteRules(),
  allowRoles('MANAGEMENT'),
  LeagueController.deleteLeague
);

module.exports = router;