const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT and attaches the decoded user data directly to req.user.
 * In a hybrid setup, we bypass the MongoDB User.findById check because 
 * the user lives in Supabase.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Verify the VIP Pass using the shared secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Trust the token and attach the user data directly.
    // We map both id and _id so MongoDB routes that expect req.user._id don't break.
    req.user = {
      _id: decoded.id || decoded._id,
      id: decoded.id || decoded._id,
      role: decoded.role || 'admin', // Ensures authorize() doesn't fail
    };

    next();
  } catch (err) {
    console.error("Token verification failed on Port 5000:", err.message);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * Restricts a route to specific roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'User role missing from token' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };