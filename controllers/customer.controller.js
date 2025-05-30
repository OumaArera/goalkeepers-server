const Customer = require('../models/customer.model');
const jwt = require('jsonwebtoken');
const TokenService = require('../utils/tokenService');
const { generateRandomPassword } = require('../utils/generateRandomPassword');
const sendMail = require('../config/mailer');
const { keysToCamel } = require('../utils/caseConverter');

class CustomerController {
  static async register(req, res) {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json({ message: 'Customer registered successfully', customerId: customer.id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { phoneNumber, password } = req.body;
      const customer = await Customer.findActiveByPhoneNumber(phoneNumber);

      if (!customer) {
        return res.status(401).json({ error: 'Customer not found or inactive' });
      }

      const isPasswordValid = await Customer.validatePassword(password, customer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload = {
        customerId: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phoneNumber: customer.phone_number,
        email: customer.email
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
      console.log("Token: ", token);
      const encryptedToken = TokenService.encrypt(token);

      res.status(200).json({ message: 'Login successful', token: encryptedToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async recoverPassword(req, res) {
    try {
      const { phoneNumber } = req.body;
      const customer = await Customer.findByPhoneNumber(phoneNumber);

      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      const newPassword = generateRandomPassword();
      await Customer.updateById(customer.id, { password: newPassword });

      await sendMail({
        to: customer.email,
        subject: 'Password Recovery',
        text: `Your new password is: ${newPassword}`
      });

      res.json({ message: 'New password sent to email' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await Customer.findById(customerId);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const sanitizedCustomer = Customer.sanitize(customer);
      const camelCaseCustomer = keysToCamel(sanitizedCustomer);
      res.json(camelCaseCustomer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const updateData = req.body;

      delete updateData.password;
      delete updateData.id;

      const updatedCustomer = await Customer.updateById(customerId, updateData);
      const sanitizedCustomer = Customer.sanitize(updatedCustomer);
      const camelCaseCustomer = keysToCamel(sanitizedCustomer);

      res.json({
        message: 'Customer updated successfully',
        customer: camelCaseCustomer
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CustomerController;
