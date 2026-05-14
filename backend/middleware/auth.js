const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { requireAuth };
