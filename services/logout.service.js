const TokenService = require('../utils/tokenService');

class LougoutService{

    static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Authorization header missing' });
      }

      const encryptedToken = authHeader.split(' ')[1];
      const token = TokenService.decrypt(encryptedToken);

      await TokenService.invalidateToken(token);
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}
module.exports = LougoutService;

