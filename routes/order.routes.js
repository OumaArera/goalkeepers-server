const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const OrderValidation = require('../validators/orderValidation');

const router = express.Router();

// Protect write routes
router.use(authenticateToken);

// Public GET endpoints
router.get(
  '/',
  OrderValidation.getOrdersRules(),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  OrderValidation.getOrderByIdRules(),
  OrderController.getOrderById
);

// POST - Create new order
router.post(
  '/',
  OrderValidation.validationRules(),
  OrderController.createOrder
);

// PUT - Update order by ID
router.put(
  '/:id',
  OrderValidation.updateRules(),
  OrderController.updateOrder
);

// DELETE - Remove order by ID
router.delete(
  '/:id',
  OrderValidation.deleteRules(),
  allowRoles('MANAGEMENT'),
  OrderController.deleteOrder
);

module.exports = router;