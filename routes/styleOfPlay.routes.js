const express = require('express');
const StyleOfPlayController = require('../controllers/styleOfPlay.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const router = express.Router();

// Public routes
router.get('/', StyleOfPlayController.getStylesOfPlay);
router.get('/:id', StyleOfPlayController.getStyleOfPlayById);

// Protected routes
router.use(authenticateToken);

router.post(
  '/',
  allowRoles('ALL_USERS'),
  StyleOfPlayController.validationRules(),
  StyleOfPlayController.createStyleOfPlay
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  StyleOfPlayController.updateStyleOfPlay
);

module.exports = router;
