const express = require('express');
const ItemController = require('../controllers/item.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const ItemValidation = require('../validators/itemValidations');
const router = express.Router();

router.get(
    '/', 
    ItemValidation.getItemsRules(),
    ItemController.getAllItems
);

router.get(
    '/:id', 
    ItemValidation.getItemByIdRules(),
    ItemController.getItemById
);

router.use(authenticateToken);

router.post(
    '/', 
    upload.single('image'),
    ItemValidation.validationRules(),
    allowRoles('ALL_USERS'), 
    ItemController.createItem
);
router.put(
    '/:id', 
    upload.single('image'), 
    ItemValidation.updateRules(),
    ItemController.updateItem
);

module.exports = router;
