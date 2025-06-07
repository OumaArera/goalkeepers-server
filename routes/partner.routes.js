const express = require('express');
const PartnerController = require('../controllers/partner.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const PartnerValidation = require('../validators/partnerValidations');

const router = express.Router();

// Public GET endpoints
router.get(
  '/',
  PartnerValidation.getPartnersRules(),
  PartnerController.getAllPartners
);

router.get(
  '/:id',
  PartnerValidation.getPartnerByIdRules(),
  PartnerController.getPartnerById
);

// Protect write routes
router.use(authenticateToken);

// POST - Create new partner
router.post(
  '/',
  upload.single('image'),
  PartnerValidation.validationRules(),
  allowRoles('MANAGEMENT'),
  PartnerController.createPartner
);

// PUT - Update partner by ID
router.put(
  '/:id',
  upload.single('image'),
  PartnerValidation.updateRules(),
  allowRoles('MANAGEMENT'),
  PartnerController.updatePartner
);

// DELETE - Remove partner by ID
router.delete(
  '/:id',
  PartnerValidation.deleteRules(),
  allowRoles('MANAGEMENT'),
  PartnerController.deletePartner
);

module.exports = router;