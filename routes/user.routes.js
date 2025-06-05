const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const { conditionalSuperuserAccess } = require('../middlewares/conditionalSuperuser.middleware');
const UserValidation = require('../validators/userValidation');

// Authentication & Account
router.post(
    '/create-user', 
    conditionalSuperuserAccess, 
    UserValidation.validationRules(), 
    UserController.register
);

router.post(
    '/auth/login', 
    UserValidation.loginValidationRules(), 
    UserController.login
);

router.post(
    '/auth/recover-password', 
    UserValidation.recoverPasswordValidationRules(),
    UserController.recoverPassword
);

router.use(authenticateToken);

router.get(
    '/', 
    allowRoles('MANAGEMENT'), 
    UserController.getUsers
);

router.get(
    '/:userId', 
    allowRoles('ALL_USERS'), 
    UserController.getUserById
);

// router.put(
//     '/users/:userId', 
//     allowRoles('ALL_USERS'),
//     UserValidation.updateRules(),
//     UserController.updateUser
// );

router.put('/users/:userId', (req, res, next) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
  }, 
  UserValidation.updateRules(),
  UserController.updateUser
);

router.post(
    '/auth/change-password', 
    allowRoles('ALL_USERS'), 
    UserValidation.passwordValidationRules(), 
    UserController.changePassword
);

router.patch(
    '/auth/:userId/block', 
    allowRoles('SUPERUSER'), 
    UserController.blockUser
);

router.patch(
    '/auth/:userId/unblock', 
    allowRoles('SUPERUSER'), 
    UserController.unblockUser
);

module.exports = router;
