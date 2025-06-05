const { validationResult } = require('express-validator');
const { NewRequest } = require('../models');
const { uploadFilesToDrive } = require('../services/googleDrive.service');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const NewRequestFilters = require('../filters/newRequestFilters');

class NewRequestController {
  
  static async createNewRequest(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const requestData = { ...req.body };

      // Handle image upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      // Prepare final request data
      const newRequestData = {
        ...requestData,
        imageUrl,
        status: 'pending', 
      };

      const newRequest = await NewRequest.create(newRequestData);
      return res.status(201).json({ 
        message: 'New request created successfully', 
        requestId: newRequest.id 
      });
    } catch (error) {
      console.error('Create New Request Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'Phone number already exists',
          field: 'phoneNumber'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getNewRequestById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const newRequest = await NewRequest.findByPk(id);

      if (!newRequest) {
        return res.status(404).json({ message: 'New request not found' });
      }

      const camelCaseRequest = keysToCamel(newRequest.toJSON());
      return res.status(200).json({ data: camelCaseRequest });
    } catch (error) {
      console.error('Get New Request by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllNewRequests(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = NewRequestFilters.buildFilters(req.query);

      const { rows, count } = await NewRequest.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [['createdAt', 'ASC']],
      });

      const formatted = rows.map(request => keysToCamel(request.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All New Requests Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateNewRequest(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Handle image upload if new image is provided
      const file = req.file;
      if (file) {
        const imageUrls = await uploadFilesToDrive([file]);
        updateData.imageUrl = imageUrls[0];
      }

      const [updated] = await NewRequest.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'New request not found' });
      }

      const updatedRequest = await NewRequest.findByPk(id);
      const camelCaseRequest = keysToCamel(updatedRequest.toJSON());
      
      return res.status(200).json({
        message: 'New request updated successfully',
        data: camelCaseRequest
      });
    } catch (error) {
      console.error('Update New Request Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'Phone number already exists',
          field: 'phoneNumber'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteNewRequest(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await NewRequest.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'New request not found' });
      }

      return res.status(200).json({ message: 'New request deleted successfully' });
    } catch (error) {
      console.error('Delete New Request Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = NewRequestController;