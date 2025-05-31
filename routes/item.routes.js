const express = require('express');
const ItemController = require('../controllers/item.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();

router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);

router.use(authenticateToken);

router.post('/', upload.single('image'),  allowRoles('ALL_USERS'), ItemController.createItem);
router.put('/:id', upload.single('image'), ItemController.updateItem);

module.exports = router;
