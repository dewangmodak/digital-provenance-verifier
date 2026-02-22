// middleware/authorize.js
const { errorResponse } = require("../utils/responseHandler");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by your existing 'auth' middleware
    if (!req.user || !req.user.role) {
      return errorResponse(res, 403, "Access denied. Role not found.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res, 
        403, 
        `Access denied. Requires one of these roles: ${allowedRoles.join(", ")}`
      );
    }

    next(); // User has the right role, let them through!
  };
};

module.exports = authorize;