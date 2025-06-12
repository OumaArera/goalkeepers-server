const express = require('express');
const CartController = require('../controllers/cart.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const CartValidation = require('../validators/cartValidation');

const router = express.Router();

// Protect write routes
router.use(authenticateToken);


// Public GET endpoints
router.get(
  '/',
  CartValidation.getCartItemsRules(),
  CartController.getAllCartItems
);

router.get(
  '/:id',
  CartValidation.getCartItemByIdRules(),
  CartController.getCartItemById
);

// POST - Create new order
router.post(
  '/',
  CartValidation.addToCartRules(),
  CartController.addItemToCart
);

// PUT - Update order by ID
router.put(
  '/:id',
  CartValidation.updateCartItemRules(),
  CartController.updateCartItem
);


module.exports = router;