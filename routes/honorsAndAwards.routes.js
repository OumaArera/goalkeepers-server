const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const router = express.Router();

const HonorsAndAwardsController = require('../controllers/honorsAndAwards.controller');


router.get('/', HonorsAndAwardsController.getHonors);

router.get('/:id', HonorsAndAwardsController.getHonorById);

// Protected routes
router.use(authenticateToken);
router.post(
  '/',
  allowRoles('ALL_USERS'),
  HonorsAndAwardsController.validationRules(),
  HonorsAndAwardsController.createHonor
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  HonorsAndAwardsController.updateHonor
);

module.exports = router;
