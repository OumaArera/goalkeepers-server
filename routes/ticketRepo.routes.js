const express = require('express');
const TicketController = require('../controllers/ticketRepo.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const TicketValidation = require('../validators/ticketRepoValidation');
const router = express.Router();

router.get(
    '/', 
    TicketValidation.getTicketsRules(),
    TicketController.getAllTickets
);

router.get(
    '/:id', 
    TicketValidation.getTicketByIdRules(),
    TicketController.getTicketById
);

router.use(authenticateToken);

router.post(
    '/', 
    upload.single('image'),
    TicketValidation.validationRules(),
    allowRoles('ALL_USERS'), 
    TicketController.createTicket
);
router.put(
    '/:id', 
    upload.single('image'), 
    TicketValidation.updateRules(),
    TicketController.updateTicket
);

module.exports = router;
