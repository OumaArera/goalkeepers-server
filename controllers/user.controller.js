const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { generateRandomPassword } = require('../utils/generateRandomPassword');
const TokenService = require('../utils/tokenService');
const { keysToCamel } = require('../utils/caseConverter');
const sendMail = require('../config/mailer');
const { getPagination, getPagingData } = require('../utils/pagination');
const UserFilters = require('../filters/userFilters');

class UserController {
  
  static async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.create(req.body);
      return res.status(201).json({ 
        message: 'User created successfully', 
        userId: user.id 
      });
    } catch (error) {
      console.error('Register Error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          message: 'User already exists with this email, phone number, or ID' 
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
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (['blocked', 'suspended', 'deleted'].includes(user.status)) {
        return res.status(403).json({ 
          message: 'Your account is not active. Please contact the system administrator for assistance.' 
        });
      }

      const isPasswordValid = await User.validatePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const payload = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        email: user.email
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
      console.log("Token: ", token);
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
      const email = req.user?.email;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await User.validatePassword(oldPassword, user.password);
      if (!isMatch) {
        return res.status(403).json({ message: 'Old password is incorrect' });
      }

      await user.update({ password: newPassword });
      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async recoverPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newPassword = generateRandomPassword();
      await user.update({ password: newPassword });
      
      console.log("New Password:", newPassword);

      await sendMail({
        to: email,
        subject: 'Password Recovery',
        text: `Your new password is: ${newPassword}`
      });

      return res.json({ message: 'New password sent to email' });
    } catch (error) {
      console.error('Recover Password Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const [updated] = await User.update(
        { status: 'blocked' }, 
        { where: { id: userId } }
      );

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ message: 'User blocked successfully' });
    } catch (error) {
      console.error('Block User Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async unblockUser(req, res) {
    try {
      const { userId } = req.params;
      const [updated] = await User.update(
        { status: 'active' }, 
        { where: { id: userId } }
      );

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Unblock User Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const camelCaseUser = keysToCamel(user.toJSON());
      return res.json(camelCaseUser);
    } catch (error) {
      console.error('Get User by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getUsers(req, res) {
    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = UserFilters.buildFilters(req.query);

      const { rows, count } = await User.findAndCountAll({
        where: filters,
        attributes: { exclude: ['password', 'dateOfBirth', 'nationalIdOrPassportNo', 'phonenumber', 'avatar', 'middleNames'] },
        limit,
        offset,
        order: [['createdAt', 'ASC']],
      });

      const response = getPagingData(rows, count, page, limit);
      return res.json(response);
    } catch (error) {
      console.error('Get Users Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = { ...req.body };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.id;

      const [updated] = await User.update(updateData, { where: { id: userId } });

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      const camelCaseUser = keysToCamel(updatedUser.toJSON());
      return res.json({
        message: 'User updated successfully',
        user: camelCaseUser
      });
    } catch (error) {
      console.error('Update User Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = UserController;