// utils/logger.js
const winston = require("winston");
const { combine, timestamp, printf, colorize } = winston.format;

// Define how we want our logs to look
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // This will save only ERROR logs to a file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // This will save ALL logs (info, warnings, errors) to a file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we are not in production, also print to the console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

module.exports = logger;