const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

// Public: Customer self-onboarding and login
router.post('/register', CustomerController.register);
router.post('/login', CustomerController.login);
router.post('/recover-password', CustomerController.recoverPassword);

// Protected: Must be authenticated to access or update own data
router.use(authenticateToken);

router.get('/', allowRoles('MANAGEMENT'), CustomerController.getAllCustomers);
router.post('/change-password', CustomerController.changePassword);

// Self-service access only: fetch or update own profile
router.get('/:customerId', (req, res, next) => {
  if (Number(req.user.customerId) !== Number(req.params.customerId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.getCustomer);

router.put('/:customerId', (req, res, next) => {
  if (Number(req.user.customerId) !== Number(req.params.customerId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, CustomerController.updateCustomer);

module.exports = router;
