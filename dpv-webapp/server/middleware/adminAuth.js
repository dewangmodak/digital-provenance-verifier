// server/middleware/adminAuth.js
module.exports = (req, res, next) => {
  // The 'auth' middleware runs before this and sets req.user
  if (req.user && req.user.role === 'admin') {
    next(); // Pass the security check!
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Admin privileges required." 
    });
  }
};