// middleware/upload.js
const multer = require("multer");
const path = require("path");

// 1. Configure where and how to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Give the file a unique name to prevent overwriting
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. Create the file validation filter
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  
  // Check extension
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // File is good!
  } else {
    // 3. Throw a clean error if the file is invalid
    const error = new Error("Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.");
    error.statusCode = 400; // Bad Request
    return cb(error, false);
  }
};

// 4. Combine them into the final upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit (in bytes)
  },
  fileFilter: fileFilter,
});

module.exports = upload;