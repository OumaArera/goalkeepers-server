const express = require('express');
const KplRecordController = require('../controllers/kplRecord.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const router = express.Router();

router.get('/', KplRecordController.getKplRecords);
router.get('/:id', KplRecordController.getKplRecordById);

// Protected routes (require token and role access)
router.use(authenticateToken);

router.post(
  '/',
  allowRoles('ALL_USERS'),
  KplRecordController.validationRules(),
  KplRecordController.createKplRecord
);


router.put(
  '/:id',
  allowRoles('ALL_USERS'),
  KplRecordController.updateKplRecord
);

module.exports = router;
