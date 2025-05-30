const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Public: Customer self-onboarding and login
router.post('/register', CustomerController.register);
router.post('/login', CustomerController.login);
router.post('/recover-password', CustomerController.recoverPassword);

// Protected: Must be authenticated to access or update own data
router.use(authenticateToken);

// Self-service access only: fetch or update own profile
router.get('/:customerId', (req, res, next) => {
    console.log("Stored ID: ", req.user.customerId);
    console.log("Customer ID in QP: ", req.params.customerId);
  if (Number(req.user.customerId) !== Number(req.params.customerId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.getCustomer);

router.put('/:customerId', (req, res, next) => {
  if (req.user.customerId !== req.params.customerId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.updateCustomer);

module.exports = router;
