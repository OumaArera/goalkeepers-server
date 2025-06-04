const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const { conditionalSuperuserAccess } = require('../middlewares/conditionalSuperuser.middleware');

// Authentication & Account
router.post('/auth/register', conditionalSuperuserAccess, UserController.register);
router.post('/auth/login', UserController.login);
router.post('/auth/recover-password', UserController.recoverPassword);

router.use(authenticateToken);

router.get('/users', allowRoles('MANAGEMENT'), UserController.getUsers);
router.get('/users/:userId', allowRoles('ALL_USERS'), UserController.getUser);
router.put('/users/:userId', allowRoles('ALL_USERS'), UserController.updateUser);

router.post('/auth/change-password', allowRoles('ALL_USERS'), UserController.changePassword);

router.patch('/auth/:userId/block', allowRoles('SUPERUSER'), UserController.blockUser);
router.patch('/auth/:userId/unblock', allowRoles('SUPERUSER'), UserController.unblockUser);

module.exports = router;
