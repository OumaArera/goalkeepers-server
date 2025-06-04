const express = require('express');
const ExperienceController = require('../controllers/experience.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// Public access
router.get('/', ExperienceController.getExperiences);
router.get('/:id', ExperienceController.getExperienceById);

// Protected routes
router.use(authenticateToken);

router.post(
  '/',
  allowRoles('ALL_USERS'),
  ExperienceController.validationRules(),
  ExperienceController.createExperience
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  ExperienceController.updateExperience
);

module.exports = router;
