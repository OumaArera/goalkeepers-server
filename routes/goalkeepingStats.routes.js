const express = require('express');
const GoalkeepingStatsController = require('../controllers/goalkeepingStats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// Public routes
router.get('/', GoalkeepingStatsController.getGoalkeepingStats);
router.get('/:id', GoalkeepingStatsController.getGoalkeepingStatsById);

// Protected routes (require token and role access)
router.use(authenticateToken);

router.post(
  '/',
  allowRoles('ALL_USERS'),
  GoalkeepingStatsController.validationRules(),
  GoalkeepingStatsController.createGoalkeepingStats
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  GoalkeepingStatsController.updateGoalkeepingStats
);

module.exports = router;
