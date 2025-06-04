const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const DisciplineRecordsController = require('../controllers/disciplineRecord.controller');

const router = express.Router();

router.get('/', DisciplineRecordsController.getRecords);
router.get('/:id', DisciplineRecordsController.getRecordById);

// Protected routes
router.use(authenticateToken);
router.post(
  '/',
  allowRoles('ALL_USERS'),
  DisciplineRecordsController.validationRules(),
  DisciplineRecordsController.createRecord
);

router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  DisciplineRecordsController.updateRecord
);

module.exports = router;