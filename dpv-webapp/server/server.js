const logger = require("./utils/logger");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// 🛡️ NEW: Import Security Packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectMongoDB = require("./mongo");
const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");
const searchRoutes = require("./routes/search");
const verifyRoutes = require("./routes/verify");
const historyRoutes = require("./routes/history");
const errorHandler = require("./middleware/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// ==========================================
// 🛡️ SECURITY MIDDLEWARE (Must be at the top)
// ==========================================
// 1. Helmet: Secures HTTP headers (blocks XSS, hides Express usage, etc.)
app.use(helmet());

// 2. CORS
app.use(cors());

// 3. Rate Limiter: Prevents DDoS attacks and spam (100 requests per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});
// Apply the rate limiter strictly to our API routes
app.use("/api/", apiLimiter);
// ==========================================

app.use(express.json());

/* Ensure uploads folder exists */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* Routes Configuration */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/verify", verifyRoutes); 
app.use("/api/v1/history", historyRoutes);
app.use("/uploads", express.static(uploadDir));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/v1/hello:
 * get:
 * summary: Health check for the Node.js and AI servers
 * tags: [System]
 * responses:
 * 200:
 * description: Servers are alive and responding
 * 500:
 * description: AI service is down
 */

/* Test route for AI service */
app.get("/api/v1/hello", async (req, res, next) => {
  try {
    const aiResponse = await axios.get("http://localhost:8000/ai/hello");
    res.json({ webapp: "Node.js server is alive!", ai: aiResponse.data });
  } catch (error) {
    // 🟢 NEW: Route the error to our global error handler!
    next(error);
  }
});

// 🚨 CRITICAL FIX: The Error Handler MUST be the very last app.use!
app.use(errorHandler);

connectMongoDB();

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    logger.info(`🚀 Server running on port ${PORT}`)
  );
}

module.exports = app;