// middleware/auth.js
const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHandler");

module.exports = (req, res, next) => {
  // 1. Get the token from the header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return errorResponse(res, 401, "No token, authorization denied");
  }

  // 2. Extract token (handles "Bearer <token>" format)
  const token = authHeader.replace("Bearer ", "");

  try {
    // 3. Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🟢 THE FIX IS HERE: Assign the whole decoded object so `role` comes with it!
    req.user = decoded; 
    
    next();
  } catch (err) {
    return errorResponse(res, 401, "Token is not valid");
  }
};