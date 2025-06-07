const allowedIPs = ['196.201.214.200', '196.201.214.206'];

module.exports = function verifySafaricomIP(req, res, next) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Normalize IPv6 localhost
  const normalizedIP = clientIP.replace('::ffff:', '');

  if (!allowedIPs.includes(normalizedIP)) {
    return res.status(403).json({ message: 'Forbidden: IP not allowed' });
  }

  next();
};
