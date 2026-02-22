// middleware/errorHandler.js
const { errorResponse } = require("../utils/responseHandler");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // 🟢 UPDATED: Specifically handle the file size limit error
  if (err.name === "MulterError") {
    let customMessage = "File upload error";
    if (err.code === "LIMIT_FILE_SIZE") {
      customMessage = "File is too large. Maximum size allowed is 5MB.";
    }
    return errorResponse(res, 400, customMessage, err.message);
  }

  // Handle files rejected by our custom fileFilter
  if (err.message.includes("Invalid file type")) {
    return errorResponse(res, 400, err.message);
  }

  if (err.code === "ER_DUP_ENTRY") {
    return errorResponse(res, 409, "Duplicate database entry detected.");
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;