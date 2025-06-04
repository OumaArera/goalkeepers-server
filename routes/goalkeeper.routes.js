const express = require('express');
const GoalkeeperController = require('../controllers/goalkeeper.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();



router.get('/', GoalkeeperController.getGoalkeepers);

router.get('/:id', GoalkeeperController.getGoalkeeperById);


router.use(authenticateToken);

router.post(
  '/',
  upload.single('image'),
  allowRoles('ALL_USERS'),
  GoalkeeperController.createGoalkeeper
);


router.put(
  '/:id',
  upload.single('image'),
  allowRoles('ALL_USERS'),
  GoalkeeperController.updateGoalkeeper
);

module.exports = router;
