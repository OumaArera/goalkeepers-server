const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const DefensiveStatsController = require('../controllers/defensiveStats.controller');
const router = express.Router();

// Public endpoints
router.get('/', DefensiveStatsController.getStats);
router.get('/:id', DefensiveStatsController.getStatsById);

// Protected endpoints
router.use(authenticateToken);
router.post(
  '/',
  allowRoles('ALL_USERS'),
  DefensiveStatsController.validationRules(),
  DefensiveStatsController.createStats
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  DefensiveStatsController.updateStats
);

module.exports = router;