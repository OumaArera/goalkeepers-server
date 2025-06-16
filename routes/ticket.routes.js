const express = require('express');
const TicketController = require('../controllers/ticket.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const TicketValidation = require('../validators/ticketValidation');
const router = express.Router();

// Public routes (no authentication required)

router.get(
    '/number/:ticketNumber', 
    TicketValidation.getTicketByNumberRules(),
    TicketController.getTicketByNumber
);

// Public ticket verification endpoint (for scanning)
router.post(
    '/verify',
    TicketValidation.verifyTicketRules(),
    TicketController.verifyTicket
);

// Public QR code scanning endpoint
router.post(
    '/scan',
    TicketController.scanTicket
);

router.post(
    '/', 
    TicketValidation.validationRules(),
    TicketController.createTicket
);

// Protected routes (authentication required)
router.use(authenticateToken);

router.get(
    '/:id', 
    TicketValidation.getTicketByIdRules(),
    allowRoles(['ALL_USERS']), 
    TicketController.getTicketById
);

router.get(
    '/', 
    TicketValidation.getTicketsRules(),
    allowRoles(['ALL_USERS']), 
    TicketController.getAllTickets
);


// Update ticket - admin or ticket owner
router.put(
    '/:id', 
    TicketValidation.updateRules(),
    allowRoles(['ALL_USERS']), 
    TicketController.updateTicket
);

// Delete ticket - admin only
router.delete(
    '/:id',
    TicketValidation.deleteRules(),
    allowRoles(['MANAGEMENT']),
    TicketController.deleteTicket
);

// Use ticket - staff only (for event entry)
router.patch(
    '/:id/use',
    TicketValidation.getTicketByIdRules(),
    allowRoles(['ALL_USERS']),
    TicketController.useTicket
);

// Get tickets by event - useful for event organizers
router.get(
    '/event/:eventId',
    TicketValidation.getTicketsRules(),
    allowRoles(['ALL_USERS']),
    TicketController.getAllTickets
);


module.exports = router;