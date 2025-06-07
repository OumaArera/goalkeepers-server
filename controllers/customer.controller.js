const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');
const { generateRandomPassword } = require('../utils/generateRandomPassword');
const TokenService = require('../utils/tokenService');
const { keysToCamel } = require('../utils/caseConverter');
const sendMail = require('../config/mailer');
const { getPagination, getPagingData } = require('../utils/pagination');
const CustomerFilters = require('../filters/customerFilters');

class CustomerController {
  static async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = await Customer.create(req.body);
      return res.status(201).json({ 
        message: 'Customer registered successfully', 
        customerId: customer.id 
      });
    } catch (error) {
      console.error('Register Error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          message: 'Customer already exists with this email or phone number' 
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber, password } = req.body;
      const customer = await Customer.findOne({ where: { phoneNumber } });

      if (!customer) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (['blocked', 'suspended', 'deleted'].includes(customer.status)) {
        return res.status(403).json({ 
          message: 'Your account is not active. Please contact support for assistance.' 
        });
      }

      const isPasswordValid = await Customer.validatePassword(password, customer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const payload = {
        customerId: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        email: customer.email
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
      // console.log("Token: ", token)
      const encryptedToken = TokenService.encrypt(token);

      return res.status(200).json({ 
        message: 'Login successful', 
        token: encryptedToken 
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { oldPassword, newPassword } = req.body;
      const phoneNumber = req.user?.phoneNumber;

      if (!phoneNumber) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const customer = await Customer.findOne({ where: { phoneNumber } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const isMatch = await Customer.validatePassword(oldPassword, customer.password);
      if (!isMatch) {
        return res.status(403).json({ message: 'Old password is incorrect' });
      }

      await customer.update({ password: newPassword });
      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async recoverPassword(req, res) {
    try {
      const { phoneNumber } = req.body;
      const customer = await Customer.findOne({ where: { phoneNumber } });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (!customer.email) {
        return res.status(400).json({ 
          message: 'No email address associated with this account' 
        });
      }

      const newPassword = generateRandomPassword();
      await customer.update({ password: newPassword });
      
      console.log("New Password:", newPassword);

      await sendMail({
        to: customer.email,
        subject: 'Password Recovery',
        text: `Your new password is: ${newPassword}`
      });

      return res.json({ message: 'New password sent to email' });
    } catch (error) {
      console.error('Recover Password Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async blockCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const [updated] = await Customer.update(
        { status: 'blocked' }, 
        { where: { id: customerId } }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.json({ message: 'Customer blocked successfully' });
    } catch (error) {
      console.error('Block Customer Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async unblockCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const [updated] = await Customer.update(
        { status: 'active' }, 
        { where: { id: customerId } }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.json({ message: 'Customer unblocked successfully' });
    } catch (error) {
      console.error('Unblock Customer Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getCustomerById(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await Customer.findByPk(customerId, {
        attributes: { exclude: ['password'] }
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const camelCaseCustomer = keysToCamel(customer.toJSON());
      return res.json(camelCaseCustomer);
    } catch (error) {
      console.error('Get Customer by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getCustomers(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = CustomerFilters.buildFilters(req.query);

      const { rows, count } = await Customer.findAndCountAll({
        where: filters,
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get Customers Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const updateData = { ...req.body };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.id;

      const [updated] = await Customer.update(updateData, { where: { id: customerId } });

      if (!updated) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const updatedCustomer = await Customer.findByPk(customerId, {
        attributes: { exclude: ['password'] }
      });

      const camelCaseCustomer = keysToCamel(updatedCustomer.toJSON());
      return res.json({
        message: 'Customer updated successfully',
        customer: camelCaseCustomer
      });
    } catch (error) {
      console.error('Update Customer Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = CustomerController;