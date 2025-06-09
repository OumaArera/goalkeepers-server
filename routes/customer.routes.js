const express = require('express');
const CustomerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const CustomerValidation = require('../validators/customerValidation');
const LogoutService = require('../services/logout.service');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const TokenService = require('../utils/tokenService');

const router = express.Router();


// Google Auth 2.0 routes

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login', 
  session: false,
}), (req, res) => {
  const customer = req.user;
  const payload = {
    customerId: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phoneNumber: customer.phoneNumber,
    email: customer.email
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  console.log("Token: ", token);
  const encryptedToken = TokenService.encrypt(token);

  // Redirect with token or return it
  res.redirect(`http://localhost:3000/auth/success?token=${encodeURIComponent(encryptedToken)}`);
});



// Public routes - NO authentication required
router.post(
  '/auth/signup',
  CustomerValidation.validationRules(),
  CustomerController.register
);

router.post(
  '/auth/signin', 
  CustomerValidation.loginValidationRules(), 
  CustomerController.login
);

router.post(
    '/auth/logout',
    LogoutService.logout
);

router.post(
  '/auth/recover-password',
  CustomerValidation.recoverPasswordValidationRules(),
  CustomerController.recoverPassword
);

// Apply authentication middleware to all routes below this point
router.use(authenticateToken);

// Protected routes - authentication required
router.get(
  '/',
  allowRoles('ALL_USERS'),
  CustomerController.getCustomers
);

router.post(
  '/auth/change-password',
  CustomerValidation.passwordValidationRules(),
  CustomerController.changePassword
);

// Specific routes should come before parameterized routes
router.get('/:customerId', (req, res, next) => {
  const isOwner = req.user.customerId === req.params.customerId;
  if (!isOwner && !allowRoles('ALL_USERS')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.getCustomerById);

router.put('/:customerId', (req, res, next) => {
  const isOwner = req.user.customerId === req.params.customerId;
  if (!isOwner && !allowRoles('MANAGEMENT')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.updateCustomer);

module.exports = router;