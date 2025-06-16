const express = require('express');
const TicketCategoryController = require('../controllers/ticketCategory.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const TicketCategoryValidation = require('../validators/ticketCategoryValidation');
const router = express.Router();

router.get(
    '/', 
    TicketCategoryValidation.getTicketCategoriesRules(),
    TicketCategoryController.getAllTicketCategories
);

router.get(
    '/:id', 
    TicketCategoryValidation.getTicketCategoryByIdRules(),
    TicketCategoryController.getTicketCategoryById
);

router.use(authenticateToken);

router.post(
    '/', 
    TicketCategoryValidation.validationRules(),
    allowRoles('ALL_USERS'), 
    TicketCategoryController.createTicketCategory
);
router.put(
    '/:id', 
    TicketCategoryValidation.updateRules(),
    TicketCategoryController.updateTicketCategory
);

module.exports = router;
