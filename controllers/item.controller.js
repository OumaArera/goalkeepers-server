const Item = require('../models/item.model');
const { uploadFilesToDrive } = require('../services/googleDrive.service');
const { validateSizeQuantityMatch } = require('../utils/itemValidation');
const { getPagination, getPagingData } = require('../utils/pagination');
const { itemSchema } = require('../validators/itemValidator');
const { keysToCamel } = require('../utils/caseConverter');

class ItemController {
  static async createItem(req, res) {
    try {
      const validationResult = itemSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (validationResult.error) {
        const errorMessages = validationResult.error.details.map(d => d.message);
        return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
      }

      const validatedData = validationResult.value;

      let parsedSize;
      try {
        parsedSize = typeof validatedData.size === 'string'
          ? JSON.parse(validatedData.size)
          : validatedData.size;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON for size field' });
      }

      const sizeValidation = validateSizeQuantityMatch(validatedData.quantity, parsedSize);
      if (!sizeValidation.isValid) {
        return res.status(400).json({ message: sizeValidation.message });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      if (validatedData.promoterId === 'null' || validatedData.promoterId === '') {
        validatedData.promoterId = null;
      }

      const newItemData = {
        ...validatedData,
        imageUrl,
        size: parsedSize,
        team: validatedData.team || null,
        promoterId: validatedData.promoterId || null,
        discount: validatedData.discount !== undefined ? validatedData.discount : 0,
        available: validatedData.available !== undefined ? validatedData.available : true,
      };
      const newItem = await Item.createItem(newItemData);

      return res.status(201).json({
        message: 'Item created successfully',
        data: newItem,
      });

    } catch (error) {
      console.error('Create Item Error:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  }


  static async getItemById(req, res) {
      try {
        const { id } = req.params;
        const item = await Item.findItemById(id);
        return res.status(200).json({ data: item });
      } catch (error) {
        console.error('Get Item Error:', error);
        return res.status(404).json({ message: error.message });
      }
    }

    static async getAllItems(req, res) {
  try {
    const filters = req.query;
    const { limit, offset, page } = getPagination(filters);
    const pagination = { limit, offset };

    const { items, totalItems } = await Item.findAllWithFilters(filters, pagination);
    const formatted = items.map(item => keysToCamel(Item.sanitize(item)));

    const response = getPagingData(formatted, totalItems, page, limit);

    return res.status(200).json(response);
  } catch (error) {
    console.error('Get All Items Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}



  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Parse size if needed
      if (updates.size && typeof updates.size === 'string') {
        try {
          updates.size = JSON.parse(updates.size);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid JSON format for size' });
        }
      }

      // Validate quantity with size if applicable
      if (updates.quantity && updates.size) {
        const qtyInt = parseInt(updates.quantity, 10);
        const validation = validateSizeQuantityMatch(qtyInt, updates.size);
        if (!validation.isValid) {
          return res.status(400).json({ message: validation.message });
        }
      }

      // Handle image upload
      const files = req.files || [];
      if (files.length) {
        const imageUrls = await uploadFilesToDrive([files[0]]);
        updates.imageUrl = imageUrls[0];
      }

      const updatedItem = await Item.updateItemById(id, updates);
      return res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (error) {
      console.error('Update Item Error:', error);
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ItemController;
