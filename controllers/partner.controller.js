const { validationResult } = require('express-validator');
const { Partner } = require('../models');
const { uploadFilesToDrive } = require('../services/googleDrive.service');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const PartnerFilters = require('../filters/partnerFilters');

class PartnerController {
  
  static async createPartner(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const partnerData = { ...req.body };

      // Handle image upload
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const imageUrls = await uploadFilesToDrive([file]);
      const imageUrl = imageUrls[0];

      // Prepare final partner data
      const newPartnerData = {
        ...partnerData,
        imageUrl,
      };

      const partner = await Partner.create(newPartnerData);
      return res.status(201).json({ 
        message: 'Partner created successfully', 
        partnerId: partner.id 
      });
    } catch (error) {
      console.error('Create Partner Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'Partner name already exists',
          field: 'name'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getPartnerById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const partner = await Partner.findByPk(id);

      if (!partner) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      const camelCasePartner = keysToCamel(partner.toJSON());
      return res.status(200).json({ data: camelCasePartner });
    } catch (error) {
      console.error('Get Partner by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllPartners(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = PartnerFilters.buildFilters(req.query);
      const sortOptions = PartnerFilters.buildSortOptions(req.query);

      const { rows, count } = await Partner.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
      });

      const formatted = rows.map(partner => keysToCamel(partner.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Partners Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updatePartner(req, res) {
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

      const [updated] = await Partner.update(updateData, { where: { id } });

      if (!updated) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      const updatedPartner = await Partner.findByPk(id);
      const camelCasePartner = keysToCamel(updatedPartner.toJSON());
      
      return res.status(200).json({
        message: 'Partner updated successfully',
        data: camelCasePartner
      });
    } catch (error) {
      console.error('Update Partner Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          message: 'Partner name already exists',
          field: 'name'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deletePartner(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await Partner.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      return res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (error) {
      console.error('Delete Partner Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = PartnerController;