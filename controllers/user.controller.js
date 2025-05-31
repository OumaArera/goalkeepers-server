const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { generateRandomPassword } = require('../utils/generateRandomPassword');
const TokenService = require('../utils/tokenService');
const { keysToCamel } = require('../utils/caseConverter');
const sendMail = require('../config/mailer');

class UserController {
  static async register(req, res) {
    try {
      const user = await User.createUser(req.body);
      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmailRegardlessOfStatus(email);

      if (!user) return res.status(401).json({ error: 'User not found.' });

      if (['blocked', 'suspended', 'deleted'].includes(user.status)) {
        return res.status(403).json({ error: 'Your account is not active. Please contact the system administrator for assistance.' });
      }

      const isPasswordValid = await User.validatePassword(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials.' });

      const payload = { 
        userId: user.id,  
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        email: user.email
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
      });
      const encryptedToken = TokenService.encrypt(token);

      res.status(200).json({ message: 'Login successful', token: encryptedToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      const email = req.user?.email;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });
      
      const user = await User.findByEmailRegardlessOfStatus(email);

      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await User.validatePassword(oldPassword, user.password);
      if (!isMatch) return res.status(403).json({ error: 'Old password is incorrect' });

      await User.updateById(user.id, { password: newPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async recoverPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmailRegardlessOfStatus(email);

      if (!user) return res.status(404).json({ error: 'User not found' });

      const newPassword = generateRandomPassword();
      await User.updateById(user.id, { password: newPassword });
      console.log("Pass: ", newPassword);

      await sendMail({
        to: email,
        subject: 'Password Recovery',
        text: `Your new password is: ${newPassword}`
      });

      res.json({ message: 'New password sent to email' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      await User.blockUserById(userId);
      res.json({ message: 'User blocked successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async unblockUser(req, res) {
    try {
      const { userId } = req.params;
      await User.unblockUserById(userId);
      res.json({ message: 'User unblocked successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findSafeById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const sanitizedUser = User.sanitize(user);
      const camelCaseUser = keysToCamel(sanitizedUser);
      res.json(camelCaseUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  static async getUsers(req, res) {
    try {
      const filters = {
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        email: req.query.email,
        role: req.query.role,
        department: req.query.department,
        status: req.query.status,
      };

      const users = await User.findAllWithFilters(filters);

      const sanitizedUsers = users.map(user => {
        const {
          id,
          firstName,
          lastName,
          email,
          role,
          department,
          status
        } = user;
        return { id, firstName: firstName, lastName: lastName, email, role, department, status };
      });

      res.json(sanitizedUsers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      delete updateData.password;
      delete updateData.id;

      const updatedUser = await User.updateById(userId, updateData);
      const sanitizedUser = User.sanitize(updatedUser);
      const camelCaseUser = keysToCamel(sanitizedUser);

      res.json({
        message: 'User updated successfully',
        user: camelCaseUser
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

}

module.exports = UserController;
