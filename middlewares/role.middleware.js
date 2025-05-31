const roleGroups = require('../permissions/roleGroups');

function allowRoles(groupName) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Forbidden: you do not have the required permissions to access this endpoint." });
    }

    const allowedRoles = roleGroups[groupName];
    if (!allowedRoles) {
      return res.status(500).json({ error: 'Internal error: undefined role group' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  };
}

module.exports = { allowRoles };
