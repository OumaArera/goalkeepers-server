const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const TokenService = require('../utils/tokenService');

const conditionalSuperuserAccess = async (req, res, next) => {
  try {
    const superusers = await User.findAll({ role: 'superuser', status: 'active' });

    if (superusers.length === 0) {
      return next();
    }

    // Else: there is an active superuser — require token and superuser role
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required: superuser exists' });
    }

    const token = authHeader.split(' ')[1];
    const decryptedToken = TokenService.decrypt(token);
    const decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET);

    if (decoded.role !== 'superuser') {
      return res.status(403).json({ error: 'Only superusers can register users now' });
    }

    // Attach user to request if needed
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal error in access control' });
  }
};

module.exports = { conditionalSuperuserAccess };
