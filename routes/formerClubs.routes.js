const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const FormerClubController = require('../controllers/formerClubs.controller');

const router = express.Router();

router.get('/', FormerClubController.getFormerClubs);
router.get('/:id', FormerClubController.getFormerClubById);

router.use(authenticateToken);
router.post(
  '/',
  allowRoles('ALL_USERS'),
  FormerClubController.validationRules(),
  FormerClubController.createFormerClub
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  FormerClubController.updateFormerClub
);

module.exports = router;