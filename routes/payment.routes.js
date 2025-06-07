const express = require('express');
const PaymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const PaymentValidation = require('../validators/paymentValidation');
// const verifySafaricomIP = require('../middlewares/mpesaIPWhitelist');
const verifyMpesaToken = require('../middlewares/verifyMpesaToken');

const router = express.Router();

// Callback response

router.post(
  '/mpesa/callback',
  verifyMpesaToken,
  PaymentValidation.callbackRules(),
  PaymentController.handleMpesaCallback
);

// Protect write routes
router.use(authenticateToken);

// Public GET endpoints
router.get(
  '/',
  PaymentValidation.getPaymentsRules(),
  PaymentController.getAllPayments
);

router.get(
  '/:id',
  PaymentValidation.getPaymentByIdRules(),
  PaymentController.getPaymentById
);

// POST - Create new payment
router.post(
  '/pay',
  PaymentValidation.validationRules(),
  PaymentController.createPayment
);

// PUT - Update payment by ID
router.put(
  '/:id',
  PaymentValidation.updateRules(),
  PaymentController.updatePayment
);

// DELETE - Remove payment by ID
router.delete(
  '/:id',
  PaymentValidation.deleteRules(),
  allowRoles('MANAGEMENT'),
  PaymentController.deletePayment
);

module.exports = router;