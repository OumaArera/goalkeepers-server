const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const { conditionalSuperuserAccess } = require('../middlewares/conditionalSuperuser.middleware');

// Authentication & Account
router.post('/register', conditionalSuperuserAccess, UserController.register);
router.post('/login', UserController.login);
router.post('/recover-password', UserController.recoverPassword);

router.use(authenticateToken);

router.get('/', allowRoles('MANAGEMENT'), UserController.getUsers);
router.get('/:userId', allowRoles('ALL_USERS'), UserController.getUser);
router.put('/:userId', allowRoles('ALL_USERS'), UserController.updateUser);

router.post('/change-password', allowRoles('ALL_USERS'), UserController.changePassword);

router.patch('/:userId/block', allowRoles('SUPERUSER'), UserController.blockUser);
router.patch('/:userId/unblock', allowRoles('SUPERUSER'), UserController.unblockUser);

module.exports = router;
