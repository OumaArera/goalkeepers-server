const express = require('express');
const TeamplayStatsController = require('../controllers/teamplayStats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const router = express.Router();

// Public routes
router.get('/', TeamplayStatsController.getAll);
router.get('/:id', TeamplayStatsController.getById);

// Protected routes (require token and role access)
router.use(authenticateToken);

router.post(
  '/',
  allowRoles('ALL_USERS'),
  TeamplayStatsController.validationRules(),
  TeamplayStatsController.create
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  TeamplayStatsController.update
);

module.exports = router;
