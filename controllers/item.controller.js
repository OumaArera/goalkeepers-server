const { validationResult } = require('express-validator');
const { Item, User } = require('../models');
const { uploadFilesToDrive } = require('../services/googleDrive.service');
const { validateSizeQuantityMatch } = require('../utils/itemValidation');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const ItemFilters = require('../filters/itemFilters');

class ItemController {
  
  static async createItem(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const itemData = { ...req.body };

      // Parse size if it's a string
      let parsedSize;
      try {
        parsedSize = typeof itemData.size === 'string'
          ? JSON.parse(itemData.size)
          : itemData.size;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON for size field' });
      }

      // Validate size and quantity match
      if (parsedSize && parsedSize.length > 0) {
        const sizeValidation = validateSizeQuantityMatch(itemData.quantity, parsedSize);
        if (!sizeValidation.isValid) {
          return res.status(400).json({ message: sizeValidation.message });
        }
      }

      // Handle image upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      // Handle promoterId
      if (itemData.promoterId === 'null' || itemData.promoterId === '') {
        itemData.promoterId = null;
      }

      // Prepare final item data
      const newItemData = {
        ...itemData,
        imageUrl,
        size: parsedSize || [],
        promoterId: itemData.promoterId || null,
        discount: itemData.discount !== undefined ? itemData.discount : 0,
        available: itemData.available !== undefined ? itemData.available : true,
      };

      const item = await Item.create(newItemData);
      return res.status(201).json({ 
        message: 'Item created successfully', 
        itemId: item.id 
      });
    } catch (error) {
      console.error('Create Item Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getItemById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const item = await Item.findByPk(id, {
        include: [{ 
          model: User, 
          as: 'promoter', 
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }]
      });

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const camelCaseItem = keysToCamel(item.toJSON());
      return res.status(200).json({ data: camelCaseItem });
    } catch (error) {
      console.error('Get Item by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllItems(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = ItemFilters.buildFilters(req.query);

      const { rows, count } = await Item.findAndCountAll({
        where: filters,
        include: [
          {
            model: User,
            as: 'promoter_',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        limit,
        offset,
        order: [['createdAt', 'ASC']],
      });

      const formatted = rows.map(item => keysToCamel(item.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Items Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateItem(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Parse size if it's provided as string
      if (updateData.size && typeof updateData.size === 'string') {
        try {
          updateData.size = JSON.parse(updateData.size);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid JSON format for size' });
        }
      }

      // Validate size and quantity match if both are provided
      if (updateData.quantity !== undefined && updateData.size) {
        const qtyInt = parseInt(updateData.quantity, 10);
        const validation = validateSizeQuantityMatch(qtyInt, updateData.size);
        if (!validation.isValid) {
          return res.status(400).json({ message: validation.message });
        }
      }

      // Handle image upload if new image is provided
      const file = req.file;
      if (file) {
        const imageUrls = await uploadFilesToDrive([file]);
        updateData.imageUrl = imageUrls[0];
      }

      // Handle promoterId
      if (updateData.promoterId === 'null' || updateData.promoterId === '') {
        updateData.promoterId = null;
      }

      const [updated] = await Item.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const updatedItem = await Item.findByPk(id, {
        include: [{ 
          model: User, 
          as: 'promoter', 
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }]
      });

      const camelCaseItem = keysToCamel(updatedItem.toJSON());
      return res.status(200).json({
        message: 'Item updated successfully',
        data: camelCaseItem
      });
    } catch (error) {
      console.error('Update Item Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = ItemController;