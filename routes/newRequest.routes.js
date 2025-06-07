const express = require('express');
const NewRequestController = require('../controllers/newRequest.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const NewRequestValidation = require('../validators/newRequestValidations');

const router = express.Router();

// Public GET endpoints
router.get(
  '/',
  NewRequestValidation.getNewRequestsRules(),
  NewRequestController.getAllNewRequests
);

router.get(
  '/:id',
  NewRequestValidation.getNewRequestByIdRules(),
  NewRequestController.getNewRequestById
);

router.post(
  '/',
  upload.single('image'),
  NewRequestValidation.validationRules(),
  NewRequestController.createNewRequest
);

// Protect write routes
router.use(authenticateToken);

// PUT - Update request by ID
router.put(
  '/:id',
  upload.single('image'),
  NewRequestValidation.updateRules(),
  allowRoles('ALL_USERS'),
  NewRequestController.updateNewRequest
);

// DELETE - Remove request by ID
router.delete(
  '/:id',
  NewRequestValidation.getNewRequestByIdRules(),
  allowRoles('ALL_USERS'),
  NewRequestController.deleteNewRequest
);

module.exports = router;
