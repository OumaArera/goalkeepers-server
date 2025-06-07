const expectedToken = process.env.MPESA_CALLBACK_TOKEN;

module.exports = function verifyMpesaToken(req, res, next) {
  const token = req.query.token;

  if (!token || token !== expectedToken) {
    return res.status(403).json({ message: 'Unauthorized callback' });
  }

  next();
};
