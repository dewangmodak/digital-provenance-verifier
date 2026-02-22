const rateLimit = require("express-rate-limit");

// 🔐 Auth limiter (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: {
    error: "Too many auth attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 📤 Media upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour per IP
  message: {
    error: "Upload limit reached. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  uploadLimiter,
};
